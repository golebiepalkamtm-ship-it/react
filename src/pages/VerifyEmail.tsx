import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (profile?.role === 'USER_EMAIL_VERIFIED') {
        navigate('/complete-profile');
      } else if (profile?.role === 'USER_FULL_VERIFIED') {
        navigate('/');
      }
    }
  }, [user, profile, loading, navigate]);

  const handleResend = async () => {
    if (!user?.email) return;

    setResending(true);
    try {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      if (error) throw error;
      alert('Email sent!');
    } catch (error) {
      console.error(error);
      alert('Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  if (loading || !user || !profile) {
    return <div>Loading...</div>;
  }

  if (profile.role !== 'USER_REGISTERED') {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00172D] to-[#002244] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Verify Your Email</h1>
        <p className="text-white/60 mb-6">
          We've sent a verification link to {user.email}. Please check your email and click the link to verify your account.
        </p>
        <Button
          onClick={handleResend}
          disabled={resending}
          className="bg-[#D4AF37] text-[#00172D] hover:bg-[#B8942A]"
        >
          {resending ? 'Sending...' : 'Resend Verification Email'}
        </Button>
      </div>
    </div>
  );
}