import React, { useEffect, useMemo, useState } from 'react';
import GlassModal from './GlassModal';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import PhoneVerification from '@/components/auth/PhoneVerification';
import { useLocale } from '@/contexts/LocaleContext';
import { useProfile } from '@/hooks/useProfile';

interface Props {
  open: boolean;
  onClose: () => void;
}

const AccountModal: React.FC<Props> = ({ open, onClose }) => {
  const { user, profile, loading, signOut } = useAuth();
  const { t } = useLocale();
  const { updateUserProfile, loading: profileSaving, error: profileError } = useProfile();

  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [showSmsAuth, setShowSmsAuth] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? '');
    setStreet(profile.street ?? '');
    setPostalCode(profile.postal_code ?? '');
    setCountry(profile.country ?? '');
    setPhone(profile.phone ?? '');
  }, [profile?.id]);

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
  }, [country, isEmailVerified, name, phone, postalCode, profile]);

  const onSaveProfile = async () => {
    await updateUserProfile({
      name: name.trim(),
      street: street.trim(),
      postal_code: postalCode.trim(),
      country: country.trim(),
      phone: phone.trim(),
    });
  };

  if (loading) return null;
  if (!user) return null;

  return (
    <GlassModal open={open} onClose={onClose} title={t('account.title')} description={t('account.subtitle') || ''}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl border border-white/15 bg-black/40 p-4">
            <div className="text-muted-foreground">{t('account.status.email')}</div>
            <div className="mt-1 text-foreground break-all">{user.email}</div>
          </div>
          <div className="rounded-xl border border-white/15 bg-black/40 p-4">
            <div className="text-muted-foreground">{t('account.status.role')}</div>
            <div className="mt-1 text-foreground">{profile?.role ?? '-'}</div>
          </div>
          <div className="rounded-xl border border-white/15 bg-black/40 p-4">
            <div className="text-muted-foreground">{t('account.status.next')}</div>
            <div className="mt-1 text-foreground">
              {profile?.role === 'USER_REGISTERED'
                ? t('account.next.verify_email')
                : profile?.role === 'USER_EMAIL_VERIFIED'
                ? t('account.next.profile_sms')
                : profile?.role === 'USER_FULL_VERIFIED' || profile?.role === 'ADMIN'
                ? t('account.next.done')
                : '-'}
            </div>
          </div>
        </div>

        {profile?.role === 'USER_EMAIL_VERIFIED' && (
          <div className="rounded-2xl border border-white/25 bg-black/70 p-4">
            <h3 className="font-display text-xl font-semibold text-foreground">{t('account.profile.title')}</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t('profile.full_name')}</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('profile.full_name_placeholder') || 'Imię i nazwisko'} title={t('profile.full_name') || 'Imię i nazwisko'} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t('profile.phone')}</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('phone.placeholder') || '+48 600 000 000'} title={t('profile.phone') || 'Telefon'} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">{t('profile.street')}</label>
                <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder={t('profile.street_placeholder') || 'Ulica i numer'} title={t('profile.street') || 'Ulica'} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t('profile.postal_code')}</label>
                <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder={t('profile.postal_code_placeholder') || '00-000'} title={t('profile.postal_code') || 'Kod pocztowy'} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t('profile.country')}</label>
                <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder={t('profile.country_placeholder') || 'Polska'} title={t('profile.country') || 'Kraj'} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
              </div>
            </div>

            {profileError && <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{profileError}</div>}

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Button variant="heroGold" disabled={profileSaving} onClick={onSaveProfile}>{profileSaving ? t('profile.saving') : t('account.profile.save')}</Button>
              <Button variant="outline" disabled={!profileCompleteForSms} onClick={() => setShowSmsAuth(true)}>{t('account.sms.start')}</Button>
            </div>

            {showSmsAuth && profileCompleteForSms && (
              <div className="mt-6">
                <PhoneVerification initialPhone={phone.trim()} lockPhone onVerified={() => setShowSmsAuth(false)} />
              </div>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-white/25 bg-black/70 p-4">
          <h3 className="font-display text-xl font-semibold text-foreground">{t('account.settings.title')}</h3>
          <div className="mt-4">
            <Button variant="outline" onClick={() => { signOut(); onClose(); }}>{t('account.settings.signout')}</Button>
          </div>
        </div>
      </div>
    </GlassModal>
  );
};

export default AccountModal;
