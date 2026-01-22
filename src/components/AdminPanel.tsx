import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  X, 
  Users, 
  Gavel, 
  BarChart3, 
  Settings, 
  Shield,
  Search,
  Ban,
  CheckCircle,
  Trash2,
  TrendingUp,
  DollarSign,
  Clock,
  UserCheck,
  Edit,
  Save,
  XCircle,
  Plus,
  Activity,
  Zap,
  Crown,
  Eye,
  RefreshCw,
  AlertTriangle,
  Database,
  Server,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { apiClient } from '@/services/api';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  createdAt: string;
  phone?: string;
  isBlocked?: boolean;
  isBanned?: boolean;
}

interface AuctionData {
  id: string;
  title: string;
  description?: string;
  currentPrice: number;
  startingPrice?: number;
  buyNowPrice?: number;
  status: string;
  createdAt: string;
  endTime?: string;
  seller: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface Stats {
  totalUsers: number;
  activeAuctions: number;
  totalAuctions: number;
  totalVolume: number;
}

type TabType = 'dashboard' | 'users' | 'auctions' | 'settings';

const StatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  gradient, 
  delay,
  trend
}: { 
  icon: any; 
  value: string | number; 
  label: string; 
  gradient: string; 
  delay: number;
  trend?: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative p-6 rounded-2xl ${gradient} border border-white/20 overflow-hidden group cursor-pointer`}
    >
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
        }}
      />
      
      <motion.div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' }}
        animate={{ 
          scale: isHovered ? 1.5 : 1,
          rotate: isHovered ? 90 : 0 
        }}
        transition={{ duration: 0.5 }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <motion.div
            animate={{ rotate: isHovered ? [0, -10, 10, 0] : 0 }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-8 h-8 text-white/90" />
          </motion.div>
          {trend !== undefined && (
            <motion.div 
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2 }}
            >
              <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(trend)}%
            </motion.div>
          )}
        </div>
        <motion.p 
          className="text-4xl font-bold text-white mb-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + 0.1 }}
        >
          {value}
        </motion.p>
        <p className="text-sm text-white/70">{label}</p>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/0 via-white/50 to-white/0"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const { profile, session } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [users, setUsers] = useState<UserData[]>([]);
  const [auctions, setAuctions] = useState<AuctionData[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeAuctions: 0,
    totalAuctions: 0,
    totalVolume: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editingAuction, setEditingAuction] = useState<AuctionData | null>(null);

  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'USER_REGISTERED',
    phone: ''
  });

  const [isCreatingAuction, setIsCreatingAuction] = useState(false);
  const [newAuction, setNewAuction] = useState({
    title: '',
    description: '',
    startingPrice: 0,
    buyNowPrice: 0,
    reservePrice: 0,
    status: 'ACTIVE',
    category: 'RACING',
    sex: 'MALE',
    endTime: ''
  });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const backgroundX = useTransform(mouseX, [0, 1], [-10, 10]);
  const backgroundY = useTransform(mouseY, [0, 1], [-10, 10]);

  const fetchData = React.useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const statsData = await apiClient.getWithToken<Stats>('/admin/stats', undefined, session.access_token);
      setStats(statsData);

      const usersData = await apiClient.getWithToken<{ users: UserData[] }>('/admin/users', { limit: 100 }, session.access_token);
      setUsers(usersData.users || []);

      const auctionsData = await apiClient.getWithToken<AuctionData[]>('/admin/auctions', undefined, session.access_token);
      setAuctions(auctionsData);

    } catch (error) {
      console.error("Error fetching admin data:", error);
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
      toast.error(`Błąd pobierania danych administratora: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    if (isOpen && profile?.role === 'ADMIN' && session?.access_token) {
      fetchData();
    }
  }, [isOpen, profile, session, fetchData]);

  const handleUserAction = async (userId: string, action: 'ban' | 'unban' | 'delete' | 'verify') => {
    if (!session?.access_token) return;
    try {
      if (action === 'delete') {
         if (!confirm('Czy na pewno chcesz usunąć tego użytkownika? To operacja nieodwracalna.')) return;
         await apiClient.delete(`/admin/users/${userId}`, session.access_token);
         toast.success('Użytkownik usunięty');
      } else {
        let role = '';
        if (action === 'ban') role = 'BANNED';
        if (action === 'unban') role = 'USER_REGISTERED';
        if (action === 'verify') role = 'USER_FULL_VERIFIED';
        
        await apiClient.patch(`/admin/users/${userId}`, { role }, session.access_token);
        toast.success('Rola użytkownika zaktualizowana');
      }
      
      fetchData();
    } catch (error) {
      console.error('Error performing user action:', error);
      toast.error('Błąd akcji użytkownika');
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !session?.access_token) return;

    try {
      await apiClient.patch(`/admin/users/${editingUser.id}`, editingUser, session.access_token);
      toast.success('Użytkownik zaktualizowany');
      setEditingUser(null);
      fetchData();
    } catch (error) {
      toast.error('Błąd aktualizacji użytkownika');
    }
  };

  const handleAuctionAction = async (auctionId: string, action: 'end' | 'delete') => {
    if (!session?.access_token) return;
    try {
      if (action === 'delete') {
        if (!confirm('Czy na pewno chcesz usunąć tę aukcję?')) return;
        await apiClient.delete(`/admin/auctions/${auctionId}`, session.access_token);
        toast.success('Aukcja usunięta');
      } else if (action === 'end') {
        await apiClient.patch(`/admin/auctions/${auctionId}`, { status: 'ENDED' }, session.access_token);
        toast.success('Aukcja zakończona');
      }
      fetchData();
    } catch (error) {
      console.error('Error performing auction action:', error);
      toast.error('Błąd akcji aukcji');
    }
  };

  const handleSaveAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuction || !session?.access_token) return;

    try {
      await apiClient.patch(`/admin/auctions/${editingAuction.id}`, editingAuction, session.access_token);
      toast.success('Aukcja zaktualizowana');
      setEditingAuction(null);
      fetchData();
    } catch (error) {
      toast.error('Błąd aktualizacji aukcji');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;
    try {
      await apiClient.post('/admin/users', newUser, session.access_token);
      toast.success('Użytkownik utworzony pomyślnie');
      setIsCreatingUser(false);
      setNewUser({ email: '', password: '', first_name: '', last_name: '', role: 'USER_REGISTERED', phone: '' });
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Błąd tworzenia użytkownika');
    }
  };

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;
    try {
      await apiClient.post('/admin/auctions', newAuction, session.access_token);
      toast.success('Aukcja utworzona pomyślnie');
      setIsCreatingAuction(false);
      setNewAuction({ 
        title: '', description: '', startingPrice: 0, buyNowPrice: 0, 
        reservePrice: 0, status: 'ACTIVE', category: 'RACING', sex: 'MALE', endTime: '' 
      });
      fetchData();
    } catch (error) {
       console.error(error);
       toast.error('Błąd tworzenia aukcji');
    }
  };

  const filteredUsers = users.filter(user => {
    const query = (searchQuery || '').toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.first_name?.toLowerCase().includes(query) ||
      user.last_name?.toLowerCase().includes(query)
    );
  });

  const filteredAuctions = auctions.filter(auction => {
    const query = (searchQuery || '').toLowerCase();
    return (
      auction.title?.toLowerCase().includes(query)
    );
  });

  if (profile?.role !== 'ADMIN') return null;

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: BarChart3 },
    { id: 'users' as TabType, label: 'Użytkownicy', icon: Users },
    { id: 'auctions' as TabType, label: 'Aukcje', icon: Gavel },
    { id: 'settings' as TabType, label: 'Ustawienia', icon: Settings },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-7xl max-h-[95vh] flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              mouseX.set((e.clientX - rect.left) / rect.width);
              mouseY.set((e.clientY - rect.top) / rect.height);
            }}
          >
            <motion.div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 30% 20%, rgba(212, 175, 55, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                x: backgroundX,
                y: backgroundY,
              }}
            />

            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

            <motion.div
              className="flex-shrink-0 relative flex items-center justify-between p-6 border-b border-white/10"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-4">
                <motion.div 
                  className="relative p-3 rounded-2xl bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/30"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{ 
                      boxShadow: ['0 0 20px rgba(212,175,55,0.3)', '0 0 40px rgba(212,175,55,0.5)', '0 0 20px rgba(212,175,55,0.3)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <Shield className="w-7 h-7 text-gold relative z-10" />
                </motion.div>
                <div>
                  <motion.h2 
                    className="text-2xl font-bold bg-gradient-to-r from-white via-gold-light to-gold bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Panel Administratora
                  </motion.h2>
                  <motion.p 
                    className="text-sm text-white/60 flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Activity className="w-3 h-3 text-green-400 animate-pulse" />
                    System aktywny
                  </motion.p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={handleRefresh}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className={`w-5 h-5 text-white/70 ${isRefreshing ? 'animate-spin' : ''}`} />
                </motion.button>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/10 hover:bg-red-500/30 border border-white/10 hover:border-red-500/50 transition-all duration-200 group"
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5 text-white/70 group-hover:text-red-400 transition-colors" />
                </motion.button>
              </div>
            </motion.div>

            <div className="flex-shrink-0 px-6 pt-4 pb-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={Users}
                  value={stats.totalUsers}
                  label="Użytkowników"
                  gradient="bg-gradient-to-br from-blue-600/40 to-blue-900/40"
                  delay={0.1}
                  trend={12}
                />
                <StatCard
                  icon={Gavel}
                  value={stats.activeAuctions}
                  label="Aktywnych aukcji"
                  gradient="bg-gradient-to-br from-gold/40 to-amber-900/40"
                  delay={0.15}
                  trend={8}
                />
                <StatCard
                  icon={DollarSign}
                  value={`${stats.totalVolume.toLocaleString('pl-PL')} zł`}
                  label="Łączny obrót"
                  gradient="bg-gradient-to-br from-green-600/40 to-emerald-900/40"
                  delay={0.2}
                  trend={24}
                />
                <StatCard
                  icon={Database}
                  value={stats.totalAuctions}
                  label="Wszystkich aukcji"
                  gradient="bg-gradient-to-br from-purple-600/40 to-purple-900/40"
                  delay={0.25}
                />
              </div>
            </div>

            <motion.div 
              className="flex-shrink-0 flex gap-2 px-6 py-4 border-b border-white/10 overflow-x-auto scrollbar-hide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-navy'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="adminActiveTab"
                      className="absolute inset-0 bg-gradient-to-r from-gold to-gold-light rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <tab.icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </motion.button>
              ))}
            </motion.div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {(activeTab === 'users' || activeTab === 'auctions') && (
                <motion.div 
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <motion.input
                      type="text"
                      placeholder={activeTab === 'users' ? 'Szukaj użytkowników...' : 'Szukaj aukcji...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all duration-300"
                      whileFocus={{ scale: 1.01 }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      initial={{ opacity: 0 }}
                      whileFocus={{ opacity: 1 }}
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.1), transparent)',
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <motion.div
                    className="relative w-16 h-16"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                    <div className="absolute inset-0 rounded-full border-4 border-gold border-t-transparent animate-spin" />
                  </motion.div>
                  <motion.p 
                    className="mt-4 text-white/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Ładowanie danych...
                  </motion.p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {activeTab === 'dashboard' && (
                    <motion.div
                      key="dashboard"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <motion.div 
                          className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          whileHover={{ y: -5, borderColor: 'rgba(255,255,255,0.2)' }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                              <Users className="w-5 h-5 text-gold" />
                              Ostatni użytkownicy
                            </h3>
                            <motion.span 
                              className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              {users.length} total
                            </motion.span>
                          </div>
                          <div className="space-y-3">
                            {users.slice(0, 5).map((user, index) => (
                              <motion.div 
                                key={user.id} 
                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                whileHover={{ x: 5 }}
                              >
                                <div className="flex items-center gap-3">
                                  <motion.div 
                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center border border-gold/30"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                  >
                                    <span className="text-gold font-medium">
                                      {user.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                                    </span>
                                  </motion.div>
                                  <div>
                                    <p className="text-sm font-medium text-white">
                                      {user.first_name} {user.last_name}
                                    </p>
                                    <p className="text-xs text-white/50">{user.email}</p>
                                  </div>
                                </div>
                                <motion.span 
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    user.role === 'ADMIN' ? 'bg-gold/20 text-gold' :
                                    user.role === 'USER_FULL_VERIFIED' ? 'bg-green-500/20 text-green-400' :
                                    'bg-white/10 text-white/60'
                                  }`}
                                  whileHover={{ scale: 1.1 }}
                                >
                                  {user.role === 'ADMIN' && <Crown className="w-3 h-3 inline mr-1" />}
                                  {user.role}
                                </motion.span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>

                        <motion.div 
                          className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                          whileHover={{ y: -5, borderColor: 'rgba(255,255,255,0.2)' }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                              <Gavel className="w-5 h-5 text-gold" />
                              Ostatnie aukcje
                            </h3>
                            <motion.span 
                              className="text-xs px-2 py-1 rounded-full bg-gold/20 text-gold"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.35 }}
                            >
                              {auctions.length} total
                            </motion.span>
                          </div>
                          <div className="space-y-3">
                            {auctions.slice(0, 5).map((auction, index) => (
                              <motion.div 
                                key={auction.id} 
                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 + index * 0.05 }}
                                whileHover={{ x: 5 }}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white truncate">
                                    {auction.title}
                                  </p>
                                  <p className="text-xs text-white/50">
                                    {auction.seller?.first_name} {auction.seller?.last_name}
                                  </p>
                                </div>
                                <div className="text-right ml-4">
                                  <motion.p 
                                    className="text-sm font-bold text-gold"
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    {auction.currentPrice?.toLocaleString('pl-PL')} zł
                                  </motion.p>
                                  <span className={`text-xs ${
                                    auction.status === 'ACTIVE' ? 'text-green-400' : 'text-white/50'
                                  }`}>
                                    {auction.status === 'ACTIVE' ? 'Aktywna' : 'Zakończona'}
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      </div>

                      <motion.div 
                        className="p-6 rounded-2xl bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <Sparkles className="w-6 h-6 text-gold" />
                          <h3 className="text-lg font-semibold text-white">Szybkie akcje</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { icon: Plus, label: 'Nowy użytkownik', action: () => setIsCreatingUser(true) },
                            { icon: Gavel, label: 'Nowa aukcja', action: () => setIsCreatingAuction(true) },
                            { icon: RefreshCw, label: 'Odśwież dane', action: handleRefresh },
                            { icon: Eye, label: 'Podgląd strony', action: () => window.open('/', '_blank') },
                          ].map((item, index) => (
                            <motion.button
                              key={item.label}
                              onClick={item.action}
                              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/30 transition-all duration-300"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 + index * 0.05 }}
                              whileHover={{ y: -5, scale: 1.02 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <item.icon className="w-6 h-6 text-gold" />
                              <span className="text-sm text-white/80">{item.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {activeTab === 'users' && (
                    <motion.div
                      key="users"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <p className="text-white/60 text-sm">
                          Znaleziono {filteredUsers.length} użytkowników
                        </p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            onClick={() => setIsCreatingUser(true)} 
                            className="bg-gradient-to-r from-gold to-gold-dark text-navy hover:from-gold-light hover:to-gold gap-2 shadow-lg shadow-gold/20"
                          >
                            <Plus className="w-4 h-4" /> Dodaj Użytkownika
                          </Button>
                        </motion.div>
                      </div>
                      
                      <div className="overflow-x-auto rounded-2xl border border-white/10">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                              <th className="text-left py-4 px-6 text-sm font-medium text-white/70">Użytkownik</th>
                              <th className="text-left py-4 px-6 text-sm font-medium text-white/70">Email</th>
                              <th className="text-left py-4 px-6 text-sm font-medium text-white/70">Rola</th>
                              <th className="text-left py-4 px-6 text-sm font-medium text-white/70">Data rejestracji</th>
                              <th className="text-right py-4 px-6 text-sm font-medium text-white/70">Akcje</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map((user, index) => (
                              <motion.tr 
                                key={user.id} 
                                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                              >
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-3">
                                    <motion.div 
                                      className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center border border-gold/20"
                                      whileHover={{ scale: 1.1 }}
                                    >
                                      <span className="text-gold text-sm font-medium">
                                        {user.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                                      </span>
                                    </motion.div>
                                    <span className="text-sm text-white">
                                      {user.first_name} {user.last_name}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-sm text-white/60">{user.email}</td>
                                <td className="py-4 px-6">
                                  <span className={`text-xs px-3 py-1 rounded-full ${
                                    user.role === 'ADMIN' ? 'bg-gold/20 text-gold' :
                                    user.role === 'USER_FULL_VERIFIED' ? 'bg-green-500/20 text-green-400' :
                                    user.role === 'BANNED' ? 'bg-red-500/20 text-red-400' :
                                    'bg-white/10 text-white/60'
                                  }`}>
                                    {user.role}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-sm text-white/60">
                                  {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center justify-end gap-2">
                                    <motion.button
                                      className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 transition-colors"
                                      onClick={() => setEditingUser(user)}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      title="Edytuj"
                                    >
                                      <Edit className="w-4 h-4 text-blue-400" />
                                    </motion.button>

                                    {user.role !== 'ADMIN' && (
                                      <>
                                        <motion.button
                                          className="p-2 rounded-lg bg-white/5 hover:bg-green-500/20 transition-colors"
                                          onClick={() => handleUserAction(user.id, 'verify')}
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          title="Zweryfikuj"
                                        >
                                          <UserCheck className="w-4 h-4 text-green-400" />
                                        </motion.button>
                                        {user.role === 'BANNED' ? (
                                          <motion.button
                                            className="p-2 rounded-lg bg-white/5 hover:bg-green-500/20 transition-colors"
                                            onClick={() => handleUserAction(user.id, 'unban')}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            title="Odbanuj"
                                          >
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                          </motion.button>
                                        ) : (
                                          <motion.button
                                            className="p-2 rounded-lg bg-white/5 hover:bg-orange-500/20 transition-colors"
                                            onClick={() => handleUserAction(user.id, 'ban')}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            title="Zbanuj"
                                          >
                                            <Ban className="w-4 h-4 text-orange-400" />
                                          </motion.button>
                                        )}
                                        <motion.button
                                          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors"
                                          onClick={() => handleUserAction(user.id, 'delete')}
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          title="Usuń"
                                        >
                                          <Trash2 className="w-4 h-4 text-red-400" />
                                        </motion.button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'auctions' && (
                    <motion.div
                      key="auctions"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <p className="text-white/60 text-sm">
                          Znaleziono {filteredAuctions.length} aukcji
                        </p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            onClick={() => setIsCreatingAuction(true)} 
                            className="bg-gradient-to-r from-gold to-gold-dark text-navy hover:from-gold-light hover:to-gold gap-2 shadow-lg shadow-gold/20"
                          >
                            <Plus className="w-4 h-4" /> Dodaj Aukcję
                          </Button>
                        </motion.div>
                      </div>
                      
                      <div className="overflow-x-auto rounded-2xl border border-white/10">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                              <th className="text-left py-4 px-6 text-sm font-medium text-white/70">Tytuł</th>
                              <th className="text-left py-4 px-6 text-sm font-medium text-white/70">Sprzedawca</th>
                              <th className="text-right py-4 px-6 text-sm font-medium text-white/70">Cena</th>
                              <th className="text-center py-4 px-6 text-sm font-medium text-white/70">Status</th>
                              <th className="text-right py-4 px-6 text-sm font-medium text-white/70">Akcje</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAuctions.map((auction, index) => (
                              <motion.tr 
                                key={auction.id} 
                                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                              >
                                <td className="py-4 px-6">
                                  <span className="text-sm text-white">{auction.title}</span>
                                </td>
                                <td className="py-4 px-6">
                                  <span className="text-sm text-white/60">
                                    {auction.seller?.first_name} {auction.seller?.last_name}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <motion.span 
                                    className="text-sm text-gold font-bold"
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    {auction.currentPrice?.toLocaleString('pl-PL')} zł
                                  </motion.span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <span className={`text-xs px-3 py-1 rounded-full ${
                                    auction.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'
                                  }`}>
                                    {auction.status === 'ACTIVE' ? 'Aktywna' : 'Zakończona'}
                                  </span>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center justify-end gap-2">
                                    <motion.button
                                      className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 transition-colors"
                                      onClick={() => setEditingAuction(auction)}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      title="Edytuj"
                                    >
                                      <Edit className="w-4 h-4 text-blue-400" />
                                    </motion.button>

                                    {auction.status === 'ACTIVE' && (
                                      <motion.button
                                        className="p-2 rounded-lg bg-white/5 hover:bg-orange-500/20 transition-colors"
                                        onClick={() => handleAuctionAction(auction.id, 'end')}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        title="Zakończ"
                                      >
                                        <Gavel className="w-4 h-4 text-orange-400" />
                                      </motion.button>
                                    )}
                                    <motion.button
                                      className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors"
                                      onClick={() => handleAuctionAction(auction.id, 'delete')}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      title="Usuń"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-400" />
                                    </motion.button>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'settings' && (
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <motion.div 
                        className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                          <Settings className="w-5 h-5 text-gold" />
                          Ustawienia platformy
                        </h3>
                        <div className="space-y-4">
                          {[
                            { title: 'Rejestracja użytkowników', desc: 'Zezwól na rejestrację nowych użytkowników', default: true },
                            { title: 'Weryfikacja email', desc: 'Wymagaj weryfikacji email przed licytacją', default: true },
                            { title: 'Powiadomienia push', desc: 'Włącz powiadomienia push dla użytkowników', default: true },
                            { title: 'Tryb konserwacji', desc: 'Wyłącz dostęp do platformy dla użytkowników', default: false },
                          ].map((setting, index) => (
                            <motion.div 
                              key={setting.title}
                              className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.15 + index * 0.05 }}
                              whileHover={{ x: 5 }}
                            >
                              <div>
                                <p className="text-sm font-medium text-white">{setting.title}</p>
                                <p className="text-xs text-white/50">{setting.desc}</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked={setting.default} className="sr-only peer" />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                              </label>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div 
                        className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <Server className="w-5 h-5 text-gold" />
                          Status systemu
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { label: 'Baza danych', status: 'online', color: 'green' },
                            { label: 'API Server', status: 'online', color: 'green' },
                            { label: 'Storage', status: 'online', color: 'green' },
                          ].map((item, index) => (
                            <motion.div
                              key={item.label}
                              className="p-4 rounded-xl bg-white/5 flex items-center justify-between"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.25 + index * 0.05 }}
                            >
                              <span className="text-sm text-white/70">{item.label}</span>
                              <div className="flex items-center gap-2">
                                <motion.div
                                  className={`w-2 h-2 rounded-full bg-${item.color}-400`}
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                                <span className={`text-xs text-${item.color}-400`}>{item.status}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div 
                        className="p-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-900/20 border border-red-500/30"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h3 className="text-lg font-semibold text-red-300 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Strefa niebezpieczna
                        </h3>
                        <p className="text-sm text-red-200/70 mb-4">
                          Te akcje są nieodwracalne. Upewnij się, że wiesz co robisz.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/20">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Wyczyść cache
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/20">
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Resetuj statystyki
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>

            <AnimatePresence>
              {editingUser && (
                <motion.div 
                  className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setEditingUser(null)}
                >
                  <motion.div 
                    className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 p-6 rounded-2xl w-full max-w-md shadow-2xl"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Edit className="w-5 h-5 text-gold" />
                        Edytuj Użytkownika
                      </h3>
                      <motion.button 
                        onClick={() => setEditingUser(null)}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-5 h-5 text-white/60 hover:text-white" />
                      </motion.button>
                    </div>
                    <form onSubmit={handleSaveUser} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                        <input 
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                          value={editingUser.email}
                          onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">Imię</label>
                          <input 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                            value={editingUser.first_name || ''}
                            onChange={e => setEditingUser({...editingUser, first_name: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">Nazwisko</label>
                          <input 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                            value={editingUser.last_name || ''}
                            onChange={e => setEditingUser({...editingUser, last_name: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Rola</label>
                        <select 
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                          value={editingUser.role}
                          onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                        >
                          <option value="USER_REGISTERED">Registered</option>
                          <option value="USER_EMAIL_VERIFIED">Email Verified</option>
                          <option value="USER_FULL_VERIFIED">Full Verified</option>
                          <option value="ADMIN">Admin</option>
                          <option value="BANNED">Banned</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-3 mt-6">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button type="button" variant="outline" onClick={() => setEditingUser(null)} className="border-white/20">
                            Anuluj
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button type="submit" className="bg-gradient-to-r from-gold to-gold-dark text-navy">
                            <Save className="w-4 h-4 mr-2" />
                            Zapisz
                          </Button>
                        </motion.div>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {editingAuction && (
                <motion.div 
                  className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setEditingAuction(null)}
                >
                  <motion.div 
                    className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 p-6 rounded-2xl w-full max-w-lg shadow-2xl"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-gold" />
                        Edytuj Aukcję
                      </h3>
                      <motion.button 
                        onClick={() => setEditingAuction(null)}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-5 h-5 text-white/60 hover:text-white" />
                      </motion.button>
                    </div>
                    <form onSubmit={handleSaveAuction} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Tytuł</label>
                        <input 
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                          value={editingAuction.title}
                          onChange={e => setEditingAuction({...editingAuction, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Opis</label>
                        <textarea 
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white h-20 focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all resize-none"
                          value={editingAuction.description || ''}
                          onChange={e => setEditingAuction({...editingAuction, description: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">Cena Startowa</label>
                          <input 
                            type="number"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                            value={editingAuction.startingPrice || 0}
                            onChange={e => setEditingAuction({...editingAuction, startingPrice: Number(e.target.value)})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">Kup Teraz</label>
                          <input 
                            type="number"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                            value={editingAuction.buyNowPrice || 0}
                            onChange={e => setEditingAuction({...editingAuction, buyNowPrice: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Status</label>
                        <select 
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                          value={editingAuction.status}
                          onChange={e => setEditingAuction({...editingAuction, status: e.target.value})}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="ENDED">ENDED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-3 mt-6">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button type="button" variant="outline" onClick={() => setEditingAuction(null)} className="border-white/20">
                            Anuluj
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button type="submit" className="bg-gradient-to-r from-gold to-gold-dark text-navy">
                            <Save className="w-4 h-4 mr-2" />
                            Zapisz
                          </Button>
                        </motion.div>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isCreatingUser && (
                <motion.div 
                  className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsCreatingUser(false)}
                >
                  <motion.div 
                    className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 p-6 rounded-2xl w-full max-w-md shadow-2xl"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Plus className="w-5 h-5 text-gold" />
                        Nowy Użytkownik
                      </h3>
                      <motion.button 
                        onClick={() => setIsCreatingUser(false)}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-5 h-5 text-white/60 hover:text-white" />
                      </motion.button>
                    </div>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Email *</label>
                        <input 
                          type="email"
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                          value={newUser.email}
                          onChange={e => setNewUser({...newUser, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Hasło *</label>
                        <input 
                          type="password"
                          autoComplete="current-password"
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                          value={newUser.password}
                          onChange={e => setNewUser({...newUser, password: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">Imię</label>
                          <input 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                            value={newUser.first_name || ''}
                            onChange={e => setNewUser({...newUser, first_name: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">Nazwisko</label>
                          <input 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                            value={newUser.last_name || ''}
                            onChange={e => setNewUser({...newUser, last_name: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Rola</label>
                        <select 
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                          value={newUser.role}
                          onChange={e => setNewUser({...newUser, role: e.target.value})}
                        >
                          <option value="USER_REGISTERED">Zarejestrowany</option>
                          <option value="USER_FULL_VERIFIED">Zweryfikowany</option>
                          <option value="ADMIN">Administrator</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-3 mt-6">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button type="button" variant="outline" onClick={() => setIsCreatingUser(false)} className="border-white/20">
                            Anuluj
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button type="submit" className="bg-gradient-to-r from-gold to-gold-dark text-navy">
                            <Plus className="w-4 h-4 mr-2" />
                            Utwórz
                          </Button>
                        </motion.div>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isCreatingAuction && (
                <motion.div 
                  className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsCreatingAuction(false)}
                >
                  <motion.div 
                    className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 p-6 rounded-2xl w-full max-w-lg shadow-2xl my-8"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-gold" />
                        Nowa Aukcja
                      </h3>
                      <motion.button 
                        onClick={() => setIsCreatingAuction(false)}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-5 h-5 text-white/60 hover:text-white" />
                      </motion.button>
                    </div>
                    <form onSubmit={handleCreateAuction} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Tytuł *</label>
                        <input 
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                          value={newAuction.title}
                          onChange={e => setNewAuction({...newAuction, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Opis</label>
                        <textarea 
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white h-20 focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all resize-none"
                          value={newAuction.description || ''}
                          onChange={e => setNewAuction({...newAuction, description: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">Cena Startowa (PLN)</label>
                          <input 
                            type="number"
                            min="0"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                            value={newAuction.startingPrice}
                            onChange={e => setNewAuction({...newAuction, startingPrice: Number(e.target.value)})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">Kup Teraz (PLN)</label>
                          <input 
                            type="number"
                            min="0"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                            value={newAuction.buyNowPrice}
                            onChange={e => setNewAuction({...newAuction, buyNowPrice: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">Kategoria</label>
                          <select 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                            value={newAuction.category}
                            onChange={e => setNewAuction({...newAuction, category: e.target.value})}
                          >
                            <option value="RACING">Wyścigowy</option>
                            <option value="BREEDING">Rozpłodowy</option>
                            <option value="SHOW">Wystawowy</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">Płeć</label>
                          <select 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                            value={newAuction.sex}
                            onChange={e => setNewAuction({...newAuction, sex: e.target.value})}
                          >
                            <option value="MALE">Samiec</option>
                            <option value="FEMALE">Samica</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Data Zakończenia</label>
                        <input 
                          type="datetime-local"
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                          value={newAuction.endTime}
                          onChange={e => setNewAuction({...newAuction, endTime: e.target.value})}
                        />
                      </div>
                      <div className="flex justify-end gap-3 mt-6">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button type="button" variant="outline" onClick={() => setIsCreatingAuction(false)} className="border-white/20">
                            Anuluj
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button type="submit" className="bg-gradient-to-r from-gold to-gold-dark text-navy">
                            <Plus className="w-4 h-4 mr-2" />
                            Utwórz Aukcję
                          </Button>
                        </motion.div>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminPanel;
