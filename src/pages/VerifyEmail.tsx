import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useLocale } from "@/contexts/LocaleContext";
import logger from "@/lib/logger";
import { UnifiedModal } from "@/components/ui/UnifiedModal";

export default function VerifyEmail() {
  const { t } = useLocale();
  const { user, profile, loading, pendingEmailVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [resending, setResending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Parse URL params for errors
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    // Check for verification errors in URL
    const errorParam = query.get('error');
    const errorDescription = query.get('error_description');
    
    if (errorParam === 'verification_failed') {
      setErrorMessage(errorDescription || 'Weryfikacja emaila nie powiodła się. Spróbuj ponownie.');
      setShowError(true);
      
      // Clean up URL
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('error');
      cleanUrl.searchParams.delete('error_description');
      window.history.replaceState({}, '', cleanUrl.toString());
    }
  }, [query]);

  useEffect(() => {
    if (!loading) {
      if (!user && !pendingEmailVerification) {
        navigate('/auth?mode=login');
      } else if (profile?.role === 'USER_EMAIL_VERIFIED') {
        // Email został zweryfikowany - pokaż modal sukcesu i czekaj na kliknięcie OK
        setShowSuccess(true);
      } else if (profile?.role === 'USER_FULL_VERIFIED' || profile?.role === 'ADMIN') {
        // Użytkownik już w pełni zweryfikowany - przekieruj na stronę główną
        navigate('/');
      }
    }
  }, [user, profile, loading, navigate, pendingEmailVerification]);

  const handleResend = async () => {
    const email = user?.email ?? pendingEmailVerification;
    if (!email) return;

    setResending(true);
    try {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      toast(t('verify_email.sent'), {
        description: t('verify_email.check_email'),
      });
    } catch (error) {
      logger.error(error);
      toast(t('verify_email.error'), {
        description: t('verify_email.try_again'),
      });
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const emailToShow = user?.email ?? pendingEmailVerification;
  const canShow = !!emailToShow && (!profile || profile.role === 'USER_REGISTERED');
  if (!canShow) return <div>Access denied</div>;

  return (
    <div className="min-h-screen relative isolate flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="fixed inset-0 bg-hero-gradient grid-overlay -z-10 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-gradient-to-br from-[#00172D] to-[#002244] rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5 pointer-events-none" />
        
        <div className="relative p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 15 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30"
          >
            <Mail className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl font-bold text-white mb-3"
          >
            {t('verify_email.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/70 mb-6 text-base leading-relaxed"
          >
            {t('verify_email.p', { email: emailToShow })}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={handleResend}
              disabled={resending}
              className="w-full max-w-xs mx-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {resending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {t('verify_email.sending')}
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  {t('verify_email.resend')}
                </>
              )}
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-white/50 text-sm"
          >
            Sprawdź również folder SPAM
          </motion.p>
        </div>
      </motion.div>

      <UnifiedModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate('/', { state: { openAccount: true, showVerificationSuccess: true } });
        }}
        type="success"
        title="Email zweryfikowany!"
        message={`Dziękujemy${profile?.name ? `, ${profile.name}` : ''}! Twój adres email został pomyślnie zweryfikowany.\n\nTeraz możesz uzupełnić swój profil, aby uzyskać pełny dostęp do serwisu.`}
        confirmButton={{
          text: 'Uzupełnij profil',
          onClick: () => {
            setShowSuccess(false);
            navigate('/', { state: { openAccount: true, showVerificationSuccess: true } });
          }
        }}
      />

      <UnifiedModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        type="error"
        title="Błąd weryfikacji"
        message={errorMessage}
        confirmButton={{
          text: 'Spróbuj ponownie',
          onClick: () => {
            setShowError(false);
          }
        }}
      />
    </div>
  );
}
