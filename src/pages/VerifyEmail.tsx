import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useLocale } from "@/contexts/LocaleContext";
import logger from "@/lib/logger";

export default function VerifyEmail(props) {
  const { t } = useLocale();
  const { user, profile, loading, pendingEmailVerification } = useAuth();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user && !pendingEmailVerification) {
        navigate('/auth?mode=login');
      } else if (profile?.role === 'USER_EMAIL_VERIFIED') {
        navigate('/account');
      } else if (profile?.role === 'USER_FULL_VERIFIED') {
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
    <div className="min-h-screen relative isolate flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-hero-gradient grid-overlay -z-10 pointer-events-none" />
      <div className="w-full max-w-md bg-black/70 backdrop-blur-xl rounded-2xl border border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] shadow-2xl p-8 text-center">
        <h1 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4">{t('verify_email.title')}</h1>
        <p className="text-muted-foreground mb-6">
          {t('verify_email.p', { email: emailToShow })}
        </p>
        <Button
          onClick={handleResend}
          disabled={resending}
          variant="gold"
        >
          {resending ? t('verify_email.sending') : t('verify_email.resend')}
        </Button>
      </div>
    </div>
  );
}