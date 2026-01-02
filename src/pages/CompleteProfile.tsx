import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ProfileForm from "@/components/auth/ProfileForm";
import PhoneVerification from "@/components/auth/PhoneVerification";

export default function CompleteProfile() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'profile' | 'phone'>('profile');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth?mode=login');
      } else if (profile?.role === 'USER_FULL_VERIFIED') {
        navigate('/');
      } else if (profile?.role === 'USER_REGISTERED') {
        navigate('/verify-email');
      }
    }
  }, [user, profile, loading, navigate]);

  if (loading || !user || !profile) {
    return <div>Loading...</div>;
  }

  if (profile.role !== 'USER_EMAIL_VERIFIED') {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00172D] to-[#002244] flex items-center justify-center p-4">
      {step === 'profile' ? (
        <ProfileForm onCompleted={() => setStep('phone')} />
      ) : (
        <PhoneVerification onVerified={() => navigate('/')} />
      )}
    </div>
  );
}