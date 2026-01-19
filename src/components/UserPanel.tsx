import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { User, MapPin, Star, Shield, Settings, X, Calendar, Phone, Mail, Lock, Save, Trophy, Package, Clock, Award, CreditCard, Bell, LogOut, Edit3, Check, AlertCircle, TrendingUp, Heart, Eye, EyeOff, Crown, Zap, Sparkles, Plus } from 'lucide-react';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedToast } from "@/hooks/use-optimized-toast";
import { useLocale } from '@/contexts/LocaleContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import UnifiedModal from '@/components/ui/UnifiedModal';

interface UserPanelProps {
  onClose: () => void;
}

const UserPanel: React.FC<UserPanelProps> = ({ onClose }) => {
  const { user, profile, signOut } = useAuth();
  const { t } = useLocale();
  const { updateUserProfile, loading: profileSaving, error: profileError } = useProfile();
  const { success: showSuccess, error: showError } = useOptimizedToast();
  const navigate = useNavigate();

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Mouse tracking for parallax effects (disabled to prevent flickering)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  // Glitch effect states (disabled to prevent flickering)
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [chromaticShift, setChromaticShift] = useState(0);

  // Mouse tracking effect (disabled to prevent flickering)
  useEffect(() => {
    // Disabled mouse tracking to prevent flickering effects
    return () => {};
  }, []);

  // Parallax transforms for different layers
  const layer1X = useTransform(mouseX, [0, 1], [-20, 20]);
  const layer1Y = useTransform(mouseY, [0, 1], [-15, 15]);
  const layer2X = useTransform(mouseX, [0, 1], [-40, 40]);
  const layer2Y = useTransform(mouseY, [0, 1], [-30, 30]);
  const layer3X = useTransform(mouseX, [0, 1], [-60, 60]);
  const layer3Y = useTransform(mouseY, [0, 1], [-45, 45]);

  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'security' | 'auctions'>('overview');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragConstraintsRef = useRef(null);
  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [street, setStreet] = useState(profile?.street ?? '');
  const [postalCode, setPostalCode] = useState(profile?.postal_code ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [country, setCountry] = useState(profile?.country ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [showSmsAuth, setShowSmsAuth] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSaving, setPassSaving] = useState(false);
  const [passError, setPassError] = useState('');

  const isEmailVerified = profile?.role === 'USER_EMAIL_VERIFIED' || profile?.role === 'USER_FULL_VERIFIED' || profile?.role === 'ADMIN';

  const profileCompleteForSms = useMemo(() => {
    if (!isEmailVerified) return false;
    return Boolean(
      firstName.trim() &&
      lastName.trim() &&
      street.trim() &&
      postalCode.trim() &&
      city.trim() &&
      country.trim() &&
      phone.trim(),
    );
  }, [firstName, lastName, street, postalCode, city, country, phone, isEmailVerified]);

  const onSaveProfile = async () => {
    try {
      await updateUserProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
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
    } catch (err) {
      console.error('Profile save failed:', err);
      const message = (err as any)?.message || profileError || 'Nie udało się zapisać profilu.';
      setFeedbackType('error');
      setFeedbackTitle('Nie zapisano');
      setFeedbackMessage(message);
      setFeedbackOpen(true);
      showError({ message });
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
      const { supabase } = await import('@/lib/supabase');
      if (!supabase) {
        setPassError('Brak połączenia z bazą danych');
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPassError(error.message ?? 'Nie udało się zmienić hasła');
        return;
      }
      setNewPassword('');
      setConfirmPassword('');
      showSuccess({ message: 'Hasło zostało zmienione' });
    } catch (err: any) {
      setPassError(err?.message ?? 'Wystąpił błąd przy zmianie hasła');
    } finally {
      setPassSaving(false);
    }
  };

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = 50;
    const velocityThreshold = 500;
    
    if (Math.abs(offset.y) > swipeThreshold || Math.abs(velocity.y) > velocityThreshold) {
      onClose();
    }
    setIsDragging(false);
  }, [onClose]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex items-start justify-center p-4 min-h-screen"
        onClick={onClose}
        style={{ top: window.scrollY }}
      >
        {/* Transparent backdrop for click-to-close */}
        <div className="absolute inset-0" />

        {/* Main modal - simplified without cinematic effects */}
        <motion.div
          ref={dragConstraintsRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full max-w-6xl max-h-[85vh] overflow-hidden bg-hero-gradient rounded-2xl border border-white/20 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >

          {/* Header - simplified without 3D effects */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative p-6 md:p-8 border-b border-white/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Simple avatar */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-lg shadow-gold/30">
                  <Crown className="w-8 h-8 text-navy" />
                </div>

                {/* Title - simplified without 3D effects */}
                <div className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                  Panel Użytkownika
                </div>
              </div>

              {/* Close button - simplified */}
              <button
                onClick={onClose}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200"
                aria-label="Zamknij panel użytkownika"
              >
                <X className="w-5 h-5 text-white/80" />
              </button>
            </div>
          </motion.div>

          {/* Status Cards - simplified */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-4 gap-4 p-6"
          >
            {[
              { icon: Mail, label: 'Email', value: user?.email ?? '', color: 'from-blue-500 to-cyan-500' },
              { icon: Star, label: 'Status', value: profile?.role ?? '-', color: 'from-gold to-gold-dark' },
              { icon: Calendar, label: 'Następny krok', value: profile?.role === 'USER_REGISTERED' ? 'Zweryfikuj email' : profile?.role === 'USER_EMAIL_VERIFIED' ? 'Uzupełnij profil' : profile?.role === 'USER_FULL_VERIFIED' || profile?.role === 'ADMIN' ? 'Konto aktywne' : '-', color: 'from-purple-500 to-pink-500' },
              { icon: Phone, label: 'Telefon', value: profile?.phone ?? 'Nie dodano', color: 'from-green-500 to-emerald-500' },
            ].map((card, index) => (
              <div
                key={card.label}
                className="relative bg-black/60 backdrop-blur-xl rounded-2xl border border-white/20 p-4 h-full"
              >
                <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                  <card.icon className="w-4 h-4" />
                  {card.label}
                </div>
                <div className="text-white text-sm font-medium break-all">{card.value}</div>
              </div>
            ))}
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/20">
            {[
              { id: 'overview', label: 'Przegląd', icon: User },
              { id: 'profile', label: 'Profil', icon: Settings },
              { id: 'security', label: 'Bezpieczeństwo', icon: Shield },
              { id: 'auctions', label: 'Aukcje', icon: Package },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-gold text-white'
                    : 'border-transparent text-white/70 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full"
                >
                  <div className="grid grid-cols-2 gap-4 h-full">
                    <div className="rounded-xl border border-white/15 bg-black/40 p-4">
                      <h3 className="font-display text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-gold" />
                        Podsumowanie konta
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">Twoje aukcje</span>
                          <span className="text-white text-xl font-bold">0</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">Aktywne licytacje</span>
                          <span className="text-white text-xl font-bold">0</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-xl border border-white/15 bg-black/40 p-4">
                      <h3 className="font-display text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Star className="w-5 h-5 text-gold" />
                        Status konta
                      </h3>
                      <div className="space-y-3">
                        {profile?.role === 'USER_REGISTERED' && (
                          <div className="p-3 bg-amber-500/20 border border-amber-500/50 rounded-lg">
                            <p className="text-amber-300 text-sm">Wymagana weryfikacja email</p>
                          </div>
                        )}
                        {profile?.role === 'USER_EMAIL_VERIFIED' && (
                          <div className="p-3 bg-gold/20 border border-gold/50 rounded-lg">
                            <p className="text-gold text-sm">Uzupełnij profil</p>
                          </div>
                        )}
                        {profile?.role === 'USER_FULL_VERIFIED' && (
                          <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                            <p className="text-green-300 text-sm">Konto aktywne</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full"
                >
                  <div className="grid grid-cols-2 gap-4 h-full">
                    <div className="rounded-xl border border-white/15 bg-black/40 p-4">
                      <h3 className="font-display text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-gold" />
                        Dane podstawowe
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-white">Imię</label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Imię"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-white">Nazwisko</label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Nazwisko"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-white">Telefon</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+48 600 000 000"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-xl border border-white/15 bg-black/40 p-4">
                      <h3 className="font-display text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-gold" />
                        Adres
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-white">Ulica i numer</label>
                          <input
                            type="text"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            placeholder="Ulica i numer"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-white">Miasto</label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Miasto"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-white">Kod pocztowy</label>
                          <input
                            type="text"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            placeholder="00-000"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-white">Kraj</label>
                          <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="Polska"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-3">
                    <Button
                      disabled={profileSaving}
                      onClick={onSaveProfile}
                      className="bg-gold text-navy hover:bg-gold/90"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {profileSaving ? 'Zapisywanie...' : 'Zapisz profil'}
                    </Button>
                    
                    {isEmailVerified && (
                      <Button
                        variant="outline"
                        disabled={!profileCompleteForSms}
                        onClick={() => setShowSmsAuth(true)}
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        Weryfikacja SMS
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full"
                >
                  <div className="grid grid-cols-2 gap-4 h-full">
                    <div className="rounded-xl border border-white/15 bg-black/40 p-4">
                      <h3 className="font-display text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-gold" />
                        Zmień hasło
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-white">Nowe hasło</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nowe hasło"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-white">Potwierdź hasła</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Potwierdź hasła"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200"
                          />
                        </div>
                        {passError && (
                          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                            <p className="text-red-400 text-sm">{passError}</p>
                          </div>
                        )}
                        <Button
                          disabled={passSaving}
                          onClick={onChangePassword}
                          className="bg-gold text-navy hover:bg-gold/90"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          {passSaving ? 'Zmienianie...' : 'Zmień hasło'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                      <h4 className="font-medium text-red-200 mb-2">Wyloguj się</h4>
                      <p className="text-red-300 text-sm mb-3">
                        Zakończ sesję i wyloguj się ze swojego konta.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          signOut();
                          onClose();
                        }}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                      >
                        Wyloguj się
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'auctions' && (
                <motion.div
                  key="auctions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full"
                >
                  <div className="grid grid-cols-2 gap-4 h-full">
                    <div className="rounded-xl border border-white/15 bg-black/40 p-4">
                      <h3 className="font-display text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Package className="w-5 h-5 text-gold" />
                        Moje aukcje
                      </h3>
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-white/30 mx-auto mb-4" />
                        <p className="text-white/60 mb-4">Nie masz jeszcze żadnych aukcji</p>
                        <Button 
                          onClick={() => {
                            onClose();
                            navigate('/auctions');
                            setTimeout(() => {
                              window.dispatchEvent(new CustomEvent('openCategorySelector'));
                            }, 100);
                          }}
                          className="w-full bg-gold text-navy hover:bg-gold/90"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Stwórz aukcję
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/15 bg-black/40 p-4">
                      <h3 className="font-display text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gold" />
                        Moje licytacje
                      </h3>
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-white/30 mx-auto mb-4" />
                        <p className="text-white/60">Nie bierzesz udziału w żadnych licytacjach</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

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
    </>
  );
};

export default UserPanel;
