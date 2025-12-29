import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useProfile } from "@/hooks/useProfile";
import PhoneVerification from "@/components/auth/PhoneVerification";
import { ParticleBackground } from "@/components/gallery/ParticleBackground";

export default function Account(props) {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { user, profile, loading, signOut } = useAuth();
  const { updateUserProfile, loading: profileSaving, error: profileError } = useProfile();

  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");

  const [showSmsAuth, setShowSmsAuth] = useState(false);
  const [smsVerified, setSmsVerified] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=login&callbackUrl=/account", { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setStreet(profile.street ?? "");
    setPostalCode(profile.postal_code ?? "");
    setCountry(profile.country ?? "");
    setPhone(profile.phone ?? "");
  }, [profile?.id]);

  useEffect(() => {
    if (profile?.role === 'USER_FULL_VERIFIED' || profile?.role === 'ADMIN') {
      setSmsVerified(true);
    }
  }, [profile?.role]);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/auth?mode=login&callbackUrl=/account" replace />;
  }

  const isEmailVerified = profile?.role === 'USER_EMAIL_VERIFIED' || profile?.role === 'USER_FULL_VERIFIED' || profile?.role === 'ADMIN';

  const profileCompleteForSms = useMemo(() => {
    if (!isEmailVerified) return false;
    return Boolean(
      (name || profile?.name)?.trim() &&
      (street || profile?.street)?.trim() &&
      (postalCode || profile?.postal_code)?.trim() &&
      (country || profile?.country)?.trim() &&
      (phone || profile?.phone)?.trim()
    );
  }, [country, isEmailVerified, name, phone, postalCode, profile?.country, profile?.name, profile?.phone, profile?.postal_code, profile?.street, street]);

  const onSaveProfile = async () => {
    await updateUserProfile({
      name: name.trim(),
      street: street.trim(),
      postal_code: postalCode.trim(),
      country: country.trim(),
      phone: phone.trim(),
    });
  };

  return (
    <div className="min-h-screen relative isolate overflow-hidden">
      <ParticleBackground particleCount={65} variant="gold" />
      <div className="fixed inset-0 bg-hero-gradient grid-overlay -z-10 pointer-events-none" />
      <Header />
      <main className="pt-28 md:pt-32 relative z-10">
        <div className="container mx-auto px-4 space-y-6">
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

          {profile?.role === "USER_REGISTERED" && (
            <div className="rounded-2xl border border-white/25 bg-black/70 p-6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
              <h2 className="font-display text-2xl font-semibold text-foreground">{t("verify_email.title")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("verify_email.p", { email: user.email ?? "" })}</p>
              <div className="mt-4">
                <Button variant="heroGold" onClick={() => navigate("/verify-email")}>{t("auth.check_email.cta")}</Button>
              </div>
            </div>
          )}

          {profile?.role === "USER_EMAIL_VERIFIED" && (
            <div className="rounded-2xl border border-white/25 bg-black/70 p-6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
              <h2 className="font-display text-2xl font-semibold text-foreground">{t("account.profile.title")}</h2>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('profile.full_name')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('profile.full_name')}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('profile.phone')}</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('phone.placeholder')}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">{t('profile.street')}</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder={t('profile.street')}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('profile.postal_code')}</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder={t('profile.postal_code')}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('profile.country')}</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder={t('profile.country')}
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
                  {profileSaving ? t('profile.saving') : t('account.profile.save')}
                </Button>

                <Button
                  variant="outline"
                  disabled={!profileCompleteForSms}
                  onClick={() => setShowSmsAuth(true)}
                >
                  {t('account.sms.start')}
                </Button>
              </div>

              {!profileCompleteForSms && (
                <p className="mt-3 text-sm text-muted-foreground">{t('account.sms.required')}</p>
              )}

              {showSmsAuth && profileCompleteForSms && (
                <div className="mt-6">
                  <h3 className="font-display text-xl font-semibold text-foreground">{t('account.phone.title')}</h3>
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
                  {t('phone.verified')}
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-white/25 bg-black/70 p-6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <h2 className="font-display text-2xl font-semibold text-foreground">{t("account.auctions.title")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("account.auctions.placeholder")}</p>
          </div>

          <div className="rounded-2xl border border-white/25 bg-black/70 p-6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <h2 className="font-display text-2xl font-semibold text-foreground">{t("account.settings.title")}</h2>
            <div className="mt-4">
              <Button variant="outline" onClick={() => signOut()}>{t("account.settings.signout")}</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
