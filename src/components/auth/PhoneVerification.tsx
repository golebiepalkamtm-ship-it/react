// src/components/auth/PhoneVerification.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Send, Shield, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { UnifiedModal } from '@/components/ui/UnifiedModal';
import { apiClient } from '@/services/api';

interface PhoneVerificationProps {
  onVerified: () => void;
  initialPhone?: string;
  lockPhone?: boolean;
  embedded?: boolean;
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({ onVerified, initialPhone, lockPhone, embedded = false }) => {
  const { t } = useLocale();
  const [phone, setPhone] = useState(initialPhone ?? '');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateProfile, profile, user, session } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  useEffect(() => {
    setPhone(initialPhone ?? '');
  }, [initialPhone]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/auth/otp/send', { phone }, session?.access_token || undefined);

      setStep('otp');
      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: t('phone.sending_success') || 'Kod został wysłany',
        message: 'Sprawdź swoje wiadomości SMS.'
      });
    } catch (err: any) {
      setError(err.message);
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Błąd wysyłania',
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/auth/otp/verify', { phone, code: otp }, session?.access_token || undefined);

      // Odśwież profil w AuthContext
      await updateProfile({}); 
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onVerified();
      }, 1200);
    } catch (err: any) {
      setError(err.message);
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Błąd weryfikacji',
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/auth/otp/send', { phone }, session?.access_token || undefined);
      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: 'Sukces',
        message: 'Kod został wysłany ponownie'
      });
    } catch (err: any) {
      setError(err.message);
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Błąd wysyłania',
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const containerClasses = embedded 
    ? "w-full" 
    : "w-full max-w-md mx-auto bg-gradient-to-br from-[#00172D] to-[#002244] rounded-2xl border border-white/20 shadow-2xl overflow-hidden";

  return (
    <motion.div
      initial={embedded ? undefined : { opacity: 0, scale: 0.9, y: 20 }}
      animate={embedded ? undefined : { opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={containerClasses}
    >
      {!embedded && <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5 pointer-events-none" />}
      
      <div className={embedded ? "" : "relative p-8"}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 15 }}
          className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30"
        >
          {step === 'phone' ? (
            <Phone className="w-8 h-8 text-white" />
          ) : (
            <Shield className="w-8 h-8 text-white" />
          )}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-white text-center mb-2"
        >
          {step === 'phone' ? t('phone.title') : t('phone.code_title')}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-white/70 text-center mb-6 text-sm"
        >
          {step === 'phone' 
            ? 'Wprowadź numer telefonu w formacie międzynarodowym (np. +48 123 456 789)'
            : `Wprowadź 6-cyfrowy kod wysłany na numer ${phone}`
          }
        </motion.p>

        {step === 'phone' ? (
          <motion.form 
            onSubmit={handleSendOtp} 
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="tel"
                placeholder={t('phone.placeholder') || '+48 123 456 789'}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                readOnly={!!lockPhone}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                required
              />
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {t('phone.sending')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t('phone.send')}
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.form 
            onSubmit={handleVerifyOtp} 
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <input
              type="text"
              placeholder={t('phone.code_placeholder') || '000000'}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-center text-3xl tracking-[0.5em] font-mono transition-all"
              maxLength={6}
              required
            />

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {t('phone.verifying')}
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  {t('phone.verify')}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="w-full py-2 text-green-400 hover:text-green-300 hover:underline disabled:opacity-50 text-sm transition-colors"
            >
              {t('phone.resend')}
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full py-2 text-white/50 hover:text-white/70 text-sm transition-colors"
            >
              Zmień numer telefonu
            </button>
          </motion.form>
        )}
      </div>

      <UnifiedModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          onVerified();
        }}
        type="success"
        title="Telefon zweryfikowany!"
        message={`Gratulacje${profile?.name ? `, ${profile.name}` : ''}! Twój numer telefonu został pomyślnie zweryfikowany.\n\nTeraz masz pełny dostęp do serwisu - możesz tworzyć aukcje i licytować.`}
        confirmButton={{
          text: 'Rozpocznij korzystanie',
          onClick: () => {
            setShowSuccess(false);
            onVerified();
          }
        }}
      />
      
      <UnifiedModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal(prev => ({ ...prev, isOpen: false }))}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        confirmButton={{
          text: 'OK',
          onClick: () => setFeedbackModal(prev => ({ ...prev, isOpen: false }))
        }}
      />
    </motion.div>
  );
};

export default PhoneVerification;
