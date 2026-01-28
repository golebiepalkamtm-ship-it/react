import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { User, MapPin, Star, Shield, Settings, X, Calendar, Phone, Mail, Lock, Save, Trophy, Package, Clock, Award, CreditCard, Bell, LogOut, Edit3, Check, AlertCircle, TrendingUp, Heart, Eye, EyeOff, Crown, Zap, Sparkles, Plus } from 'lucide-react';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedToast } from "@/hooks/use-optimized-toast";
import { useLocale } from '@/contexts/LocaleContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { UnifiedModal } from '@/components/ui/UnifiedModal';

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

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-end md:items-center md:justify-center p-0 md:p-4 bg-black/40 pointer-events-none"
      >
        <motion.div
          ref={dragConstraintsRef}
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.4, 0, 0.2, 1],
            scale: { type: "spring", stiffness: 300, damping: 30 }
          }}
          className="relative w-full md:max-w-7xl h-[100vh] md:h-auto md:max-h-[90vh] flex flex-col overflow-y-auto scrollbar-hide pointer-events-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-t-3xl md:rounded-3xl border border-slate-200 shadow-2xl shadow-slate-300/50"
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >

          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: 'linear-gradient(45deg, transparent, rgba(212, 175, 55, 0.1), transparent)',
              backgroundSize: '200% 200%',
            }}
            animate={{
              backgroundPosition: isHovered ? ['0% 0%', '100% 100%', '0% 0%'] : '0% 0%',
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
            className="relative flex-shrink-0 p-6 md:p-8 border-b border-slate-200 bg-white/80 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="relative w-16 h-16 rounded-full bg-gradient-to-br from-gold via-gold-light to-gold flex items-center justify-center shadow-lg shadow-gold/30"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full opacity-20"
                    style={{
                      background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.8), transparent)',
                    }}
                  />
                  <Crown className="w-8 h-8 text-slate-800 relative z-10" />
                </motion.div>

                <div className="space-y-1">
                  <motion.div 
                    className="font-display text-3xl md:text-4xl font-bold text-slate-800"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Panel Użytkownika
                  </motion.div>
                  <motion.div
                    className="text-sm text-slate-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {user?.email}
                  </motion.div>
                </div>
              </div>

              <motion.button
                onClick={onClose}
                className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 backdrop-blur-sm border border-slate-300 transition-all duration-200 group"
                aria-label="Zamknij panel użytkownika"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-slate-700 group-hover:text-slate-900 transition-colors" />
              </motion.button>
            </div>
          </motion.div>

          {/* Status Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-50/80"
          >
            {[
              { icon: Mail, label: 'Email', value: user?.email ?? '', color: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/30' },
              { icon: Star, label: 'Status', value: profile?.role ?? '-', color: 'from-gold to-gold-dark', glow: 'shadow-gold/30' },
              { icon: Calendar, label: 'Następny krok', value: profile?.role === 'USER_REGISTERED' ? 'Zweryfikuj email' : profile?.role === 'USER_EMAIL_VERIFIED' ? 'Uzupełnij profil' : profile?.role === 'USER_FULL_VERIFIED' || profile?.role === 'ADMIN' ? 'Konto aktywne' : '-', color: 'from-purple-500 to-pink-500', glow: 'shadow-purple-500/30' },
              { icon: Phone, label: 'Telefon', value: profile?.phone ?? 'Nie dodano', color: 'from-green-500 to-emerald-500', glow: 'shadow-green-500/30' },
            ].map((card, index) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`relative bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200 p-4 overflow-hidden group hover:border-slate-300 hover:shadow-lg transition-all duration-300`}
              >
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                    >
                      <card.icon className="w-4 h-4" />
                    </motion.div>
                    {card.label}
                  </div>
                  <div className="text-slate-800 text-sm font-medium break-words line-clamp-2">{card.value}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex-shrink-0 flex gap-2 px-6 border-b border-slate-200 bg-white/60 overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: 'Przegląd', icon: User },
              { id: 'profile', label: 'Profil', icon: Settings },
              { id: 'security', label: 'Bezpieczeństwo', icon: Shield },
              { id: 'auctions', label: 'Aukcje', icon: Package },
            ].map((tab, index) => (
              <motion.button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`relative px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-gold text-slate-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gold/10 rounded-t-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{ rotate: activeTab === tab.id ? [0, 10, -10, 0] : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <tab.icon className="w-4 h-4 relative z-10" />
                </motion.div>
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="h-full"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div 
                      className="rounded-2xl border border-white/20 bg-gradient-to-br from-black/60 to-black/40 p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-white/30 transition-all duration-300"
                      whileHover={{ y: -5, scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <Trophy className="w-6 h-6 text-gold" />
                        </motion.div>
                        Podsumowanie konta
                      </h3>
                      <div className="space-y-4">
                        <motion.div 
                          className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                          whileHover={{ x: 5 }}
                        >
                          <span className="text-white/70 text-sm flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Twoje aukcje
                          </span>
                          <motion.span 
                            className="text-white text-2xl font-bold"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                          >
                            0
                          </motion.span>
                        </motion.div>
                        <motion.div 
                          className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                          whileHover={{ x: 5 }}
                        >
                          <span className="text-white/70 text-sm flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Aktywne licytacje
                          </span>
                          <motion.span 
                            className="text-white text-2xl font-bold"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4, type: "spring" }}
                          >
                            0
                          </motion.span>
                        </motion.div>
                        <motion.div 
                          className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                          whileHover={{ x: 5 }}
                        >
                          <span className="text-white/70 text-sm flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            Obserwowane
                          </span>
                          <motion.span 
                            className="text-white text-2xl font-bold"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                          >
                            0
                          </motion.span>
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="rounded-2xl border border-white/20 bg-gradient-to-br from-black/60 to-black/40 p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-white/30 transition-all duration-300"
                      whileHover={{ y: -5, scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Star className="w-6 h-6 text-gold" />
                        </motion.div>
                        Status konta
                      </h3>
                      <div className="space-y-4">
                        {profile?.role === 'USER_REGISTERED' && (
                          <motion.div 
                            className="p-4 bg-amber-500/20 border border-amber-500/50 rounded-xl backdrop-blur-sm"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <p className="text-amber-300 text-sm font-medium flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              Wymagana weryfikacja email
                            </p>
                          </motion.div>
                        )}
                        {profile?.role === 'USER_EMAIL_VERIFIED' && (
                          <motion.div 
                            className="p-4 bg-gold/20 border border-gold/50 rounded-xl backdrop-blur-sm"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <p className="text-gold text-sm font-medium flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              Uzupełnij profil
                            </p>
                          </motion.div>
                        )}
                        {profile?.role === 'USER_FULL_VERIFIED' && (
                          <motion.div 
                            className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl backdrop-blur-sm"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <p className="text-green-300 text-sm font-medium flex items-center gap-2">
                              <Check className="w-4 h-4" />
                              Konto aktywne
                            </p>
                          </motion.div>
                        )}
                        {profile?.role === 'ADMIN' && (
                          <motion.div 
                            className="p-4 bg-purple-500/20 border border-purple-500/50 rounded-xl backdrop-blur-sm"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <p className="text-purple-300 text-sm font-medium flex items-center gap-2">
                              <Crown className="w-4 h-4" />
                              Administrator
                            </p>
                          </motion.div>
                        )}
                        
                        <div className="pt-4 space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/60">Poziom weryfikacji</span>
                            <motion.div 
                              className="flex gap-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              {[1, 2, 3].map((level) => (
                                <motion.div
                                  key={level}
                                  className={`w-8 h-2 rounded-full ${
                                    (profile?.role === 'USER_REGISTERED' && level <= 1) ||
                                    (profile?.role === 'USER_EMAIL_VERIFIED' && level <= 2) ||
                                    ((profile?.role === 'USER_FULL_VERIFIED' || profile?.role === 'ADMIN') && level <= 3)
                                      ? 'bg-gold'
                                      : 'bg-white/20'
                                  }`}
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  transition={{ delay: 0.4 + level * 0.1 }}
                                />
                              ))}
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div 
                      className="rounded-2xl border border-white/20 bg-gradient-to-br from-black/60 to-black/40 p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-white/30 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ y: -3 }}
                    >
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <User className="w-6 h-6 text-gold" />
                        </motion.div>
                        Dane podstawowe
                      </h3>
                      <div className="space-y-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <label className="text-sm font-medium text-white/90 mb-2 block">Imię</label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Imię"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 }}
                        >
                          <label className="text-sm font-medium text-white/90 mb-2 block">Nazwisko</label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Nazwisko"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <label className="text-sm font-medium text-white/90 mb-2 block">Telefon</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+48 600 000 000"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="rounded-2xl border border-white/20 bg-gradient-to-br from-black/60 to-black/40 p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-white/30 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      whileHover={{ y: -3 }}
                    >
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          transition={{ duration: 0.3 }}
                        >
                          <MapPin className="w-6 h-6 text-gold" />
                        </motion.div>
                        Adres
                      </h3>
                      <div className="space-y-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <label className="text-sm font-medium text-white/90 mb-2 block">Ulica i numer</label>
                          <input
                            type="text"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            placeholder="Ulica i numer"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 }}
                        >
                          <label className="text-sm font-medium text-white/90 mb-2 block">Miasto</label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Miasto"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                          />
                        </motion.div>
                        <div className="grid grid-cols-2 gap-4">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <label className="text-sm font-medium text-white/90 mb-2 block">Kod pocztowy</label>
                            <input
                              type="text"
                              value={postalCode}
                              onChange={(e) => setPostalCode(e.target.value)}
                              placeholder="00-000"
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                            />
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 }}
                          >
                            <label className="text-sm font-medium text-white/90 mb-2 block">Kraj</label>
                            <input
                              type="text"
                              value={country}
                              onChange={(e) => setCountry(e.target.value)}
                              placeholder="Polska"
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                            />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        disabled={profileSaving}
                        onClick={onSaveProfile}
                        className="bg-gradient-to-r from-gold to-gold-dark text-navy hover:from-gold-light hover:to-gold font-semibold shadow-lg shadow-gold/30 hover:shadow-xl hover:shadow-gold/50 transition-all duration-300"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {profileSaving ? 'Zapisywanie...' : 'Zapisz profil'}
                      </Button>
                    </motion.div>
                    
                    {isEmailVerified && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          disabled={!profileCompleteForSms}
                          onClick={() => setShowSmsAuth(true)}
                          className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Weryfikacja SMS
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="h-full"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div 
                      className="rounded-2xl border border-white/20 bg-gradient-to-br from-black/60 to-black/40 p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-white/30 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ y: -3 }}
                    >
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: [0, -10, 10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <Shield className="w-6 h-6 text-gold" />
                        </motion.div>
                        Zmień hasło
                      </h3>
                      <div className="space-y-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <label className="text-sm font-medium text-white/90 mb-2 block">Nowe hasło</label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Nowe hasło"
                              className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 }}
                        >
                          <label className="text-sm font-medium text-white/90 mb-2 block">Potwierdź hasło</label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Potwierdź hasło"
                              className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </motion.div>
                        {passError && (
                          <motion.div 
                            className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl backdrop-blur-sm"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <p className="text-red-400 text-sm flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              {passError}
                            </p>
                          </motion.div>
                        )}
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            disabled={passSaving}
                            onClick={onChangePassword}
                            className="w-full bg-gradient-to-r from-gold to-gold-dark text-navy hover:from-gold-light hover:to-gold font-semibold shadow-lg shadow-gold/30 hover:shadow-xl hover:shadow-gold/50 transition-all duration-300"
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            {passSaving ? 'Zmienianie...' : 'Zmień hasło'}
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-500/20 to-red-900/20 p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-red-500/60 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      whileHover={{ y: -3 }}
                    >
                      <h4 className="font-display text-xl font-semibold text-red-200 mb-3 flex items-center gap-2">
                        <LogOut className="w-6 h-6" />
                        Wyloguj się
                      </h4>
                      <p className="text-red-300 text-sm mb-4 leading-relaxed">
                        Zakończ sesję i wyloguj się ze swojego konta. Będziesz musiał ponownie zalogować się, aby uzyskać dostęp do swojego konta.
                      </p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          onClick={() => {
                            signOut();
                            onClose();
                          }}
                          className="w-full border-red-500/50 text-red-300 hover:bg-red-500/30 hover:border-red-500/70 transition-all duration-300"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Wyloguj się
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'auctions' && (
                <motion.div
                  key="auctions"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="h-full"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div 
                      className="rounded-2xl border border-white/20 bg-gradient-to-br from-black/60 to-black/40 p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-white/30 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ y: -3 }}
                    >
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <Package className="w-6 h-6 text-gold" />
                        </motion.div>
                        Moje aukcje
                      </h3>
                      <div className="text-center py-8">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        >
                          <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
                        </motion.div>
                        <p className="text-white/60 mb-6">Nie masz jeszcze żadnych aukcji</p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            onClick={() => {
                              onClose();
                              navigate('/auctions');
                              setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('openCategorySelector'));
                              }, 100);
                            }}
                            className="w-full bg-gradient-to-r from-gold to-gold-dark text-navy hover:from-gold-light hover:to-gold font-semibold shadow-lg shadow-gold/30 hover:shadow-xl hover:shadow-gold/50 transition-all duration-300"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Stwórz aukcję
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="rounded-2xl border border-white/20 bg-gradient-to-br from-black/60 to-black/40 p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-white/30 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      whileHover={{ y: -3 }}
                    >
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Clock className="w-6 h-6 text-gold" />
                        </motion.div>
                        Moje licytacje
                      </h3>
                      <div className="text-center py-8">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        >
                          <Clock className="w-16 h-16 text-white/30 mx-auto mb-4" />
                        </motion.div>
                        <p className="text-white/60">Nie bierzesz udziału w żadnych licytacjach</p>
                      </div>
                    </motion.div>
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
  , document.body);
};

export default UserPanel;
