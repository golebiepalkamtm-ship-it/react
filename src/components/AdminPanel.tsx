import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  UserCheck
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
}

interface AuctionData {
  id: string;
  title: string;
  currentPrice: number;
  status: string;
  createdAt: string;
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

  const fetchData = React.useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      // Używaj klienta API z bazowym URL (eliminuje pobieranie index.html przy hostingu statycznym)
      const statsData = await apiClient.getWithToken<Stats>('/admin/stats', undefined, session.access_token);
      setStats(statsData);

      const usersData = await apiClient.getWithToken<{ users: UserData[] }>('/admin/users', { limit: 100 }, session.access_token);
      setUsers(usersData.users || []);

      const auctionsData = await apiClient.getWithToken<AuctionData[]>('/admin/auctions', undefined, session.access_token);
      setAuctions(auctionsData);

    } catch (error) {
      console.error("Error fetching admin data:", error);
      // Użyj ładnego toast zamiast alert z bardziej szczegółowym błędem
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
      toast.error(`Błąd pobierania danych administratora: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    console.log('MOUNTING AdminPanel', { isOpen });
    if (isOpen && profile?.role === 'ADMIN' && session?.access_token) {
      fetchData();
    }
  }, [isOpen, profile, session, fetchData]);

  const handleUserAction = async (userId: string, action: 'ban' | 'unban' | 'delete' | 'verify') => {
    if (!session?.access_token) return;
    try {
      let role = '';
      if (action === 'ban') role = 'BANNED';
      if (action === 'unban') role = 'USER_REGISTERED';
      if (action === 'verify') role = 'USER_FULL_VERIFIED';

      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      };

      if (action === 'delete') {
        // Implementacja usuwania po stronie backendu
        // await fetch(`/api/admin/users/${userId}`, { method: 'DELETE', headers });
        toast.info('Usuwanie użytkowników jest obecnie wyłączone w tym demo.');
      } else {
        const res = await fetch(`/api/admin/users/${userId}/role`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ role })
        });
        if (!res.ok) throw new Error('Failed to update user');
        toast.success('Rola użytkownika zaktualizowana');
      }
      
      fetchData();
    } catch (error) {
      console.error('Error performing user action:', error);
      toast.error('Błąd akcji użytkownika');
    }
  };

  const handleAuctionAction = async (auctionId: string, action: 'end' | 'delete') => {
    if (!session?.access_token) return;
    try {
      const res = await fetch(`/api/admin/auctions/${auctionId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to perform auction action');
      
      toast.success(action === 'end' ? 'Aukcja zakończona' : 'Aukcja usunięta');
      fetchData();
    } catch (error) {
      console.error('Error performing auction action:', error);
      toast.error('Błąd akcji aukcji');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAuctions = auctions.filter(auction =>
    auction.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            drag
            dragMomentum={false}
            dragConstraints={{ left: -400, right: 400, top: -200, bottom: 200 }}
            dragElastic={0.1}
            className="relative w-full max-w-6xl max-h-[90vh] bg-hero-gradient rounded-2xl border border-white/20 shadow-2xl overflow-hidden cursor-move"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gold/20">
                  <Shield className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Panel Administratora</h2>
                  <p className="text-sm text-muted-foreground">Zarządzaj platformą</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-gold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Search */}
              {(activeTab === 'users' || activeTab === 'auctions') && (
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={activeTab === 'users' ? 'Szukaj użytkowników...' : 'Szukaj aukcji...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-gold/50 focus:ring-1 focus:ring-gold/20 outline-none"
                    />
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
                </div>
              ) : (
                <>
                  {/* Dashboard Tab */}
                  {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <Users className="w-8 h-8 text-blue-400" />
                          </div>
                          <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                          <p className="text-sm text-muted-foreground">Użytkowników</p>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="p-6 rounded-xl bg-gradient-to-br from-gold/20 to-gold/10 border border-gold/20"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <Gavel className="w-8 h-8 text-gold" />
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          </div>
                          <p className="text-3xl font-bold text-foreground">{stats.activeAuctions}</p>
                          <p className="text-sm text-muted-foreground">Aktywnych aukcji</p>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <DollarSign className="w-8 h-8 text-green-400" />
                          </div>
                          <p className="text-3xl font-bold text-foreground">
                            {stats.totalVolume.toLocaleString('pl-PL')} zł
                          </p>
                          <p className="text-sm text-muted-foreground">Łączny obrót</p>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <Clock className="w-8 h-8 text-purple-400" />
                          </div>
                          <p className="text-3xl font-bold text-foreground">{stats.totalAuctions}</p>
                          <p className="text-sm text-muted-foreground">Wszystkich aukcji</p>
                        </motion.div>
                      </div>

                      {/* Recent Activity */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="p-6 rounded-xl bg-black/30 border border-white/10">
                          <h3 className="text-lg font-semibold text-foreground mb-4">Ostatni użytkownicy</h3>
                          <div className="space-y-3">
                            {users.slice(0, 5).map((user) => (
                              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                                    <span className="text-gold font-medium">
                                      {user.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-foreground">
                                      {user.first_name} {user.last_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                  </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  user.role === 'ADMIN' ? 'bg-gold/20 text-gold' :
                                  user.role === 'USER_FULL_VERIFIED' ? 'bg-green-500/20 text-green-400' :
                                  'bg-white/10 text-muted-foreground'
                                }`}>
                                  {user.role}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-6 rounded-xl bg-black/30 border border-white/10">
                          <h3 className="text-lg font-semibold text-foreground mb-4">Ostatnie aukcje</h3>
                          <div className="space-y-3">
                            {auctions.slice(0, 5).map((auction) => (
                              <div key={auction.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                <div>
                                  <p className="text-sm font-medium text-foreground line-clamp-1">
                                    {auction.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {auction.seller?.first_name} {auction.seller?.last_name}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-gold">
                                    {auction.currentPrice?.toLocaleString('pl-PL')} zł
                                  </p>
                                  <span className={`text-xs ${
                                    auction.status === 'ACTIVE' ? 'text-green-400' : 'text-muted-foreground'
                                  }`}>
                                    {auction.status === 'ACTIVE' ? 'Aktywna' : 'Zakończona'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Users Tab */}
                  {activeTab === 'users' && (
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Użytkownik</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rola</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Data rejestracji</th>
                              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Akcje</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map((user) => (
                              <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                                      <span className="text-gold text-sm font-medium">
                                        {user.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                                      </span>
                                    </div>
                                    <span className="text-sm text-foreground">
                                      {user.first_name} {user.last_name}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-sm text-muted-foreground">{user.email}</td>
                                <td className="py-3 px-4">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    user.role === 'ADMIN' ? 'bg-gold/20 text-gold' :
                                    user.role === 'USER_FULL_VERIFIED' ? 'bg-green-500/20 text-green-400' :
                                    user.role === 'BANNED' ? 'bg-red-500/20 text-red-400' :
                                    'bg-white/10 text-muted-foreground'
                                  }`}>
                                    {user.role}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                  {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center justify-end gap-2">
                                    {user.role !== 'ADMIN' && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleUserAction(user.id, 'verify')}
                                          title="Zweryfikuj"
                                        >
                                          <UserCheck className="w-4 h-4 text-green-400" />
                                        </Button>
                                        {user.role === 'BANNED' ? (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleUserAction(user.id, 'unban')}
                                            title="Odbanuj"
                                          >
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                          </Button>
                                        ) : (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleUserAction(user.id, 'ban')}
                                            title="Zbanuj"
                                          >
                                            <Ban className="w-4 h-4 text-orange-400" />
                                          </Button>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleUserAction(user.id, 'delete')}
                                          title="Usuń"
                                        >
                                          <Trash2 className="w-4 h-4 text-red-400" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Auctions Tab */}
                  {activeTab === 'auctions' && (
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tytuł</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sprzedawca</th>
                              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Cena</th>
                              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Akcje</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAuctions.map((auction) => (
                              <tr key={auction.id} className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-3 px-4">
                                  <span className="text-sm text-foreground">{auction.title}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-muted-foreground">
                                    {auction.seller?.first_name} {auction.seller?.last_name}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <span className="text-sm text-gold font-bold">
                                    {auction.currentPrice?.toLocaleString('pl-PL')} zł
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    auction.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-muted-foreground'
                                  }`}>
                                    {auction.status === 'ACTIVE' ? 'Aktywna' : 'Zakończona'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center justify-end gap-2">
                                    {auction.status === 'ACTIVE' && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleAuctionAction(auction.id, 'end')}
                                        title="Zakończ"
                                      >
                                        <Gavel className="w-4 h-4 text-orange-400" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleAuctionAction(auction.id, 'delete')}
                                      title="Usuń"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-400" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Settings Tab */}
                  {activeTab === 'settings' && (
                    <div className="space-y-6">
                      <div className="p-6 rounded-xl bg-black/30 border border-white/10">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Ustawienia platformy</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                            <div>
                              <p className="text-sm font-medium text-foreground">Rejestracja użytkowników</p>
                              <p className="text-xs text-muted-foreground">Zezwól na rejestrację nowych użytkowników</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                            </label>
                          </div>
                          
                          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                            <div>
                              <p className="text-sm font-medium text-foreground">Weryfikacja email</p>
                              <p className="text-xs text-muted-foreground">Wymagaj weryfikacji email przed licytacją</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                            <div>
                              <p className="text-sm font-medium text-foreground">Tryb konserwacji</p>
                              <p className="text-xs text-muted-foreground">Wyłącz dostęp do platformy dla użytkowników</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20">
                        <h3 className="text-lg font-semibold text-red-400 mb-2">Strefa niebezpieczna</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Te akcje są nieodwracalne. Upewnij się, że wiesz co robisz.
                        </p>
                        <div className="flex gap-3">
                          <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                            Wyczyść cache
                          </Button>
                          <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                            Resetuj statystyki
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminPanel;
