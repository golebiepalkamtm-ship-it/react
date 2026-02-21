import React, { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Shield,
  LayoutDashboard,
  Users,
  Gavel,
  Settings,
  BarChart3,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/services/api";
import { logger } from "@/lib/logger";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import { Button } from "@/components/ui/button";

// Types
import {
  UserData,
  AuctionData,
  AdminStats,
  HistoricalStats,
} from "@/types/admin";

// Sub-components
import { AdminDashboard } from "./admin/AdminDashboard";
import { AdminAnalytics } from "./admin/AdminAnalytics";
import { AdminUsersTable } from "./admin/AdminUsersTable";
import { AdminAuctionsTable } from "./admin/AdminAuctionsTable";
import { AdminSettings } from "./admin/AdminSettings";
import { AdminUserEditModal } from "./admin/AdminUserEditModal";
import { AdminAuctionEditModal } from "./admin/AdminAuctionEditModal";
import { AdminCreateUserModal } from "./admin/AdminCreateUserModal";
import { AdminCreateAuctionModal } from "./admin/AdminCreateAuctionModal";

type TabType = "dashboard" | "analytics" | "users" | "auctions" | "settings";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const { profile, session } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [users, setUsers] = useState<UserData[]>([]);
  const [auctions, setAuctions] = useState<AuctionData[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeAuctions: 0,
    totalAuctions: 0,
    totalVolume: 0,
  });
  const [historicalStats, setHistoricalStats] =
    useState<HistoricalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editingAuction, setEditingAuction] = useState<AuctionData | null>(
    null,
  );
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isCreatingAuction, setIsCreatingAuction] = useState(false);
  const [newUser, setNewUser] = useState<Partial<UserData>>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "USER_REGISTERED",
    username: "",
    phone: "",
  });

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const fetchData = useCallback(async () => {
    if (!session?.access_token) {
      console.error("❌ No access token available");
      return;
    }
    setLoading(true);
    try {
      logger.info("Fetching admin data...");

      const statsData = await apiClient.getWithToken<AdminStats>(
        "/admin/stats",
        undefined,
        session.access_token,
      );
      setStats(statsData);

      const usersData = await apiClient.getWithToken<{ users: UserData[] }>(
        "/admin/users",
        { limit: 100 },
        session.access_token,
      );
      setUsers(usersData.users || []);

      const auctionsResponse = await apiClient.getWithToken<{
        data: AuctionData[];
      }>("/admin/auctions", undefined, session.access_token);
      setAuctions(auctionsResponse.data || []);

      const historicalData = await apiClient.getWithToken<HistoricalStats>(
        "/admin/stats/historical",
        undefined,
        session.access_token,
      );
      setHistoricalStats(historicalData);
    } catch (error) {
      logger.error("❌ Error fetching admin data:", error);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Błąd",
        message: "Nie udało się pobrać danych administratora.",
      });
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (isOpen && profile?.role === "ADMIN" && session?.access_token) {
      fetchData();
    }
  }, [isOpen, profile, session, fetchData]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleUserAction = async (
    userId: string,
    action: "ban" | "unban" | "delete" | "verify",
  ) => {
    if (!session?.access_token) return;
    if (userId === profile?.id && (action === "ban" || action === "delete")) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Błąd",
        message: "Nie możesz wykonać tej akcji na własnym koncie.",
      });
      return;
    }

    const performAction = async () => {
      try {
        if (action === "delete") {
          await apiClient.delete(
            `/admin/users/${userId}`,
            session.access_token!,
          );
        } else if (action === "verify") {
          await apiClient.post(
            `/admin/users/${userId}/verify`,
            {},
            session.access_token!,
          );
        } else if (action === "ban") {
          await apiClient.post(
            `/admin/users/${userId}/ban`,
            {},
            session.access_token!,
          );
        } else if (action === "unban") {
          await apiClient.post(
            `/admin/users/${userId}/unban`,
            {},
            session.access_token!,
          );
        }

        setFeedbackModal({
          isOpen: true,
          type: "success",
          title: "Sukces",
          message: "Akcja została wykonana pomyślnie.",
        });
        fetchData();
      } catch (error) {
        setFeedbackModal({
          isOpen: true,
          type: "error",
          title: "Błąd",
          message: "Nie udało się wykonać akcji.",
        });
      }
    };

    if (action === "delete") {
      setFeedbackModal({
        isOpen: true,
        type: "warning",
        title: "Potwierdzenie",
        message: "Czy na pewno chcesz trwale usunąć tego użytkownika?",
        onConfirm: performAction,
      });
    } else {
      performAction();
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !session?.access_token) return;
    try {
      await apiClient.patch(
        `/admin/users/${editingUser.id}`,
        editingUser,
        session.access_token,
      );
      setEditingUser(null);
      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Sukces",
        message: "Dane użytkownika zostały zaktualizowane.",
      });
      fetchData();
    } catch (error) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Błąd",
        message: "Nie udało się zapisać zmian.",
      });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;
    try {
      await apiClient.post("/admin/users", newUser, session.access_token);
      setIsCreatingUser(false);
      setNewUser({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "USER_REGISTERED",
        username: "",
        phone: "",
      });
      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Sukces",
        message: "Użytkownik został utworzony.",
      });
      fetchData();
    } catch (error) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Błąd",
        message: "Nie udało się utworzyć użytkownika.",
      });
    }
  };

  const handleAuctionAction = async (
    auctionId: string,
    action: "end" | "delete",
  ) => {
    if (!session?.access_token) return;
    const performAction = async () => {
      try {
        if (action === "delete") {
          await apiClient.delete(
            `/admin/auctions/${auctionId}`,
            session.access_token!,
          );
        } else if (action === "end") {
          await apiClient.post(
            `/admin/auctions/${auctionId}/end`,
            {},
            session.access_token!,
          );
        }
        setFeedbackModal({
          isOpen: true,
          type: "success",
          title: "Sukces",
          message: "Akcja wykonana pomyślnie.",
        });
        fetchData();
        queryClient.invalidateQueries({ queryKey: ["auctions"] });
      } catch (error) {
        setFeedbackModal({
          isOpen: true,
          type: "error",
          title: "Błąd",
          message: "Nie udało się wykonać akcji.",
        });
      }
    };

    setFeedbackModal({
      isOpen: true,
      type: "warning",
      title: "Potwierdzenie",
      message:
        action === "delete"
          ? "Czy na pewno chcesz usunąć tę aukcję?"
          : "Czy na pewno chcesz zakończyć tę aukcję?",
      onConfirm: performAction,
    });
  };

  const handleSaveAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuction || !session?.access_token) return;
    try {
      const auctionIdToInvalidate = editingAuction.id;
      await apiClient.patch(
        `/admin/auctions/${editingAuction.id}`,
        editingAuction,
        session.access_token,
      );
      setEditingAuction(null);
      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Sukces",
        message: "Aukcja została zaktualizowana.",
      });
      fetchData();
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      queryClient.invalidateQueries({
        queryKey: ["auction", auctionIdToInvalidate],
      });
    } catch (error) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Błąd",
        message: "Nie udało się zapisać zmian.",
      });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredAuctions = auctions.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.seller?.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-navy/95 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-7xl h-[90vh] bg-gray-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
      >
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white/5 border-r border-white/10 p-6 flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gold/20">
              <Shield className="w-6 h-6 text-gold" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              AdminPanel
            </h1>
          </div>

          <nav className="flex flex-col gap-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "analytics", label: "Statystyki", icon: BarChart3 },
              { id: "users", label: "Użytkownicy", icon: Users },
              { id: "auctions", label: "Aukcje", icon: Gavel },
              { id: "settings", label: "Ustawienia", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? "bg-gold text-navy font-bold"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 border-white/10 text-white/60 hover:text-white hover:bg-white/5"
              onClick={onClose}
            >
              <X className="w-5 h-5" /> Zamknij Panel
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xl group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-gold transition-colors" />
              <input
                type="text"
                placeholder="Szukaj..."
                className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex items-center justify-center"
                >
                  <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === "dashboard" && (
                    <AdminDashboard
                      stats={stats}
                      historicalStats={historicalStats}
                      recentUsers={users}
                      recentAuctions={auctions}
                      onRefresh={handleRefresh}
                      onNewUser={() => setIsCreatingUser(true)}
                      onNewAuction={() => setIsCreatingAuction(true)}
                      isRefreshing={isRefreshing}
                    />
                  )}
                  {activeTab === "analytics" && (
                    <AdminAnalytics
                      stats={stats}
                      historicalStats={historicalStats}
                    />
                  )}
                  {activeTab === "users" && (
                    <AdminUsersTable
                      users={filteredUsers}
                      onEdit={setEditingUser}
                      onAction={handleUserAction}
                      onAdd={() => setIsCreatingUser(true)}
                    />
                  )}
                  {activeTab === "auctions" && (
                    <AdminAuctionsTable
                      auctions={filteredAuctions}
                      onEdit={setEditingAuction}
                      onAction={handleAuctionAction}
                      onAdd={() => setIsCreatingAuction(true)}
                    />
                  )}
                  {activeTab === "settings" && <AdminSettings />}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>

        {/* Modals integrated */}
        <AdminUserEditModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
          onChange={setEditingUser}
        />

        <AdminAuctionEditModal
          auction={editingAuction}
          isOpen={!!editingAuction}
          onClose={() => setEditingAuction(null)}
          onSave={handleSaveAuction}
          onChange={setEditingAuction}
        />

        <AdminCreateUserModal
          isOpen={isCreatingUser}
          onClose={() => setIsCreatingUser(false)}
          onSave={handleCreateUser}
          user={newUser}
          onChange={setNewUser}
        />

        <AdminCreateAuctionModal
          isOpen={isCreatingAuction}
          onClose={() => setIsCreatingAuction(false)}
          onSuccess={handleRefresh}
        />

        <UnifiedModal
          isOpen={feedbackModal.isOpen}
          onClose={() =>
            setFeedbackModal((prev) => ({ ...prev, isOpen: false }))
          }
          type={feedbackModal.type}
          title={feedbackModal.title}
          message={feedbackModal.message}
          confirmButton={{
            text: feedbackModal.onConfirm ? "Potwierdź" : "OK",
            onClick: () => {
              feedbackModal.onConfirm?.();
              setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
            },
          }}
          {...(feedbackModal.onConfirm
            ? {
                cancelButton: {
                  text: "Anuluj",
                  onClick: () =>
                    setFeedbackModal((prev) => ({ ...prev, isOpen: false })),
                },
              }
            : {})}
        />
      </motion.div>
    </div>,
    document.body,
  );
};

export default memo(AdminPanel);
