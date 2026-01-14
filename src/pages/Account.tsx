import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useAuth, type Profile } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useProfile } from "@/hooks/useProfile";
import PhoneVerification from "@/components/auth/PhoneVerification";
import UnifiedModal from "@/components/ui/UnifiedModal";

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
    if (!firstName.trim()) fields.push('Imię');
    if (!lastName.trim()) fields.push('Nazwisko');
    if (!street.trim()) fields.push('Ulica');
    if (!postalCode.trim()) fields.push('Kod pocztowy');
    if (!city.trim()) fields.push('Miasto');
    if (!country.trim()) fields.push('Kraj');
    if (!phone.trim()) fields.push('Telefon');
    return fields;
  }, [firstName, lastName, street, postalCode, city, country, phone]);

  const onSaveProfile = async () => {
    try {
      await updateUserProfile({
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
      // error message is handled by the hook's error state; log for dev
      
      console.error('Profile save failed:', err);
      const message = err?.message || profileError || 'Nie udało się zapisać profilu.';
      setFeedbackType('error');
      setFeedbackTitle('Nie zapisano');
      setFeedbackMessage(message);
      setFeedbackOpen(true);
    }
  };

  return (
    <div className="rounded-2xl border border-white/25 bg-black/70 p-6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
      <h2 className="font-display text-2xl font-semibold text-foreground">{t("account.profile.title")}</h2>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Imię</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Imię"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Nazwisko</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Nazwisko"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("profile.phone")}</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("phone.placeholder")}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Miasto</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Miasto"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            required
          />
        </div>



        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("profile.postal_code")}</label>
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder={t("profile.postal_code")}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("profile.country")}</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder={t("profile.country")}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            required
          />
        </div>

        {/* Street moved lower and made wider */}
        <div className="space-y-2 md:col-span-4 lg:col-span-3">
          <label className="text-sm font-medium text-foreground">{t("profile.street")}</label>
          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder={t("profile.street")}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            required
          />
        </div>
      </div>

      {profileError && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {profileError}
        </div>
      )}

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <Button variant="heroGold" disabled={profileSaving} onClick={onSaveProfile}>
          {profileSaving ? t("profile.saving") : t("account.profile.save")}
        </Button>

        <Button variant="outline" disabled={!profileCompleteForSms} onClick={() => setShowSmsAuth(true)}>
          {t("account.sms.start")}
        </Button>
      </div>

      {!profileCompleteForSms && (
        <div className="mt-3 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
          Aby rozpocząć weryfikację SMS, uzupełnij: {missingFields.join(', ')}
        </div>
      )}

      {showSmsAuth && profileCompleteForSms && (
        <div className="mt-6">
          <h3 className="font-display text-xl font-semibold text-foreground">{t("account.phone.title")}</h3>
          <div className="mt-4">
            <PhoneVerification
              initialPhone={phone.trim()}
              lockPhone
              onVerified={() => {
                setShowSmsAuth(false);
                setSmsVerified(true);
              }}
            />
          </div>
        </div>
      )}

      {smsVerified && (
        <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {t("phone.verified")}
        </div>
      )}

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
    </div>
  );
};

export default function Account() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { user, profile, loading, signOut } = useAuth();
  const { updateUserProfile, loading: profileSaving, error: profileError } = useProfile();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=login&callbackUrl=/account", { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground">Loading...</div>
    </div>
  );
  if (!user) return <Navigate to="/auth?mode=login&callbackUrl=/account" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 md:pt-32">
        <div className="container mx-auto px-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-2xl border border-white/25 bg-black/70 p-6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
              <h1 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4">{t("account.title")}</h1>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="rounded-xl border border-white/15 bg-black/40 p-4">
                  <div className="text-muted-foreground">{t("account.status.email")}</div>
                  <div className="mt-1 text-foreground break-all">{user.email}</div>
                </div>
                <div className="rounded-xl border border-white/15 bg-black/40 p-4">
                  <div className="text-muted-foreground">{t("account.status.role")}</div>
                  <div className="mt-1 text-foreground">{profile?.role ?? "-"}</div>
                </div>
                <div className="rounded-xl border border-white/15 bg-black/40 p-4">
                  <div className="text-muted-foreground">{t("account.status.next")}</div>
                  <div className="mt-1 text-foreground">
                    {profile?.role === "USER_REGISTERED"
                      ? t("account.next.verify_email")
                      : profile?.role === "USER_EMAIL_VERIFIED"
                        ? t("account.next.profile_sms")
                        : profile?.role === "USER_FULL_VERIFIED" || profile?.role === "ADMIN"
                          ? t("account.next.done")
                          : "-"}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {profile?.role === "USER_REGISTERED" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="rounded-2xl border border-white/25 bg-black/70 p-6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                <h2 className="font-display text-2xl font-semibold text-foreground">{t("verify_email.title")}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t("verify_email.p", { email: user.email ?? "" })}</p>
                <div className="mt-4">
                  <Button variant="heroGold" onClick={() => navigate("/verify-email")}>{t("auth.check_email.cta")}</Button>
                </div>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="rounded-2xl border border-white/25 bg-black/70 p-6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
              <h2 className="font-display text-2xl font-semibold text-foreground">{t("account.auctions.title")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("account.auctions.placeholder")}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="rounded-2xl border border-white/25 bg-black/70 p-6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
              <h2 className="font-display text-2xl font-semibold text-foreground">{t("account.settings.title")}</h2>
              <div className="mt-4">
                <Button variant="outline" onClick={() => signOut()}>{t("account.settings.signout")}</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
