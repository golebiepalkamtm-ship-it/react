import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Gavel,
  DollarSign,
  Database,
  Plus,
  RefreshCw,
  Eye,
  Sparkles,
  Crown,
  AlertTriangle,
  Settings,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  UserData,
  AuctionData,
  AdminStats,
  HistoricalStats,
} from "@/types/admin";

interface AdminDashboardProps {
  stats: AdminStats;
  historicalStats: HistoricalStats | null;
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
  trend,
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
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)",
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
            <div
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${trend >= 0 ? "bg-green-500/30 text-green-300" : "bg-red-500/30 text-red-300"}`}
            >
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
  historicalStats,
  recentUsers,
  recentAuctions,
  onRefresh,
  onNewUser,
  onNewAuction,
  isRefreshing,
}) => {
  const prepareChartData = (data: Record<string, number> | undefined) => {
    if (!data) return [];
    return Object.entries(data)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, value]) => ({
        date: date.split("-").slice(1).join("-"), // MM-DD
        value,
      }));
  };

  const userData = prepareChartData(historicalStats?.usersByDay);
  const auctionData = prepareChartData(historicalStats?.auctionsByDay);
  const volumeData = prepareChartData(historicalStats?.bidVolumeByDay);
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
          value={`${stats.totalVolume.toLocaleString("pl-PL")} zł`}
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
            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
              {recentUsers.length} total
            </span>
          </div>
          <div className="space-y-3">
            {recentUsers.slice(0, 5).map((user, index) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center border border-gold/30">
                    <span className="text-gold font-medium">
                      {user.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-white/50">{user.email}</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${user.role === "ADMIN" ? "bg-gold/20 text-gold" : user.role === "USER_FULL_VERIFIED" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/60"}`}
                >
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
            <span className="text-xs px-2 py-1 rounded-full bg-gold/20 text-gold">
              {recentAuctions.length} total
            </span>
          </div>
          <div className="space-y-3">
            {recentAuctions.slice(0, 5).map((auction, index) => (
              <div
                key={auction.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
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
                  <p className="text-sm font-bold text-gold">
                    {auction.currentPrice?.toLocaleString("pl-PL")} zł
                  </p>
                  <span
                    className={`text-xs ${auction.status === "ACTIVE" ? "text-green-400" : "text-white/50"}`}
                  >
                    {auction.status === "ACTIVE" ? "Aktywna" : "Zakończona"}
                  </span>
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
            {
              icon: Plus,
              label: "Dodaj użytkownika",
              desc: "Ręczne tworzenie profilu",
              action: onNewUser,
            },
            {
              icon: Gavel,
              label: "Nowa aukcja",
              desc: "Wystawienie nowego gołębia",
              action: onNewAuction,
            },
            {
              icon: RefreshCw,
              label: "Odśwież dane",
              desc: "Aktualizacja statystyk",
              action: onRefresh,
              spin: isRefreshing,
            },
            {
              icon: Eye,
              label: "Podgląd strony",
              desc: "Zobacz serwis jako gość",
              action: () => window.open("/", "_blank"),
            },
          ].map((item) => (
            <motion.button
              key={item.label}
              onClick={item.action}
              className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/30 transition-all duration-300 group"
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                <item.icon
                  className={`w-6 h-6 text-gold ${item.spin ? "animate-spin" : ""}`}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">
                  {item.label}
                </span>
                <span className="text-[10px] text-white/40 uppercase tracking-wider">
                  {item.desc}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-gold" />
            <h3 className="text-lg font-semibold text-white">
              Centrum Pomocy Administratora
            </h3>
          </div>
          <div className="space-y-4 text-sm text-white/60">
            <div className="flex gap-3">
              <Users className="w-5 h-5 text-gold shrink-0" />
              <p>
                <strong className="text-white">
                  Zarządzanie Użytkownikami:
                </strong>{" "}
                Pozwala na edycję danych, weryfikację kont oraz nakładanie
                blokad (banów). Weryfikacja konta odblokowuje pełne możliwości
                licytacji.
              </p>
            </div>
            <div className="flex gap-3">
              <Gavel className="w-5 h-5 text-orange-400 shrink-0" />
              <p>
                <strong className="text-white">Zarządzanie Aukcjami:</strong>{" "}
                Umożliwia edycję treści aukcji, przedwczesne zakończenie
                licytacji w sytuacjach spornych oraz usuwanie błędnych wpisów.
              </p>
            </div>
            <div className="flex gap-3">
              <Settings className="w-5 h-5 text-blue-400 shrink-0" />
              <p>
                <strong className="text-white">Konfiguracja Systemu:</strong>{" "}
                Kontroluj dostępność rejestracji, tryb konserwacji oraz
                parametry globalne platformy.
              </p>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-gold/5 border border-gold/10 text-xs italic">
              Wskazówka: Najedź kursorem na ikony akcji w tabelach, aby zobaczyć
              szczegółowe opisy poszczególnych przycisków.
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">
              Ważne Informacje
            </h3>
          </div>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2 italic">
              • Akcje usunięcia są permanentne i nieodwracalne.
            </li>
            <li className="flex items-start gap-2">
              • Edycja aktywnej aukcji może wpłynąć na licytujących.
            </li>
            <li className="flex items-start gap-2">
              • Zablokowany użytkownik traci dostęp do licytacji i czatu.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
