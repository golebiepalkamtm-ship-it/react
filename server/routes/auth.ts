import express, { type Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { supabase } from '../lib/db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { calculateRole, UserWithVerifications } from '../types/roles.js';
import { wsTicketService } from '../services/WebSocketTicketService.js';
import { smsService } from '../lib/sms.js';
import { validatedEnv } from '../lib/env.js';

const router: Router = express.Router();

// Schematy walidacji
const phoneSchema = z.object({
  phone: z.string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in E.164 format (e.g., +48123456789)')
});

const otpVerifySchema = z.object({
  phone: z.string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in E.164 format (e.g., +48123456789)'),
  code: z.string()
    .regex(/^\d{6}$/, 'Verification code must be exactly 6 digits')
});

const otpSendLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

const otpVerifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Wysyła kod weryfikacyjny OTP na podany numer telefonu (używa Twilio)
 */
router.post('/otp/send', authMiddleware, validate(phoneSchema), otpSendLimiter, async (req: AuthenticatedRequest, res) => {
  try {
    const { phone } = req.body;

    const success = await smsService.sendVerificationCode(phone);
    if (success) {
      res.json({ message: 'Verification code sent' });
    } else {
      res.status(500).json({ error: 'Failed to send verification code' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Weryfikuje kod OTP i aktualizuje status telefonu użytkownika
 */
router.post('/otp/verify', authMiddleware, validate(otpVerifySchema), otpVerifyLimiter, async (req: AuthenticatedRequest, res) => {
  try {
    const { phone, code } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!supabase) {
      console.error('Supabase client not initialized');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const isValid = await smsService.verifyCode(phone, code);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // 1. Update auth.users to trigger handle_phone_confirmation
    // This requires Service Role Key access which the server instance should have
    const { error: authError } = await supabase!.auth.admin.updateUserById(
      userId,
      {
        phone,
        phone_confirm: true
      }
    );

    if (authError) {
      console.error('Error updating auth user:', authError);
      return res.status(500).json({ error: 'Failed to update auth user' });
    }

    // 2. Update public profile directly as a backup/ensure immediate consistency
    const { error: profileError } = await supabase!
      .from('users')
      .update({ 
        phone,
        updated_at: new Date().toISOString() 
      } as any)
      .eq('id', userId);

    if (profileError) throw profileError;

    res.json({ success: true, message: 'Phone verified successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Zwraca profil aktualnie zalogowanego użytkownika z weryfikacją roli
 */
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    
    // Pobierz dane użytkownika z auth.users i public.users
    const { data: authUser, error: authError } = await supabase!.auth.admin.getUserById(req.user.id);
    if (authError || !authUser.user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { data: profile, error: profileError } = await supabase!
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    // Oblicz rolę używając wspólnej logiki
    const userWithVerifications: UserWithVerifications = {
      id: authUser.user.id,
      email: authUser.user.email,
      email_confirmed_at: authUser.user.email_confirmed_at,
      phone: authUser.user.phone,
      phone_confirmed_at: authUser.user.phone_confirmed_at,
      role: profile?.role
    };

    const calculatedRole = calculateRole(userWithVerifications);

    // Zwróć pełny profil z obliczoną rolą
    const response = {
      ...profile,
      email: authUser.user.email,
      phone: authUser.user.phone,
      email_confirmed_at: authUser.user.email_confirmed_at,
      phone_confirmed_at: authUser.user.phone_confirmed_at,
      role: calculatedRole // Single source of truth
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error in /me endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generuje jednorazowy ticket do połączenia WebSocket (CSRF/CSWSH protection)
 * SECURITY: Ticket jest ważny tylko 30 sekund i może być użyty tylko raz
 */
router.post('/ws-ticket', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const ticket = wsTicketService.generateTicket(
      req.user.id,
      req.user.email,
      req.user.role
    );

    res.json({ 
      ticket,
      expiresIn: 30 // seconds
    });
  } catch (error: any) {
    console.error('Error generating WebSocket ticket:', error);
    res.status(500).json({ error: 'Failed to generate ticket' });
  }
});

/**
 * Weryfikacja statusu autoryzacji (health check dla auth)
 */
router.get('/status', async (req, res) => {
  try {
    const { data, error } = await supabase!.auth.getSession();
    res.json({ 
      configured: !!supabase,
      url: validatedEnv.SUPABASE_URL,
      hasSession: !!data.session,
      error: error?.message || null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
