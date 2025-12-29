// src/components/auth/PhoneVerification.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useLocale } from '@/contexts/LocaleContext';
import { toast } from '@/components/ui/sonner';

interface PhoneVerificationProps {
  onVerified: () => void;
  initialPhone?: string;
  lockPhone?: boolean;
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({ onVerified, initialPhone, lockPhone }) => {
  const { t } = useLocale();
  const [phone, setPhone] = useState(initialPhone ?? '');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, updateProfile } = useAuth();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.auth.updateUser({
        phone,
      });

      if (error) throw error;

      // Send OTP
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (otpError) throw otpError;

      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      // Update profile with phone and role
      await updateProfile({
        phone,
        role: 'USER_FULL_VERIFIED',
      });

      toast(t('phone.verified'));
      onVerified();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');

    try {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8"
    >
      <h2 className="text-2xl font-bold text-white text-center mb-6">
        {step === 'phone' ? t('phone.title') : t('phone.code_title')}
      </h2>

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <input
            type="tel"
            placeholder={t('phone.placeholder')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            readOnly={!!lockPhone}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            required
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#D4AF37] text-[#00172D] font-semibold rounded-lg hover:bg-[#B8942A] transition-colors disabled:opacity-50"
          >
            {loading ? t('phone.sending') : t('phone.send')}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <input
            type="text"
            placeholder={t('phone.code_placeholder')}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-center text-2xl tracking-widest"
            maxLength={6}
            required
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#D4AF37] text-[#00172D] font-semibold rounded-lg hover:bg-[#B8942A] transition-colors disabled:opacity-50"
          >
            {loading ? t('phone.verifying') : t('phone.verify')}
          </button>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={loading}
            className="w-full py-2 text-[#D4AF37] hover:underline disabled:opacity-50"
          >
            {t('phone.resend')}
          </button>
        </form>
      )}
    </motion.div>
  );
};

export default PhoneVerification;