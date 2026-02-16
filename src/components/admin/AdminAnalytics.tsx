import React, { useMemo } from "react";
import { formatCategory } from "@/utils/auction";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Gavel,
  DollarSign,
  Database,
  TrendingUp,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Trophy,
  PieChart as PieChartIcon,
  Activity,
  CreditCard,
  Medal,
  Star,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { AdminStats, HistoricalStats } from "@/types/admin";

interface AdminAnalyticsProps {
  stats: AdminStats;
  historicalStats: HistoricalStats | null;
}

const COLORS = [
  "#D4AF37",
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#f43f5e",
  "#ec4899",
  "#f97316",
];

const AnalyticsCard = ({
  title,
  icon: Icon,
  children,
  className = "",
  delay = 0,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col ${className}`}
  >
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-white flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gold/10">
          <Icon className="w-5 h-5 text-gold" />
        </div>
        {title}
      </h3>
    </div>
    <div className="flex-1 min-h-[300px]">{children}</div>
  </motion.div>
);

const MiniStat = ({
  label,
  value,
  trend,
  icon: Icon,
  color = "gold",
}: {
  label: string;
  value: string | number;
  trend?: number;
  icon: any;
  color?: string;
}) => (
  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-${color}/10`}>
        <Icon className={`w-4 h-4 text-${color}`} />
      </div>
      <div>
        <p className="text-xs text-white/40 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
    {trend !== undefined && (
      <div
        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          trend >= 0
            ? "bg-green-500/10 text-green-400"
            : "bg-red-500/10 text-red-400"
        }`}
      >
        {trend >= 0 ? (
          <ArrowUpRight className="w-3 h-3" />
        ) : (
          <ArrowDownRight className="w-3 h-3" />
        )}
        {Math.abs(trend)}%
      </div>
    )}
  </div>
);

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  stats,
  historicalStats,
}) => {
  const prepareData = (data: Record<string, number> | undefined) => {
    if (!data) return [];
    return Object.entries(data)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, value]) => ({
        date: date.split("-").slice(1).join("-"),
        fullDate: date,
        value,
      }));
  };

  const userData = useMemo(
    () => prepareData(historicalStats?.usersByDay),
    [historicalStats],
  );
  const volumeData = useMemo(
    () => prepareData(historicalStats?.bidVolumeByDay),
    [historicalStats],
  );
  const bidsCountData = useMemo(
    () => prepareData(historicalStats?.bidsByDay),
    [historicalStats],
  );

  const categoryData = useMemo(() => {
    if (!stats.auctionsByCategory) return [];
    return Object.entries(stats.auctionsByCategory).map(([name, value]) => ({
      name: formatCategory(name),
      value,
    }));
  }, [stats.auctionsByCategory]);

  const roleData = useMemo(() => {
    if (!stats.usersByRole) return [];
    return Object.entries(stats.usersByRole).map(([name, value]) => ({
      name,
      value,
    }));
  }, [stats.usersByRole]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat
          label="Użytkownicy"
          value={stats.totalUsers}
          trend={15}
          icon={Users}
          color="blue-400"
        />
        <MiniStat
          label="Aktywne Aukcje"
          value={stats.activeAuctions}
          trend={8}
          icon={Gavel}
          color="gold"
        />
        <MiniStat
          label="Całkowity Obrót"
          value={`${stats.totalVolume.toLocaleString("pl-PL")} zł`}
          trend={24}
          icon={DollarSign}
          color="green-400"
        />
        <MiniStat
          label="Średnia Cena"
          value={`${(stats.averagePrice || 0).toLocaleString("pl-PL")} zł`}
          trend={5}
          icon={Target}
          color="purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamika rejestracji */}
        <AnalyticsCard
          title="Dynamika rejestracji"
          icon={TrendingUp}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={userData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.4)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0A0B14",
                  border: "1px solid rgba(212,175,55,0.2)",
                  borderRadius: "16px",
                }}
                itemStyle={{ color: "#D4AF37" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                name="Nowi użytkownicy"
                stroke="#D4AF37"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        {/* Struktura Użytkowników */}
        <AnalyticsCard title="Role Użytkowników" icon={PieChartIcon}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {roleData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0A0B14",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {roleData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-[10px] text-white/60 uppercase">
                  {item.name}
                </span>
                <span className="text-[10px] text-white font-bold">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </AnalyticsCard>

        {/* Wolumen Licytacji */}
        <AnalyticsCard
          title="Wolumen Licytacji"
          icon={BarChart3}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.4)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val} zł`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0A0B14",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                }}
                formatter={(val: any) => [
                  `${Number(val || 0).toLocaleString()} zł`,
                  "Obrót",
                ]}
              />
              <Bar
                dataKey="value"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        {/* Częstotliwość Ofert */}
        <AnalyticsCard title="Częstotliwość Ofert" icon={Activity}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={bidsCountData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.4)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0A0B14",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                }}
              />
              <Line
                type="step"
                dataKey="value"
                name="Liczba ofert"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
                activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </AnalyticsCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sprzedawcy */}
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Medal className="w-6 h-6 text-gold" />
            Top Sprzedawcy (Ranking)
          </h3>
          <div className="space-y-4">
            {(stats.topSellers || []).map((seller: any, idx: number) => (
              <div
                key={seller.sellerId}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {seller.user?.first_name}{" "}
                      {seller.user?.last_name ||
                        seller.user?.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-white/40">
                      {seller._count.id} aukcji zakończonych
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gold font-bold">
                    {Number(seller._sum.currentPrice || 0).toLocaleString()} zł
                  </p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">
                    Wolumen
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Licytujący */}
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-blue-400" />
            Najaktywniejsi Licytanci
          </h3>
          <div className="space-y-4">
            {(stats.topBidders || []).map((bidder: any, idx: number) => (
              <div
                key={bidder.bidderId}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {bidder.user?.first_name}{" "}
                      {bidder.user?.last_name ||
                        bidder.user?.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-white/40">
                      {bidder._count.id} złożonych ofert
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-400 font-bold">
                    {Number(bidder._sum.amount || 0).toLocaleString()} zł
                  </p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">
                    Łączna kwota
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Płatności Summary */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-900/10 border border-green-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-green-500/20">
              <CreditCard className="w-6 h-6 text-green-400" />
            </div>
            <h4 className="text-white font-semibold">Płatności</h4>
          </div>
          <p className="text-3xl font-bold text-white">
            {(stats.payments?.total || 0).toLocaleString()} zł
          </p>
          <p className="text-sm text-white/40 mt-1">
            {stats.payments?.count || 0} pomyślnych transakcji
          </p>
        </div>

        {/* Engagement Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-900/10 border border-blue-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h4 className="text-white font-semibold">Zaangażowanie</h4>
          </div>
          <p className="text-3xl font-bold text-white">
            {stats.totalAuctions
              ? (stats.totalUsers / stats.totalAuctions).toFixed(1)
              : 0}
          </p>
          <p className="text-sm text-white/40 mt-1">Użytkowników na aukcję</p>
        </div>

        {/* Global Success Rate */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 to-fuchsia-900/10 border border-purple-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-purple-500/20">
              <Trophy className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="text-white font-semibold">Skuteczność</h4>
          </div>
          <p className="text-3xl font-bold text-white">
            {stats.totalAuctions
              ? Math.round(
                  ((stats.auctionsByStatus?.ENDED || 0) / stats.totalAuctions) *
                    100,
                )
              : 0}
            %
          </p>
          <p className="text-sm text-white/40 mt-1">Zakończonych sukcesem</p>
        </div>
      </div>
    </div>
  );
};
