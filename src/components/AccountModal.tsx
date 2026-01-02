import React, { useState } from 'react';
import GlassModal from './GlassModal';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PhoneVerification from '@/components/auth/PhoneVerification';
import { useProfile } from '@/hooks/useProfile';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Building,
  Globe,
  ShieldCheck,
  Flag,
  AlertCircle,
  X,
  Bell,
  Camera,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  Key,
  Star,
  TrendingUp,
  History,
  Settings2,
  Lock,
  Smartphone,
  Globe2,
  Palette,
  Heart,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
}

type TabType = 'profile' | 'settings' | 'activity' | 'notifications' | 'security';

const AccountModal: React.FC<Props> = ({ open, onClose }) => {
  const { user, profile, loading } = useAuth();
  const { updateUserProfile, loading: profileSaving, error: profileError } = useProfile();

  const role = profile?.role || 'USER_EMAIL_VERIFIED';
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const [draftProfile, setDraftProfile] = useState<{
    name?: string;
    street?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    city?: string;
  }>({});
  
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    bidding: true,
    auctions: false,
    marketing: false
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: 30
  });

  const [showSmsAuth, setShowSmsAuth] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const isEmailVerified = role === 'USER_EMAIL_VERIFIED' || role === 'USER_FULL_VERIFIED' || role === 'ADMIN';

  const effectiveName = draftProfile.name ?? profile?.name ?? '';
  const effectiveStreet = draftProfile.street ?? profile?.street ?? '';
  const effectivePostalCode = draftProfile.postalCode ?? profile?.postal_code ?? '';
  const effectiveCountry = draftProfile.country ?? profile?.country ?? '';
  const effectivePhone = draftProfile.phone ?? profile?.phone ?? '';
  const effectiveCity = draftProfile.city ?? (profile as any)?.city ?? '';

  const profileCompleteForSms =
    isEmailVerified &&
    Boolean(
      effectiveName.trim() &&
      effectiveStreet.trim() &&
      effectiveCity.trim() &&
      effectivePostalCode.trim() &&
      effectiveCountry.trim() &&
      effectivePhone.trim()
    );

  const onSaveProfile = async () => {
    const payload: any = {
      name: effectiveName.trim(),
      street: effectiveStreet.trim(),
      city: effectiveCity.trim(),
      postal_code: effectivePostalCode.trim(),
      country: effectiveCountry.trim(),
      phone: effectivePhone.trim(),
    };
    await updateUserProfile(payload);
    setDraftProfile({});
  };

  if (!open) return null;

  if (loading) {
    return (
      <GlassModal open={open} onClose={onClose} variant="glass" hideCloseButton>
        <div className="flex items-center justify-center p-8">
            <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"/>
                <div className="text-white/80 font-medium text-sm">Ładowanie...</div>
            </div>
        </div>
      </GlassModal>
    );
  }

  if (!user) return null;

  const handleClose = () => {
    setShowSmsAuth(false);
    setDraftProfile({});
    onClose();
  };

  const inputClassName = "bg-white/5 border-white/10 text-white text-sm placeholder:text-white/30 focus-visible:ring-[#D4AF37] focus-visible:border-[#D4AF37]/50 h-10 transition-all duration-300 hover:bg-white/10 hover:border-white/20";
  const readOnlyInputClassName = "bg-black/20 border-white/5 text-white/50 cursor-default focus-visible:ring-0 hover:bg-black/20 hover:border-white/5";
  const labelClassName = "text-white/60 font-medium mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wider";

  const getStatusText = (role: string) => {
      if (role === 'ADMIN') return 'Administrator';
      if (role === 'USER_FULL_VERIFIED') return 'Zweryfikowany';
      return 'Weryfikacja wymagana';
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Profil', icon: User },
    { id: 'settings' as TabType, label: 'Ustawienia', icon: Settings2 },
    { id: 'activity' as TabType, label: 'Aktywność', icon: History },
    { id: 'notifications' as TabType, label: 'Powiadomienia', icon: Bell },
    { id: 'security' as TabType, label: 'Bezpieczeństwo', icon: Lock },
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8A7020] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
            {avatarFile ? (
              <img 
                src={URL.createObjectURL(avatarFile)} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center hover:bg-[#8A7020] transition-colors">
            <Camera className="w-3 h-3 text-white" />
          </button>
        </div>
        <div>
          <h3 className="text-white font-medium">Zdjęcie profilowe</h3>
          <p className="text-white/60 text-sm">Dodaj zdjęcie aby spersonalizować swój profil</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className={labelClassName}>
            <User className="w-3 h-3" /> Imię i nazwisko
          </Label>
          <Input 
            value={effectiveName} 
            onChange={(e) => setDraftProfile((prev) => ({ ...prev, name: e.target.value }))} 
            placeholder="Jan Kowalski" 
            className={inputClassName}
          />
        </div>

        <div className="space-y-1.5">
          <Label className={labelClassName}>
            <Phone className="w-3 h-3" /> Telefon
          </Label>
          <Input 
            type="tel" 
            value={effectivePhone} 
            onChange={(e) => setDraftProfile((prev) => ({ ...prev, phone: e.target.value }))} 
            placeholder="+48..." 
            className={inputClassName}
          />
        </div>

        <div className="space-y-1.5">
          <Label className={labelClassName}>
            <Mail className="w-3 h-3" /> E-mail
          </Label>
          <Input 
            value={user.email || ''} 
            readOnly
            className={cn(inputClassName, readOnlyInputClassName)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className={labelClassName}>
            <ShieldCheck className="w-3 h-3" /> Status
          </Label>
          <Input 
            value={getStatusText(profile?.role ?? '')} 
            readOnly
            className={cn(inputClassName, readOnlyInputClassName, "text-[#D4AF37]/80 font-medium")}
          />
        </div>

        <div className="space-y-1.5">
          <Label className={labelClassName}>
            <MapPin className="w-3 h-3" /> Ulica i numer
          </Label>
          <Input 
            value={effectiveStreet} 
            onChange={(e) => setDraftProfile((prev) => ({ ...prev, street: e.target.value }))} 
            placeholder="Ulica 1/2" 
            className={inputClassName}
          />
        </div>

        <div className="space-y-1.5">
          <Label className={labelClassName}>
            <Flag className="w-3 h-3" /> Kod pocztowy
          </Label>
          <Input 
            value={effectivePostalCode} 
            onChange={(e) => setDraftProfile((prev) => ({ ...prev, postalCode: e.target.value }))} 
            placeholder="00-000" 
            className={inputClassName}
          />
        </div>

        <div className="space-y-1.5">
          <Label className={labelClassName}>
            <Building className="w-3 h-3" /> Miasto
          </Label>
          <Input 
            value={effectiveCity} 
            onChange={(e) => setDraftProfile((prev) => ({ ...prev, city: e.target.value }))} 
            placeholder="Miasto" 
            className={inputClassName}
          />
        </div>

        <div className="space-y-1.5">
          <Label className={labelClassName}>
            <Globe className="w-3 h-3" /> Kraj
          </Label>
          <Input 
            value={effectiveCountry} 
            onChange={(e) => setDraftProfile((prev) => ({ ...prev, country: e.target.value }))} 
            placeholder="Polska" 
            className={inputClassName}
          />
        </div>
      </div>

      {profileError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="text-sm text-red-200">{profileError}</div>
        </div>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Globe2 className="w-4 h-4" />
            Język i region
          </h3>
          <div className="space-y-3">
            <div>
              <Label className={labelClassName}>Język</Label>
              <select className={inputClassName}>
                <option value="pl">Polski</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            <div>
              <Label className={labelClassName}>Strefa czasowa</Label>
              <select className={inputClassName}>
                <option value="Europe/Warsaw">Europa/Warszawa</option>
                <option value="Europe/London">Europa/Londyn</option>
                <option value="America/New_York">Ameryka/Nowy_Jork</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-white font-medium flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Płatności
          </h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/5 text-white">
              <CreditCard className="w-4 h-4 mr-2" />
              Dodaj metodę płatności
            </Button>
            <div className="text-sm text-white/60">Brak zapisanych metod płatności</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-white font-medium flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Preferencje aukcyjne
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Pigeons', 'Equipment', 'Art', 'Collectibles'].map((category) => (
            <label key={category} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-white/20 bg-white/5 text-[#D4AF37] focus:ring-[#D4AF37]" />
              <span className="text-white/80 text-sm">{category}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <div className="text-white font-medium">12</div>
              <div className="text-white/60 text-sm">Wygrane aukcje</div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-white font-medium">€2,450</div>
              <div className="text-white/60 text-sm">Całkowita wartość</div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-white font-medium">4.8</div>
              <div className="text-white/60 text-sm">Ocena sprzedawcy</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-white font-medium flex items-center gap-2">
          <History className="w-4 h-4" />
          Ostatnia aktywność
        </h3>
        <div className="space-y-3">
          {[
            { action: 'Wygrana aukcja', item: 'Champion Pigeon #123', time: '2 godziny temu', amount: '€450' },
            { action: 'Oferta złożona', item: 'Rare Collection Item', time: '1 dzień temu', amount: '€120' },
            { action: 'Profil zaktualizowany', item: 'Dane kontaktowe', time: '3 dni temu', amount: null },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div>
                  <div className="text-white font-medium">{activity.action}</div>
                  <div className="text-white/60 text-sm">{activity.item}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/60 text-sm">{activity.time}</div>
                {activity.amount && <div className="text-white font-medium">{activity.amount}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <h3 className="text-white font-medium flex items-center gap-2">
        <Bell className="w-4 h-4" />
        Ustawienia powiadomień
      </h3>
      <div className="space-y-3">
        {Object.entries(notifications).map(([key, val]) => (
          <label key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(val)}
                onChange={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                className="rounded border-white/20 bg-white/5 text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <span className="text-white/80 text-sm">{key}</span>
            </div>
            <div className="text-white/60 text-sm">{val ? 'Włączone' : 'Wyłączone'}</div>
          </label>
        ))}
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <h3 className="text-white font-medium flex items-center gap-2">
        <Lock className="w-4 h-4" />
        Bezpieczeństwo konta
      </h3>
      <div className="space-y-3">
        <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={securitySettings.twoFactorEnabled}
              onChange={() => setSecuritySettings((s) => ({ ...s, twoFactorEnabled: !s.twoFactorEnabled }))}
              className="rounded border-white/20 bg-white/5 text-[#D4AF37] focus:ring-[#D4AF37]"
            />
            <div>
              <div className="text-white/80 text-sm">Dwuskładnikowe logowanie (2FA)</div>
              <div className="text-white/60 text-xs">Zwiększa bezpieczeństwo konta</div>
            </div>
          </div>
          <div className="text-white/60 text-sm">{securitySettings.twoFactorEnabled ? 'Włączone' : 'Wyłączone'}</div>
        </label>

        <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2">
            <div className="text-white/80 text-sm">Powiadomienia o logowaniu</div>
            <div className="text-white/60 text-xs">Otrzymuj powiadomienia po nowych logowaniach</div>
          </div>
          <input
            type="checkbox"
            checked={securitySettings.loginNotifications}
            onChange={() => setSecuritySettings((s) => ({ ...s, loginNotifications: !s.loginNotifications }))}
            className="rounded border-white/20 bg-white/5 text-[#D4AF37] focus:ring-[#D4AF37]"
          />
        </label>
      </div>
    </div>
  );

  return (
    <GlassModal open={open} onClose={handleClose} variant="glass">
      <div className="max-w-4xl w-full">
        <div className="flex gap-6">
          <aside className="w-64 pr-4 border-r border-white/5">
            <div className="space-y-4">
              <div className="text-white font-semibold">Konto</div>
              <nav className="space-y-1">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={cn(
                      'w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm',
                      activeTab === t.id ? 'bg-white/5 text-white' : 'text-white/60 hover:bg-white/3'
                    )}
                  >
                    <t.icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main className="flex-1">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'settings' && renderSettingsTab()}
            {activeTab === 'activity' && renderActivityTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'security' && renderSecurityTab()}

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={handleClose}>Zamknij</Button>
              {activeTab === 'profile' && (
                <Button onClick={onSaveProfile} disabled={profileSaving} className="bg-[#D4AF37] text-black">
                  Zapisz
                </Button>
              )}
            </div>
          </main>
        </div>
      </div>
    </GlassModal>
  );
};

export default AccountModal;
