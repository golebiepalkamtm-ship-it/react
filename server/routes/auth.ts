/**
 * Auth Routes
 *
 * Endpointy obsługujące synchronizację użytkowników Supabase Auth
 * z lokalną bazą danych (Prisma).
 *
 * Auth flow:
 * 1. Frontend → Supabase Auth SDK (signIn/signUp/OAuth)
 * 2. Supabase wydaje JWT
 * 3. Frontend wysyła JWT do backendu w nagłówku Authorization
 * 4. authMiddleware weryfikuje JWT i ustawia req.user
 * 5. Te endpointy synchronizują profil użytkownika z bazą
 */

import express, { type Router, type Response } from "express";
import {
  authMiddleware,
  type AuthenticatedRequest,
} from "../middleware/auth.js";
import { resetLimiter, loginLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validation.js";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import { smsService } from "../services/SmsService.js";

const router: Router = express.Router();

// Stub login endpoint (rate-limited) — frontend uses Supabase, so we return 501 but keep limiter
router.post(
  "/login",
  loginLimiter,
  validate(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }),
    { sanitize: true },
  ),
  (_req, res) => {
    res.status(501).json({ error: "Login handled via Supabase SDK" });
  },
);

// Stub reset password endpoint (rate-limited)
router.post(
  "/reset-password",
  resetLimiter,
  validate(z.object({ email: z.string().email() }), { sanitize: true }),
  (_req, res) => {
    res
      .status(501)
      .json({ error: "Password reset handled via Supabase auth flow" });
  },
);

/**
 * POST /api/auth/sync
 * Synchronizuje użytkownika Supabase z bazą Prisma.
 * Wywoływany po zalogowaniu, aby upewnić się, że profil istnieje.
 */
router.post(
  "/sync",
  loginLimiter,
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const email = req.user?.email;

      if (!userId) {
        return res.status(401).json({ error: "Brak autoryzacji." });
      }

      if (!prisma) {
        return res.status(500).json({ error: "Baza danych niedostępna." });
      }

      // Upsert — tworzy profil jeśli nie istnieje, aktualizuje email jeśli się zmienił
      const user = await prisma.user.upsert({
        where: { id: userId },
        update: {
          email: email || undefined,
          updatedAt: new Date(),
        },
        create: {
          id: userId,
          email: email || "",
          username: email?.split("@")[0] || `user_${userId.slice(0, 8)}`,
          role: "USER_REGISTERED",
          trustScore: 0,
        },
      });

      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
      });
    } catch (error) {
      console.error("Auth sync error:", error);
      res
        .status(500)
        .json({ error: "Wystąpił błąd podczas synchronizacji profilu." });
    }
  },
);

/**
 * GET /api/auth/me
 * Zwraca dane aktualnie zalogowanego użytkownika.
 */
router.get(
  "/me",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Brak autoryzacji." });
      }

      if (!prisma) {
        return res.status(500).json({ error: "Baza danych niedostępna." });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          first_name: true,
          last_name: true,
          phone: true,
          role: true,
          trustScore: true,
          createdAt: true,
          street: true,
          city: true,
          postal_code: true,
          country: true,
        },
      });

      if (!user) {
        return res
          .status(404)
          .json({ error: "Profil użytkownika nie został znaleziony." });
      }

      res.json(user);
    } catch (error) {
      console.error("Auth me error:", error);
      res
        .status(500)
        .json({ error: "Wystąpił błąd podczas pobierania profilu." });
    }
  },
);

/**
 * DELETE /api/auth/account
 * Pozwala użytkownikowi usunąć swoje konto.
 */
router.delete(
  "/account",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Brak autoryzacji." });
      }

      if (!prisma) {
        return res.status(500).json({ error: "Baza danych niedostępna." });
      }

      // Sprawdź czy użytkownik nie ma aktywnych aukcji
      const activeAuctions = await prisma.auction.count({
        where: {
          sellerId: userId,
          status: "ACTIVE",
        },
      });

      if (activeAuctions > 0) {
        return res.status(400).json({
          error:
            "Nie można usunąć konta z aktywnymi aukcjami. Najpierw zakończ wszystkie aukcje.",
        });
      }

      await prisma.user.delete({ where: { id: userId } });

      res.json({ success: true, message: "Konto zostało usunięte." });
    } catch (error) {
      console.error("Account deletion error:", error);
      res.status(500).json({ error: "Wystąpił błąd podczas usuwania konta." });
    }
  },
);

/**
 * POST /api/auth/otp/send
 * Wysyła kod weryfikacyjny SMS
 */
router.post(
  "/otp/send",
  authMiddleware,
  validate(
    z.object({
      phone: z.string().trim().min(5).regex(/^\+?[\d\s\-()]+$/, {
        message: "Nieprawidłowy numer telefonu.",
      }),
    }),
    { sanitize: true },
  ),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { phone } = req.body;
      await smsService.sendVerificationCode(phone);
      res.json({ success: true, message: "Kod SMS został wysłany." });
    } catch (error: any) {
      console.error("OTP send error:", error);
      res.status(500).json({ error: error.message || "Błąd wysyłania SMS." });
    }
  },
);

/**
 * POST /api/auth/otp/verify
 * Weryfikuje kod SMS i aktualizuje profil
 */
router.post(
  "/otp/verify",
  authMiddleware,
  validate(
    z.object({
      phone: z.string().trim().min(5).regex(/^\+?[\d\s\-()]+$/, {
        message: "Nieprawidłowy numer telefonu.",
      }),
      code: z.string().trim().min(4).max(12),
    }),
    { sanitize: true },
  ),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { phone, code } = req.body;

      if (!userId) {
        return res
          .status(401)
          .json({ error: "Brak wymaganych danych (ID, telefon lub kod)." });
      }

      const isValid = await smsService.verifyCode(phone, code);
      if (!isValid) {
        console.warn(
          `[OTP] Invalid code attempt for user ${userId} / ${phone}`,
        );
        return res
          .status(400)
          .json({ error: "Nieprawidłowy lub wygasły kod weryfikacyjny." });
      }

      console.log(`[OTP] Code approved for ${userId}, updating database...`);

      // Aktualizacja w bazie danych Prisma
      await prisma.user.update({
        where: { id: userId },
        data: {
          phone,
          role: "USER_FULL_VERIFIED", // Zakładamy że po SMS ma pełną weryfikację
          updatedAt: new Date(),
        },
      });

      console.log(
        `[OTP] Database updated for ${userId}. Verification complete.`,
      );
      res.json({ success: true, message: "Telefon zweryfikowany pomyślnie!" });
    } catch (error: any) {
      console.error("OTP verify error:", error);
      res.status(500).json({ error: error.message || "Błąd weryfikacji SMS." });
    }
  },
);

export default router;
