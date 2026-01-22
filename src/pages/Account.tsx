import { useEffect, useMemo, useState, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth, type Profile } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useProfile } from "@/hooks/useProfile";
import PhoneVerification from "@/components/auth/PhoneVerification";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import { User, Mail, Shield, ChevronDown, Sparkles, Settings, ShoppingBag, LogOut, CheckCircle, AlertCircle } from "lucide-react";

const EmailVerifiedProfileCard = ({
  profile,
  t,
  profileSaving,
  profileError,
  updateUserProfile,
}: {
  profile: Profile;
  t: (key: string, params?: Record<string, string>) => string;
  profileSaving: boolean;
  profileError: string;
  updateUserProfile: (updates: {
    username?: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    city?: string;
    phone?: string;
    street?: string;
    postal_code?: string;
    country?: string;
  }) => Promise<void>;
}) => {
  const [username, setUsername] = useState(profile.username ?? "");
  const [name, setName] = useState(profile.name ?? "");
  const [firstName, setFirstName] = useState(profile.first_name ?? "");
  const [lastName, setLastName] = useState(profile.last_name ?? "");
  const [street, setStreet] = useState(profile.street ?? "");
  const [postalCode, setPostalCode] = useState(profile.postal_code ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [country, setCountry] = useState(profile.country ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");

  const [showSmsAuth, setShowSmsAuth] = useState(false);
  const [smsVerified, setSmsVerified] = useState(false);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const profileCompleteForSms = useMemo(() => {
    return Boolean(
      firstName.trim() &&
        lastName.trim() &&
        street.trim() &&
        postalCode.trim() &&
        city.trim() &&
        country.trim() &&
        phone.trim(),
    );
  }, [country, firstName, lastName, city, phone, postalCode, street]);

  const missingFields = useMemo(() => {
    const fields: string[] = [];
    if (!username.trim()) fields.push('Nazwa użytkownika');
    if (!firstName.trim()) fields.push('Imię');
    if (!lastName.trim()) fields.push('Nazwisko');
    if (!street.trim()) fields.push('Ulica');
    if (!postalCode.trim()) fields.push('Kod pocztowy');
    if (!city.trim()) fields.push('Miasto');
    if (!country.trim()) fields.push('Kraj');
    if (!phone.trim()) fields.push('Telefon');
    return fields;
  }, [username, firstName, lastName, street, postalCode, city, country, phone]);

  const onSaveProfile = async () => {
    try {
      await updateUserProfile({
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        name: name.trim() || `${firstName.trim()} ${lastName.trim()}`.trim(),
        street: street.trim(),
        postal_code: postalCode.trim(),
        city: city.trim(),
        country: country.trim(),
        phone: phone.trim(),
      });
      setFeedbackType('success');
      setFeedbackTitle('Zapisano');
      setFeedbackMessage('Profil został zaktualizowany.');
      setFeedbackOpen(true);
    } catch (err: any) {
      console.error('Profile save failed:', err);
      const message = err?.message || profileError || 'Nie udało się zapisać profilu.';
      setFeedbackType('error');
      setFeedbackTitle('Nie zapisano');
      setFeedbackMessage(message);
      setFeedbackOpen(true);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-zinc-800/80 border border-gold/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-300";
  const labelClass = "text-sm font-medium text-gold/80";

  return (
    <motion.div 
      className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-800/95 via-zinc-900/95 to-zinc-800/95 backdrop-blur-xl shadow-[0_0_40px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.05)] p-6 md:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/10 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      
      <div className="relative">
        <h2 className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-light to-gold mb-6">
          {t("account.profile.title")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={labelClass}>Nazwa użytkownika</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="np. champion-123" className={inputClass} required />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Imię</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Imię" className={inputClass} required />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Nazwisko</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nazwisko" className={inputClass} required />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>{t("profile.phone")}</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("phone.placeholder")} className={inputClass} required />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Miasto</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Miasto" className={inputClass} required />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>{t("profile.postal_code")}</label>
            <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder={t("profile.postal_code")} className={inputClass} required />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>{t("profile.country")}</label>
            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder={t("profile.country")} className={inputClass} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className={labelClass}>{t("profile.street")}</label>
            <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder={t("profile.street")} className={inputClass} required />
          </div>
        </div>

        {profileError && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {profileError}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button 
            disabled={profileSaving} 
            onClick={onSaveProfile}
            className="bg-gradient-to-r from-gold to-gold text-black font-bold hover:from-gold-light hover:to-gold shadow-[0_0_20px_rgba(250,204,21,0.3)]"
          >
            {profileSaving ? t("profile.saving") : t("account.profile.save")}
          </Button>

          <Button 
            variant="outline" 
            disabled={!profileCompleteForSms} 
            onClick={() => setShowSmsAuth(true)}
            className="border-gold/30 text-gold-light hover:bg-gold hover:text-black"
          >
            {t("account.sms.start")}
          </Button>
        </div>

        {!profileCompleteForSms && (
          <div className="mt-4 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-light flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Aby rozpocząć weryfikację SMS, uzupełnij: {missingFields.join(', ')}</span>
          </div>
        )}

        {showSmsAuth && profileCompleteForSms && (
          <div className="mt-6 p-4 rounded-xl border border-gold/20 bg-zinc-800/50">
            <h3 className="font-display text-xl font-semibold text-white mb-4">{t("account.phone.title")}</h3>
            <PhoneVerification
              initialPhone={phone.trim()}
              lockPhone
              onVerified={() => {
                setShowSmsAuth(false);
                setSmsVerified(true);
              }}
            />
          </div>
        )}

        {smsVerified && (
          <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {t("phone.verified")}
          </div>
        )}
      </div>

      <UnifiedModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        type={feedbackType}
        title={feedbackTitle}
        message={feedbackMessage}
        confirmButton={{ text: 'OK', onClick: () => setFeedbackOpen(false) }}
        showCloseButton={true}
        closeOnBackdrop={true}
        closeOnEscape={true}
        size="md"
      />
    </motion.div>
  );
};

export default function Account() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { user, profile, loading, signOut } = useAuth();
  const { updateUserProfile, loading: profileSaving, error: profileError } = useProfile();
  
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=login&callbackUrl=/account", { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative w-16 h-16 mx-auto mb-6">
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-gold/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-2 rounded-full border-2 border-t-gold border-r-transparent border-b-transparent border-l-transparent"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-gold" />
          </div>
          <p className="text-white/60 text-lg">Ładowanie...</p>
        </motion.div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/auth?mode=login&callbackUrl=/account" replace />;

  const getRoleIcon = () => {
    switch (profile?.role) {
      case 'ADMIN': return <Shield className="w-5 h-5 text-gold" />;
      case 'USER_FULL_VERIFIED': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'USER_EMAIL_VERIFIED': return <Mail className="w-5 h-5 text-blue-400" />;
      default: return <User className="w-5 h-5 text-white/60" />;
    }
  };

  const getRoleLabel = () => {
    switch (profile?.role) {
      case 'ADMIN': return 'Administrator';
      case 'USER_FULL_VERIFIED': return 'Zweryfikowany';
      case 'USER_EMAIL_VERIFIED': return 'Email zweryfikowany';
      case 'USER_REGISTERED': return 'Zarejestrowany';
      default: return 'Użytkownik';
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-black" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-0 w-[500px] h-[500px] bg-gold-dark/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-gold/3 rounded-full blur-[80px]" />
      </div>

      <Header />

      <motion.section 
        ref={heroRef}
        className="relative min-h-[40vh] flex items-center justify-center z-10 pt-20"
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gold/10"
              style={{
                width: `${80 + i * 80}px`,
                height: `${80 + i * 80}px`,
                right: `${5 + i * 12}%`,
                top: `${15 + i * 12}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/20 border border-gold/40 mb-8"
              animate={{ 
                boxShadow: ['0 0 30px rgba(250,204,21,0.2)', '0 0 60px rgba(250,204,21,0.4)', '0 0 30px rgba(250,204,21,0.2)']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <User className="w-10 h-10 text-gold" />
            </motion.div>

            <motion.h1 
              className="font-display text-3xl md:text-4xl lg:text-5xl font-black mb-6"
              style={{
                background: 'linear-gradient(135deg, #fff 0%, #d4af37 50%, #fff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 0 60px rgba(212,175,55,0.5)',
              }}
            >
              {t("account.title")}
            </motion.h1>

            <motion.div 
              className="mt-8 flex flex-col items-center gap-2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-white/40 text-sm uppercase tracking-widest">Przewijaj</span>
              <ChevronDown className="w-6 h-6 text-gold/60" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <main className="relative z-10 pb-20">
        <div className="container mx-auto px-4 space-y-6">
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-800/95 via-zinc-900/95 to-zinc-800/95 backdrop-blur-xl shadow-[0_0_40px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.05)] p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/10 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1">
                <img 
                  src="/golden-pair(1).png" 
                  alt="Golden Pair" 
                  className="w-full h-auto rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)]"
                />
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div 
                    className="rounded-xl border border-gold/20 bg-zinc-800/50 p-4"
                    whileHover={{ scale: 1.02, borderColor: 'rgba(250,204,21,0.4)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                      <Mail className="w-4 h-4 text-gold/60" />
                      {t("account.status.email")}
                    </div>
                    <div className="text-white break-all font-medium">{user.email}</div>
                  </motion.div>
                  
                  <motion.div 
                    className="rounded-xl border border-gold/20 bg-zinc-800/50 p-4"
                    whileHover={{ scale: 1.02, borderColor: 'rgba(250,204,21,0.4)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                      {getRoleIcon()}
                      {t("account.status.role")}
                    </div>
                    <div className="text-white font-medium">{getRoleLabel()}</div>
                  </motion.div>
                  
                  <motion.div 
                    className="rounded-xl border border-gold/20 bg-zinc-800/50 p-4"
                    whileHover={{ scale: 1.02, borderColor: 'rgba(250,204,21,0.4)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                      <CheckCircle className="w-4 h-4 text-gold/60" />
                      {t("account.status.next")}
                    </div>
                    <div className="text-white font-medium">
                      {profile?.role === "USER_REGISTERED"
                        ? t("account.next.verify_email")
                        : profile?.role === "USER_EMAIL_VERIFIED"
                          ? t("account.next.profile_sms")
                          : profile?.role === "USER_FULL_VERIFIED" || profile?.role === "ADMIN"
                            ? t("account.next.done")
                            : "-"}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {profile?.role === "USER_REGISTERED" && (
            <motion.div
              className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-800/95 via-zinc-900/95 to-zinc-800/95 backdrop-blur-xl shadow-[0_0_40px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.05)] p-6 md:p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/10 pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
              
              <div className="relative">
                <h2 className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-light to-gold mb-4">
                  {t("verify_email.title")}
                </h2>
                <p className="text-white/60 mb-4">{t("verify_email.p", { email: user.email ?? "" })}</p>
                <Button 
                  onClick={() => navigate("/verify-email")}
                  className="bg-gradient-to-r from-gold to-gold text-black font-bold hover:from-gold-light hover:to-gold shadow-[0_0_20px_rgba(250,204,21,0.3)]"
                >
                  {t("auth.check_email.cta")}
                </Button>
              </div>
            </motion.div>
          )}

          {profile?.role === "USER_EMAIL_VERIFIED" && (
            <EmailVerifiedProfileCard
              key={profile?.updated_at || profile?.id || 'email-verified-card'}
              profile={profile}
              t={t}
              profileSaving={profileSaving}
              profileError={profileError}
              updateUserProfile={updateUserProfile}
            />
          )}

          <motion.div
            className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-800/95 via-zinc-900/95 to-zinc-800/95 backdrop-blur-xl shadow-[0_0_40px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.05)] p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/10 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-gold" />
                </div>
                <h2 className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-light to-gold">
                  {t("account.auctions.title")}
                </h2>
              </div>
              <p className="text-white/60">{t("account.auctions.placeholder")}</p>
            </div>
          </motion.div>

          <motion.div
            className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-800/95 via-zinc-900/95 to-zinc-800/95 backdrop-blur-xl shadow-[0_0_40px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.05)] p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/10 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-gold" />
                </div>
                <h2 className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-light to-gold">
                  {t("account.settings.title")}
                </h2>
              </div>
              <Button 
                variant="outline" 
                onClick={() => signOut()}
                className="border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t("account.settings.signout")}
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
