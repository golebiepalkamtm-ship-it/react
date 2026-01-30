import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Star, Shield, Settings, X, Calendar, Phone, Mail, Lock, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useProfile } from '@/hooks/useProfile';
import type { Profile } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { reviewService } from '@/services/reviewService';
import { UnifiedModal } from '@/components/ui/UnifiedModal';
import PhoneVerification from '@/components/auth/PhoneVerification';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface AccountModalContentProps {
  onClose: () => void;
  profile: Profile;
  signOut: () => void;
  profileError: string | null;
  profileSaving: boolean;
  updateUserProfile: (payload: {
    username?: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    street?: string;
    postal_code?: string;
    city?: string;
    country?: string;
    phone?: string;
    avatar_url?: string;
  }) => Promise<void>;
}

const AccountModalContent: React.FC<AccountModalContentProps> = ({
  onClose,
  profile,
  signOut,
  profileError,
  profileSaving,
  updateUserProfile,
}) => {
  const { user } = useAuth();
  const { t } = useLocale();

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const [name, setName] = useState(profile.name ?? '');
  const [username, setUsername] = useState(profile.username || '');
  const [firstName, setFirstName] = useState(profile.first_name ?? '');
  const [lastName, setLastName] = useState(profile.last_name ?? '');
  const [street, setStreet] = useState(profile.street ?? '');
  const [postalCode, setPostalCode] = useState(profile.postal_code ?? '');
  const [city, setCity] = useState(profile.city ?? '');
  const [country, setCountry] = useState(profile.country ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [showSmsAuth, setShowSmsAuth] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSaving, setPassSaving] = useState(false);
  const [passError, setPassError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'settings'>('profile');
  const [trustScore, setTrustScore] = useState(0);

  // Fetch trust score
  React.useEffect(() => {
    if (user?.id) {
      reviewService.getTrustScore(user.id).then(response => {
        setTrustScore(response.trustScore);
      }).catch(error => {
        console.error('Error fetching trust score:', error);
      });
    }
  }, [user?.id]);

  const isEmailVerified =
    profile.role === 'USER_EMAIL_VERIFIED' || profile.role === 'USER_FULL_VERIFIED' || profile.role === 'ADMIN';

  const profileCompleteForSms = useMemo(() => {
    if (!isEmailVerified) return false;
    return Boolean(
      (firstName || profile.first_name)?.trim() &&
        (lastName || profile.last_name)?.trim() &&
        (street || profile.street)?.trim() &&
        (postalCode || profile.postal_code)?.trim() &&
        (city || profile.city)?.trim() &&
        (country || profile.country)?.trim() &&
        (phone || profile.phone)?.trim(),
    );
  }, [firstName, lastName, city, country, isEmailVerified, phone, postalCode, profile, street]);

  const missingFields = useMemo(() => {
    const fields: string[] = [];
    if (!username.trim()) fields.push('Nazwa użytkownika');
    if (!(firstName || profile.first_name)) fields.push('Imię');
    if (!(lastName || profile.last_name)) fields.push('Nazwisko');
    if (!(street || profile.street)) fields.push('Ulica');
    if (!(postalCode || profile.postal_code)) fields.push('Kod pocztowy');
    if (!(city || profile.city)) fields.push('Miasto');
    if (!(country || profile.country)) fields.push('Kraj');
    if (!(phone || profile.phone)) fields.push('Telefon');
    return fields;
  }, [username, firstName, lastName, street, postalCode, city, country, phone, profile]);

  const onSaveProfile = async () => {
    if (!username.trim()) {
      setFeedbackOpen(true);
      setFeedbackType('error');
      setFeedbackTitle('Błąd');
      setFeedbackMessage('Nazwa użytkownika jest wymagana.');
      return;
    }
    
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
      setFeedbackOpen(true);
      setFeedbackType('success');
      setFeedbackTitle('Profil zaktualizowany');
      setFeedbackMessage('Twoje dane zostały pomyślnie zaktualizowane.');
    } catch (error: any) {
      setFeedbackOpen(true);
      setFeedbackType('error');
      setFeedbackTitle('Błąd');
      setFeedbackMessage(error.message || 'Nie udało się zaktualizować profilu.');
    }
  };

  const onChangePassword = async () => {
    setPassError('');
    if (!newPassword || newPassword.length < 6) {
      setPassError('Hasło musi mieć co najmniej 6 znaków');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Hasła nie są takie same');
      return;
    }
    try {
      setPassSaving(true);
      if (!supabase) {
        setPassError('Brak połączenia z Supabase');
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPassError(error.message ?? 'Nie udało się zmienić hasła');
        return;
      }
      setNewPassword('');
      setConfirmPassword('');
      toast('Hasło zostało zmienione', { description: 'Twoje nowe hasło jest już aktywne.' });
    } catch (err: any) {
      setPassError(err?.message ?? 'Wystąpił błąd przy zmianie hasła');
    } finally {
      setPassSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="bg-hero-gradient rounded-2xl p-4 md:p-6 border border-white/20 shadow-2xl space-y-6"
    >
      {/* Banner dla użytkowników z USER_EMAIL_VERIFIED - wymagane uzupełnienie profilu */}
      {profile.role === 'USER_EMAIL_VERIFIED' && !profileCompleteForSms && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/20 to-orange-500/10"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-300 mb-1">Uzupełnij swój profil</h4>
              <p className="text-sm text-white/70">
                Aby uzyskać pełny dostęp do serwisu i móc tworzyć aukcje oraz licytować, 
                musisz uzupełnić wszystkie dane profilowe i przejść weryfikację SMS.
              </p>
              {missingFields.length > 0 && (
                <p className="text-xs text-amber-400/80 mt-2">
                  Brakujące pola: {missingFields.join(', ')}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
      
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.06 }}>
        <div className="rounded-xl border border-white/15 bg-black/40 p-4">
          <div className="text-muted-foreground flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {t('account.status.email')}
          </div>
          <div className="mt-1 text-foreground break-all">{user?.email ?? ''}</div>
        </div>
        <div className="rounded-xl border border-white/15 bg-black/40 p-4">
          <div className="text-muted-foreground flex items-center gap-2">
            <Star className="w-4 h-4" />
            {t('account.status.role')}
          </div>
          <div className="mt-1 text-foreground">{profile.role ?? '-'}</div>
        </div>
        <div className="rounded-xl border border-white/15 bg-black/40 p-4">
          <div className="text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {t('account.status.next')}
          </div>
          <div className="mt-1 text-foreground">
            {profile.role === 'USER_REGISTERED'
              ? t('account.next.verify_email')
              : profile.role === 'USER_EMAIL_VERIFIED'
                ? t('account.next.profile_sms')
                : profile.role === 'USER_FULL_VERIFIED' || profile.role === 'ADMIN'
                  ? t('account.next.done')
                  : '-'}
          </div>
        </div>
      </motion.div>

    <div className="mt-2" role="tablist" aria-label="Account tabs">
      <div className="flex gap-2">
        <button
          type="button"
          role="tab"
          onClick={() => setActiveTab('profile')}
          aria-selected={activeTab === 'profile' ? 'true' : 'false'}
          className={`rounded-md px-3 py-2 text-sm font-semibold flex items-center gap-2 ${activeTab === 'profile' ? 'bg-white/15 text-white' : 'bg-black/30 text-white/80 hover:bg-black/40'} border border-white/15`}
        >
          <User className="w-4 h-4" />
          Profil
        </button>
        <button
          type="button"
          role="tab"
          onClick={() => setActiveTab('security')}
          aria-selected={activeTab === 'security' ? 'true' : 'false'}
          className={`rounded-md px-3 py-2 text-sm font-semibold flex items-center gap-2 ${activeTab === 'security' ? 'bg-white/15 text-white' : 'bg-black/30 text-white/80 hover:bg-black/40'} border border-white/15`}
        >
          <Shield className="w-4 h-4" />
          Bezpieczeństwo
        </button>
        <button
          type="button"
          role="tab"
          onClick={() => setActiveTab('settings')}
          aria-selected={activeTab === 'settings' ? 'true' : 'false'}
          className={`rounded-md px-3 py-2 text-sm font-semibold flex items-center gap-2 ${activeTab === 'settings' ? 'bg-white/15 text-white' : 'bg-black/30 text-white/80 hover:bg-black/40'} border border-white/15`}
        >
          <Settings className="w-4 h-4" />
          Ustawienia
        </button>
      </div>
    </div>

      <AnimatePresence>
        {profileError && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg overflow-hidden"
          >
            <p className="text-red-400">{profileError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEmailVerified && activeTab === 'profile' && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="rounded-2xl border border-white/25 bg-black/70 p-4"
          >
            {/* Trust Score */}
            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-gold" />
                  <span className="text-white font-medium">Trust Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${reviewService.getRatingColor(trustScore)}`}>
                    {trustScore.toFixed(1)}
                  </span>
                  <span className="text-gold text-lg">
                    {reviewService.renderStars(trustScore)}
                  </span>
                </div>
              </div>
              {trustScore === 0 && (
                <p className="text-white/60 text-sm mt-2">
                  Brak recenzji - bąd pierwszym kto oceni!
                </p>
              )}
            </div>
            
            <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-gold" />
              {t('account.profile.title')}
            </h3>
            <motion.div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <User className="w-3 h-3" />
                  Nazwa użytkownika
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nazwa użytkownika"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <User className="w-3 h-3" />
                  {t('profile.first_name') || 'Imię'}
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Imię"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <User className="w-3 h-3" />
                  {t('profile.last_name') || 'Nazwisko'}
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Nazwisko"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  {t('profile.phone')}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('phone.placeholder') || '+48 600 000 000'}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {t('profile.street')}
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder={t('profile.street_placeholder') || 'Ulica i numer'}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {t('profile.city') || 'Miasto'}
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Miasto"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {t('profile.postal_code')}
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder={t('profile.postal_code_placeholder') || '00-000'}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {t('profile.country')}
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder={t('profile.country_placeholder') || 'Polska'}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={profileSaving}
              onClick={onSaveProfile}
              className="px-6 py-2 bg-gold text-navy hover:bg-gold/90 hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {profileSaving ? t('profile.saving') : t('account.profile.save')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!profileCompleteForSms}
              onClick={() => setShowSmsAuth(true)}
              className="px-4 py-2 border border-white/30 text-white/80 hover:bg-white/10 hover:border-white/40 font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {t('account.sms.start')}
            </motion.button>
          </motion.div>
        )}
        
        {activeTab === 'profile' && !profileCompleteForSms && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold"
          >
            Aby rozpocząć weryfikację SMS, uzupełnij: {missingFields.join(', ')}
          </motion.div>
        )}
        
        {activeTab === 'security' && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="rounded-2xl border border-white/25 bg-black/70 p-4"
          >
            <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-gold" />
              {t('account.security.title')}
            </h3>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Lock className="w-3 h-3" />
                  Nowe hasło
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nowe hasło"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Lock className="w-3 h-3" />
                  Potwierdź hasło
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Potwierdź hasło"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                />
              </div>
              <AnimatePresence>
                {passError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg overflow-hidden"
                  >
                    <p className="text-red-400 text-sm">{passError}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={passSaving}
                  onClick={onChangePassword}
                  className="px-6 py-2 bg-gold text-navy hover:bg-gold/90 hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  {passSaving ? 'Zapisywanie…' : 'Zmień hasło'}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="rounded-2xl border border-white/25 bg-black/70 p-4"
          >
            <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
              <Settings className="w-5 h-5 text-gold" />
              {t('account.settings.title')}
            </h3>
            <div className="mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  signOut();
                  onClose();
                }}
                className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium rounded-lg transition-all duration-200"
              >
                {t('account.settings.signout')}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <UnifiedModal
        isOpen={showSmsAuth}
        onClose={() => setShowSmsAuth(false)}
        title={null as any} // Hide default title as PhoneVerification has its own
        showCloseButton={true}
        size="md"
        type="default"
      >
        <PhoneVerification 
          onVerified={() => {
            setShowSmsAuth(false);
            // Profile refresh is handled by PhoneVerification calling updateProfile({}) which triggers context update
          }}
          initialPhone={phone}
          lockPhone={false}
          embedded={true}
        />
      </UnifiedModal>

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

const AccountModal: React.FC<Props> = ({ open, onClose }) => {
  const { user, profile, loading, signOut } = useAuth();
  const { t } = useLocale();
  const { updateUserProfile, loading: profileSaving, error: profileError } = useProfile();

  const modalTitle =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile?.name || 'Panel konta';

  const modalSubtitle = profile
    ? profile.role === 'ADMIN'
      ? 'Administrator'
      : profile.role === 'USER_FULL_VERIFIED'
        ? 'Użytkownik w pełni zweryfikowany'
        : profile.role === 'USER_EMAIL_VERIFIED'
          ? 'Email zweryfikowany'
          : profile.role === 'USER_REGISTERED'
            ? 'Użytkownik zarejestrowany'
            : 'Użytkownik'
    : t('account.status.next');

  return (
    <UnifiedModal
      isOpen={open}
      onClose={onClose}
      title={modalTitle}
      message={modalSubtitle}
      size="xl"
      type="default"
      draggable
      bodyScrollable
    >
      {loading ? (
        <div className="p-6 text-center text-muted-foreground">Ładowanie…</div>
      ) : user && profile ? (
        <AccountModalContent
          key={profile?.id || 'account-modal'}
          onClose={onClose}
          profile={profile}
          signOut={signOut}
          profileError={profileError}
          profileSaving={profileSaving}
          updateUserProfile={updateUserProfile}
        />
      ) : (
        <div className="text-center space-y-3 py-6">
          <div className="text-foreground">Zaloguj się, aby zobaczyć panel konta</div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onClose();
              window.location.href = '/auth?mode=login&callbackUrl=/account';
            }}
            className="px-6 py-2 bg-gold text-navy hover:bg-gold/90 hover:shadow-lg hover:shadow-gold/20 font-medium rounded-lg transition-all duration-200"
          >
            Przejdź do logowania
          </motion.button>
        </div>
      )}
    </UnifiedModal>
  );
};

export default AccountModal;
