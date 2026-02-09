import React from 'react';
import { motion } from 'framer-motion';
import { Users, Gavel, DollarSign, Database, Plus, RefreshCw, Eye, Sparkles, Crown } from 'lucide-react';
import { UserData, AuctionData, AdminStats } from '@/types/admin';

interface AdminDashboardProps {
    stats: AdminStats;
    recentUsers: UserData[];
    recentAuctions: AuctionData[];
    onRefresh: () => void;
    onNewUser: () => void;
    onNewAuction: () => void;
    isRefreshing: boolean;
}

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
    const [isHovered, setIsHovered] = React.useState(false);

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
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <motion.div
                        animate={{ rotate: isHovered ? [0, -10, 10, 0] : 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Icon className="w-8 h-8 text-white/90" />
                    </motion.div>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}`}>
                            {trend}%
                        </div>
                    )}
                </div>
                <p className="text-4xl font-bold text-white mb-1">{value}</p>
                <p className="text-sm text-white/70">{label}</p>
            </div>
        </motion.div>
    );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    stats,
    recentUsers,
    recentAuctions,
    onRefresh,
    onNewUser,
    onNewAuction,
    isRefreshing
}) => {
    return (
        <div className="space-y-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-gold" />
                            Ostatni użytkownicy
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">{recentUsers.length} total</span>
                    </div>
                    <div className="space-y-3">
                        {recentUsers.slice(0, 5).map((user, index) => (
                            <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center border border-gold/30">
                                        <span className="text-gold font-medium">{user.first_name?.[0] || user.email?.[0]?.toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{user.first_name} {user.last_name}</p>
                                        <p className="text-xs text-white/50">{user.email}</p>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'ADMIN' ? 'bg-gold/20 text-gold' : user.role === 'USER_FULL_VERIFIED' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'}`}>
                                    {user.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Gavel className="w-5 h-5 text-gold" />
                            Ostatnie aukcje
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-gold/20 text-gold">{recentAuctions.length} total</span>
                    </div>
                    <div className="space-y-3">
                        {recentAuctions.slice(0, 5).map((auction, index) => (
                            <div key={auction.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{auction.title}</p>
                                    <p className="text-xs text-white/50">{auction.seller?.first_name} {auction.seller?.last_name}</p>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-sm font-bold text-gold">{auction.currentPrice?.toLocaleString('pl-PL')} zł</p>
                                    <span className={`text-xs ${auction.status === 'ACTIVE' ? 'text-green-400' : 'text-white/50'}`}>{auction.status === 'ACTIVE' ? 'Aktywna' : 'Zakończona'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20">
                <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-6 h-6 text-gold" />
                    <h3 className="text-lg font-semibold text-white">Szybkie akcje</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: Plus, label: 'Nowy użytkownik', action: onNewUser },
                        { icon: Gavel, label: 'Nowa aukcja', action: onNewAuction },
                        { icon: RefreshCw, label: 'Odśwież dane', action: onRefresh, spin: isRefreshing },
                        { icon: Eye, label: 'Podgląd strony', action: () => window.open('/', '_blank') },
                    ].map((item) => (
                        <motion.button
                            key={item.label}
                            onClick={item.action}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/30 transition-all duration-300"
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <item.icon className={`w-6 h-6 text-gold ${item.spin ? 'animate-spin' : ''}`} />
                            <span className="text-sm text-white/80">{item.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
};
