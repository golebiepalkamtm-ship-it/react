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
  Star,
  CalendarClock,
  Trash2,
  Pencil,
  CreditCard,
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
import { AdminPaymentsTable } from "./admin/AdminPaymentsTable";
import EditBreederMeetingForm from "@/components/breeder-meetings/EditBreederMeetingForm";
import { meetingsService, Meeting } from "@/services/meetingsService";
import referenceService, {
  Reference,
  UpdateReferenceRequest,
} from "@/services/referenceService";

type TabType =
  | "dashboard"
  | "analytics"
  | "users"
  | "auctions"
  | "meetings"
  | "references"
  | "payments"
  | "settings";

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
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [adminPayments, setAdminPayments] = useState<any[]>([]);
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
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [deletingMeeting, setDeletingMeeting] = useState<Meeting | null>(null);
  const [editingReference, setEditingReference] = useState<Reference | null>(
    null,
  );
  const [referenceDraft, setReferenceDraft] = useState<UpdateReferenceRequest>(
    {},
  );
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

      // content: meetings + references
      try {
        const ms = await meetingsService.getMeetings();
        setMeetings(ms || []);
      } catch (e) {
        logger.error("Meetings fetch failed", e);
      }
      try {
        const rs = await referenceService.getReferences();
        setReferences(rs || []);
      } catch (e) {
        logger.error("References fetch failed", e);
      }

      try {
        const payData = await apiClient.getWithToken<{ payments: any[] }>(
          "/admin/payments",
          { limit: 50 },
          session.access_token,
        );
        setAdminPayments(payData.payments || []);
      } catch (e) {
        logger.error("Admin payments fetch failed", e);
      }
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

  const handleMeetingDelete = async () => {
    if (!deletingMeeting || !session?.access_token) return;
    try {
      await meetingsService.deleteMeeting(deletingMeeting.id, session.access_token);
      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Usunięto",
        message: "Spotkanie zostało usunięte.",
      });
      setDeletingMeeting(null);
      fetchData();
    } catch (error) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Błąd",
        message: "Nie udało się usunąć spotkania.",
      });
    }
  };

  const handleReferenceSave = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!editingReference) return;
    try {
      await referenceService.updateReference(editingReference.id, referenceDraft);
      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Zapisano",
        message: "Referencja została zaktualizowana.",
      });
      setEditingReference(null);
      setReferenceDraft({});
      fetchData();
    } catch (error) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Błąd",
        message: "Nie udało się zapisać referencji.",
      });
    }
  };

  const handleReferenceDelete = async (ref: Reference) => {
    try {
      await referenceService.deleteReference(ref.id);
      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Usunięto",
        message: "Referencja została usunięta.",
      });
      fetchData();
    } catch (error) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Błąd",
        message: "Nie udało się usunąć referencji.",
      });
    }
  };

  const handleReferenceApprove = async (ref: Reference) => {
    try {
      await referenceService.updateReference(ref.id, { is_approved: true });
      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Zatwierdzono",
        message: "Referencja została zaakceptowana.",
      });
      fetchData();
    } catch (error) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Błąd",
        message: "Nie udało się zaakceptować referencji.",
      });
    }
  };

  const handlePaymentStatusChange = async (paymentId: string, status: string) => {
    if (!session?.access_token) return;
    try {
      await apiClient.patchWithToken(
        `/admin/payments/${paymentId}/status`,
        { status },
        session.access_token
      );
      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Sukces",
        message: "Status płatności został zaktualizowany.",
      });
      fetchData();
    } catch (error) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Błąd",
        message: "Nie udało się zaktualizować statusu płatności.",
      });
    }
  };

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
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.first_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.last_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredAuctions = auctions.filter(
    (a) =>
      (a.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.seller?.email || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tabList = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      activeBg: "bg-gradient-to-r from-[#A68E4E] via-amber-500 to-yellow-400 text-zinc-950 font-extrabold shadow-lg shadow-amber-500/30",
      iconColor: "text-amber-400",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    },
    {
      id: "analytics",
      label: "Statystyki",
      icon: BarChart3,
      activeBg: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-extrabold shadow-lg shadow-purple-500/30",
      iconColor: "text-purple-400",
      badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    },
    {
      id: "users",
      label: "Użytkownicy",
      icon: Users,
      activeBg: "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white font-extrabold shadow-lg shadow-blue-500/30",
      iconColor: "text-cyan-400",
      badgeClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    },
    {
      id: "auctions",
      label: "Aukcje",
      icon: Gavel,
      activeBg: "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-extrabold shadow-lg shadow-amber-500/30",
      iconColor: "text-amber-400",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    },
    {
      id: "meetings",
      label: "Spotkania",
      icon: CalendarClock,
      activeBg: "bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white font-extrabold shadow-lg shadow-rose-500/30",
      iconColor: "text-rose-400",
      badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    },
    {
      id: "references",
      label: "Referencje",
      icon: Star,
      activeBg: "bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-zinc-950 font-extrabold shadow-lg shadow-yellow-500/30",
      iconColor: "text-yellow-400",
      badgeClass: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    },
    {
      id: "payments",
      label: "Płatności",
      icon: CreditCard,
      activeBg: "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-extrabold shadow-lg shadow-emerald-500/30",
      iconColor: "text-emerald-400",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    },
    {
      id: "settings",
      label: "Ustawienia",
      icon: Settings,
      activeBg: "bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-600 text-white font-extrabold shadow-lg shadow-violet-500/30",
      iconColor: "text-violet-400",
      badgeClass: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    },
  ];

  const currentTab = tabList.find((t) => t.id === activeTab) || tabList[0]!;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6"
      data-lenis-prevent="true"
      data-lenis-prevent-touch="true"
    >
      <motion.div
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-7xl h-[94vh] md:h-[90vh] bg-[#0c1427] border-2 border-[#A68E4E]/70 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(166,142,78,0.35)] flex flex-col md:flex-row z-10"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        data-lenis-prevent="true"
        data-lenis-prevent-touch="true"
      >
        {/* Mobile Header & Horizontal Scrollable Tabs */}
        <div className="md:hidden flex flex-col bg-[#070e1e] border-b border-[#A68E4E]/40 p-3 gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#A68E4E]/40 to-amber-600/30 border border-[#A68E4E]/50">
                <Shield className="w-5 h-5 text-gold" />
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Admin<span className="text-[#A68E4E]">Panel</span>
              </h1>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-red-500/25 border border-red-500/50 text-red-200 hover:bg-red-500/40 transition-all flex items-center gap-1.5 text-xs font-bold"
              aria-label="Zamknij panel"
            >
              <X className="w-4 h-4 text-red-200" />
              <span>Zamknij</span>
            </button>
          </div>

          <nav className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar" data-lenis-prevent="true">
            {tabList.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? tab.activeBg
                    : "text-zinc-100 bg-[#121f3d] border border-[#A68E4E]/30 hover:bg-[#A68E4E]/30 hover:text-white"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "" : tab.iconColor}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-64 bg-[#070e1e] border-r border-[#A68E4E]/40 p-6 flex-col justify-between gap-6 shrink-0">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#A68E4E]/40 to-amber-600/30 border border-[#A68E4E]/60 shadow-md shadow-[#A68E4E]/30">
                <Shield className="w-6 h-6 text-gold" />
              </div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Admin<span className="text-[#A68E4E]">Panel</span>
              </h1>
            </div>

            <nav className="flex flex-col gap-2">
              {tabList.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                    activeTab === tab.id
                      ? `${tab.activeBg} scale-[1.02]`
                      : "text-zinc-100 bg-[#101b36] hover:bg-[#A68E4E]/25 hover:text-white border border-[#A68E4E]/30 hover:border-[#A68E4E]/60 font-semibold"
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-current" : tab.iconColor}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 border-red-500/50 text-red-200 hover:text-white bg-red-500/20 hover:bg-red-500/40 hover:border-red-500/70 transition-all duration-200 font-bold"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-red-200" /> Zamknij Panel
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0c1427] overflow-hidden">
          <header className="h-16 md:h-20 border-b border-[#A68E4E]/40 px-4 md:px-8 flex items-center justify-between gap-4 bg-[#070e1e]/95 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-xl group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gold group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  placeholder="Szukaj użytkowników, aukcji, spotkań..."
                  className="w-full pl-11 pr-4 py-2.5 text-sm bg-[#121f3d] border border-[#A68E4E]/40 rounded-xl text-white placeholder-zinc-300 outline-none focus:border-[#A68E4E] focus:ring-4 focus:ring-[#A68E4E]/30 transition-all font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Active Tab Badge Indicator */}
              <div className={`hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold ${currentTab.badgeClass}`}>
                <currentTab.icon className={`w-4 h-4 ${currentTab.iconColor}`} />
                <span>Sekcja: {currentTab.label}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-red-500/25 border border-red-500/50 text-red-200 hover:bg-red-500/40 hover:border-red-500/70 transition-all flex items-center gap-2 text-xs md:text-sm font-bold shrink-0 shadow-md shadow-red-950/40"
              title="Zamknij panel"
            >
              <X className="w-4 h-4 md:w-5 md:h-5 text-red-200" />
              <span className="hidden sm:inline">Zamknij</span>
            </button>
          </header>

          <main
            className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar overscroll-contain"
            data-lenis-prevent="true"
            data-lenis-prevent-touch="true"
          >
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
                  {activeTab === "meetings" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-semibold text-white">
                            Spotkania z hodowcami
                          </h2>
                          <p className="text-sm text-[#A68E4E]/70">
                            Edytuj treść galerii spotkań i zarządzaj zdjęciami.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={fetchData}
                          className="border-[#A68E4E]/40 text-[#A68E4E] hover:bg-[#A68E4E]/10"
                        >
                          Odśwież
                        </Button>
                      </div>
                      <div className="grid gap-3">
                        {meetings.map((m) => (
                          <div
                            key={m.id}
                            className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-lg bg-black/40 overflow-hidden shrink-0 border border-white/10">
                                {m.images?.[0] && (
                                  <img
                                    src={m.images[0]}
                                    alt={m.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-lg text-white">
                                  {m.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {m.location || "Brak lokalizacji"}
                                </div>
                                <div className="text-xs text-[#A68E4E]/70">
                                  {m.images?.length || 0} zdjęć
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="border-white/20 text-white hover:border-[#A68E4E]/40"
                                onClick={() => setEditingMeeting(m)}
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Edytuj
                              </Button>
                              <Button
                                variant="outline"
                                className="border-red-500/40 text-red-300 hover:bg-red-500/10"
                                onClick={() => setDeletingMeeting(m)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Usuń
                              </Button>
                            </div>
                          </div>
                        ))}
                        {meetings.length === 0 && (
                          <div className="py-6 text-center text-muted-foreground">
                            Brak spotkań.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {activeTab === "references" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-semibold text-white">
                            Referencje
                          </h2>
                          <p className="text-sm text-[#A68E4E]/70">
                            Edytuj opinie hodowców i akceptuj/ukrywaj wpisy.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={fetchData}
                          className="border-[#A68E4E]/40 text-[#A68E4E] hover:bg-[#A68E4E]/10"
                        >
                          Odśwież
                        </Button>
                      </div>
                      <div className="grid gap-3">
                        {references.map((r) => (
                          <div
                            key={r.id}
                            className="p-4 bg-white/5 border border-white/10 rounded-xl"
                          >
                            <div className="flex justify-between items-start gap-3">
                              <div>
                                <div className="font-bold text-lg text-gold">
                                  {r.breeder_name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {r.location || "Brak lokalizacji"}
                                </div>
                              </div>
                              <div className="px-3 py-1 rounded-md bg-black/40 border border-white/10 text-sm">
                                Ocena: {r.rating}/5
                              </div>
                            </div>
                            {editingReference?.id === r.id ? (
                              <form
                                className="mt-3 space-y-3"
                                onSubmit={handleReferenceSave}
                              >
                                <div className="grid md:grid-cols-2 gap-3">
                                  <input
                                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                                    placeholder="Hodowca"
                                    value={referenceDraft.breeder_name || ""}
                                    onChange={(e) =>
                                      setReferenceDraft((prev) => ({
                                        ...prev,
                                        breeder_name: e.target.value,
                                      }))
                                    }
                                    required
                                  />
                                  <input
                                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                                    placeholder="Lokalizacja"
                                    value={referenceDraft.location || ""}
                                    onChange={(e) =>
                                      setReferenceDraft((prev) => ({
                                        ...prev,
                                        location: e.target.value,
                                      }))
                                    }
                                    required
                                  />
                                  <input
                                    type="number"
                                    min={1}
                                    max={5}
                                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                                    placeholder="Ocena 1-5"
                                    value={referenceDraft.rating ?? r.rating ?? 5}
                                    onChange={(e) =>
                                      setReferenceDraft((prev) => ({
                                        ...prev,
                                        rating: Number(e.target.value),
                                      }))
                                    }
                                  />
                                  <input
                                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                                    placeholder="Nazwa gołębia"
                                    value={referenceDraft.pigeon_name || ""}
                                    onChange={(e) =>
                                      setReferenceDraft((prev) => ({
                                        ...prev,
                                        pigeon_name: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                                <textarea
                                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                                  placeholder="Opinia / doświadczenie"
                                  value={referenceDraft.opinion || referenceDraft.experience || ""}
                                  onChange={(e) =>
                                    setReferenceDraft((prev) => ({
                                      ...prev,
                                      opinion: e.target.value,
                                    }))
                                  }
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <Button type="submit" variant="outline" className="border-[#A68E4E]/40 text-[#A68E4E]">
                                    Zapisz
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="border-white/20 text-white"
                                    onClick={() => {
                                      setEditingReference(null);
                                      setReferenceDraft({});
                                    }}
                                  >
                                    Anuluj
                                  </Button>
                                  {!r.is_approved && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="border-green-500/40 text-green-300 hover:bg-green-500/10"
                                      onClick={() => handleReferenceApprove(r)}
                                    >
                                      Akceptuj
                                    </Button>
                                  )}
                                </div>
                              </form>
                            ) : (
                              <>
                                <p className="text-sm text-white/80 mt-2 line-clamp-3">
                          {r.opinion || r.experience || "Brak opisu"}
                                </p>
                                <div className="flex gap-2 flex-wrap mt-3">
                                  <Button
                                    variant="outline"
                                    className="border-white/20 text-white hover:border-[#A68E4E]/40"
                                    onClick={() => {
                                      setEditingReference(r);
                                      setReferenceDraft({
                                        breeder_name: r.breeder_name,
                                        location: r.location,
                                        rating: r.rating,
                                        opinion: r.opinion,
                                        ...(r.experience !== undefined ? { experience: r.experience } : {}),
                                        ...(r.achievements !== undefined ? { achievements: r.achievements } : {}),
                                        ...(r.pigeon_name !== undefined ? { pigeon_name: r.pigeon_name } : {}),
                                        ...(r.images !== undefined ? { images: r.images } : {}),
                                        ...(r.is_approved !== undefined ? { is_approved: r.is_approved } : {}),
                                      });
                                    }}
                                  >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edytuj
                                  </Button>
                                  {!r.is_approved && (
                                    <Button
                                      variant="outline"
                                      className="border-green-500/40 text-green-300 hover:bg-green-500/10"
                                      onClick={() => handleReferenceApprove(r)}
                                    >
                                      Akceptuj
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    className="border-red-500/40 text-red-300 hover:bg-red-500/10"
                                    onClick={() => handleReferenceDelete(r)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Usuń
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                        {references.length === 0 && (
                          <div className="py-6 text-center text-muted-foreground">
                            Brak referencji.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {activeTab === "settings" && <AdminSettings />}

                  {activeTab === "payments" && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-white">
                        Transakcje ({adminPayments.length})
                      </h2>
                      <AdminPaymentsTable 
                        payments={adminPayments} 
                        loading={loading} 
                        onStatusChange={handlePaymentStatusChange} 
                      />
                    </div>
                  )}
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

        {editingMeeting && (
          <EditBreederMeetingForm
            meeting={{
              id: editingMeeting.id,
              name: editingMeeting.name,
              location: editingMeeting.location ?? "",
              date: (editingMeeting as any).date ?? "",
              description: editingMeeting.description ?? "",
              images: editingMeeting.images || [],
            }}
            onSuccess={() => {
              setEditingMeeting(null);
              fetchData();
            }}
            onCancel={() => setEditingMeeting(null)}
          />
        )}

        <UnifiedModal
          isOpen={!!deletingMeeting}
          onClose={() => setDeletingMeeting(null)}
          type="warning"
          title="Potwierdź usunięcie"
          message={`Czy na pewno usunąć spotkanie "${
            deletingMeeting?.name || ""
          }"?`}
          confirmButton={{
            text: "Usuń",
            onClick: handleMeetingDelete,
          }}
          cancelButton={{
            text: "Anuluj",
            onClick: () => setDeletingMeeting(null),
          }}
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
