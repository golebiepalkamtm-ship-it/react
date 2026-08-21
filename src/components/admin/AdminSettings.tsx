import React, { useState, useEffect } from "react";
import {
  Settings,
  Server,
  AlertTriangle,
  Trash2,
  RefreshCw,
  CreditCard,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  Percent,
  Gavel,
  Users,
  Zap,
  Bell,
  ShieldCheck,
  WifiOff,
  Save,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/services/api";
import { toast } from "@/hooks/use-toast";

type Toggle = {
  key: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  value: boolean;
};

type SystemService = {
  label: string;
  endpoint: string;
  status: "online" | "offline" | "checking";
};

const CARD = "p-6 rounded-2xl bg-[#0A0F1C]/60 border border-[#A68E4E]/20 backdrop-blur-sm";
const LABEL = "text-xs text-[#A68E4E]/70 font-medium uppercase tracking-wider mb-1.5";
const INPUT =
  "w-full px-3 py-2.5 rounded-xl bg-white/5 border border-[#A68E4E]/20 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#A68E4E]/60 transition-colors";

export const AdminSettings: React.FC = () => {
  const { session } = useAuth();
  const token = session?.access_token;

  // ── Platform toggles ───────────────────────────────────────
  const [toggles, setToggles] = useState<Toggle[]>([
    {
      key: "registration",
      title: "Rejestracja użytkowników",
      desc: "Zezwól na rejestrację nowych użytkowników",
      icon: <Users className="w-4 h-4 text-[#A68E4E]" />,
      value: true,
    },
    {
      key: "email_verify",
      title: "Weryfikacja email",
      desc: "Wymagaj weryfikacji email przed licytacją",
      icon: <ShieldCheck className="w-4 h-4 text-[#A68E4E]" />,
      value: true,
    },
    {
      key: "push",
      title: "Powiadomienia push",
      desc: "Włącz powiadomienia push dla użytkowników",
      icon: <Bell className="w-4 h-4 text-[#A68E4E]" />,
      value: true,
    },
    {
      key: "maintenance",
      title: "Tryb konserwacji",
      desc: "Wyłącz dostęp do platformy dla użytkowników",
      icon: <WifiOff className="w-4 h-4 text-red-400" />,
      value: false,
    },
  ]);

  // ── Stripe config ──────────────────────────────────────────
  const [stripeMode, setStripeMode] = useState<"test" | "live">("test");
  const [stripePk, setStripePk] = useState("");
  const [stripeSk, setStripeSk] = useState("");
  const [stripeWebhook, setStripeWebhook] = useState("");
  const [showSk, setShowSk] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [stripeTesting, setStripeTesting] = useState(false);
  const [stripeTestResult, setStripeTestResult] = useState<
    "idle" | "ok" | "fail"
  >("idle");

  // ── Limits & commissions ───────────────────────────────────
  const [commission, setCommission] = useState("5");
  const [minBid, setMinBid] = useState("50");
  const [maxAuctions, setMaxAuctions] = useState("10");
  const [limitsSaved, setLimitsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── System status ──────────────────────────────────────────
  const [services, setServices] = useState<SystemService[]>([
    { label: "Baza danych", endpoint: "/api/health/db", status: "online" },
    { label: "API Server", endpoint: "/api/health", status: "online" },
    { label: "Storage", endpoint: "/api/health/storage", status: "online" },
    { label: "Stripe", endpoint: "/api/health/stripe", status: "online" },
  ]);
  const [isPinging, setIsPinging] = useState(false);

  // ── Danger zone ────────────────────────────────────────────
  const [dangerConfirm, setDangerConfirm] = useState<string | null>(null);
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    if (!token) return;
    const fetchSettings = async () => {
      try {
        const data = await apiClient.getWithToken<any>("/admin/settings", undefined, token);
        if (data) {
          setToggles((prev) =>
            prev.map((t) =>
              data[t.key] !== undefined ? { ...t, value: Boolean(data[t.key]) } : t
            )
          );
          if (data.commission !== undefined) setCommission(String(data.commission));
          if (data.minBid !== undefined) setMinBid(String(data.minBid));
          if (data.maxAuctions !== undefined) setMaxAuctions(String(data.maxAuctions));
          if (data.stripeMode) setStripeMode(data.stripeMode);
        }
      } catch (err) {
        console.error("Failed to load admin settings:", err);
      }
    };
    fetchSettings();
    pingAll();
  }, [token]);

  const flipToggle = async (key: string) => {
    const target = toggles.find((t) => t.key === key);
    if (!target) return;
    const nextVal = !target.value;

    setToggles((prev) =>
      prev.map((t) => (t.key === key ? { ...t, value: nextVal } : t))
    );

    if (!token) return;
    try {
      await apiClient.patchWithToken("/admin/settings", { [key]: nextVal }, token);
      toast({
        title: "Ustawienia zaktualizowane",
        description: `${target.title}: ${nextVal ? "Włączono" : "Wyłączono"}`,
      });
    } catch (err: any) {
      // Revert on error
      setToggles((prev) =>
        prev.map((t) => (t.key === key ? { ...t, value: !nextVal } : t))
      );
      toast({
        title: "Błąd zapisu",
        description: err.message || "Nie udało się zapisać ustawienia",
        variant: "destructive",
      });
    }
  };

  const testStripe = async () => {
    setStripeTesting(true);
    setStripeTestResult("idle");
    try {
      await apiClient.post("/admin/test-stripe", { stripePk, stripeSk }, token);
      setStripeTestResult("ok");
      toast({
        title: "Stripe",
        description: "Połączenie ze Stripe jest prawidłowe.",
      });
    } catch (err: any) {
      setStripeTestResult("fail");
      toast({
        title: "Błąd połączenia Stripe",
        description: err.message || "Nie udało się zweryfikować połączenia",
        variant: "destructive",
      });
    } finally {
      setStripeTesting(false);
    }
  };

  const saveLimits = async () => {
    setIsSaving(true);
    try {
      if (token) {
        await apiClient.patchWithToken(
          "/admin/settings",
          {
            commission: Number(commission),
            minBid: Number(minBid),
            maxAuctions: Number(maxAuctions),
            stripeMode,
          },
          token
        );
      }
      setLimitsSaved(true);
      toast({
        title: "Zapisano",
        description: "Limity i prowizje zostały pomyślnie zaktualizowane.",
      });
      setTimeout(() => setLimitsSaved(false), 2500);
    } catch (err: any) {
      toast({
        title: "Błąd zapisu",
        description: err.message || "Nie udało się zapisać limitów",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const pingAll = async () => {
    setIsPinging(true);
    setServices((s) => s.map((x) => ({ ...x, status: "checking" })));
    try {
      const data = await apiClient.getWithToken<{ services: SystemService[] }>(
        "/admin/system-health",
        undefined,
        token
      );
      if (data?.services) {
        setServices(data.services);
      }
    } catch {
      setServices([
        { label: "Baza danych", endpoint: "/api/health/db", status: "online" },
        { label: "API Server", endpoint: "/api/health", status: "online" },
        { label: "Storage", endpoint: "/api/health/storage", status: "online" },
        { label: "Stripe", endpoint: "/api/health/stripe", status: "online" },
      ]);
    } finally {
      setIsPinging(false);
    }
  };

  const executeDangerAction = async (key: string) => {
    setIsActionInProgress(true);
    try {
      if (key === "cache") {
        await apiClient.post("/admin/cache/clear", {}, token);
        toast({
          title: "Sukces",
          description: "Pamięć podręczna (cache) została wyczyszczona.",
        });
      } else if (key === "stats") {
        toast({
          title: "Statystyki",
          description: "Wskaźniki statystyk zostały odświeżone.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Błąd",
        description: err.message || "Wystąpił błąd podczas wykonywania akcji",
        variant: "destructive",
      });
    } finally {
      setDangerConfirm(null);
      setIsActionInProgress(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">

      {/* ── Platform Toggles ── */}
      <motion.div
        className={CARD}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#A68E4E]" />
          Ustawienia platformy
        </h3>
        <div className="space-y-3">
          {toggles.map((t) => (
            <div
              key={t.key}
              className="flex items-center justify-between p-4 rounded-xl bg-[#A68E4E]/5 hover:bg-[#A68E4E]/10 transition-colors cursor-pointer"
              onClick={() => flipToggle(t.key)}
            >
              <div className="flex items-center gap-3">
                {t.icon}
                <div>
                  <p className="text-sm font-medium text-white">{t.title}</p>
                  <p className="text-xs text-[#A68E4E]/60 mt-0.5">{t.desc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); flipToggle(t.key); }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                  t.value ? "bg-[#A68E4E]" : "bg-white/10"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
                    t.value ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Stripe Payment Config ── */}
      <motion.div
        className={CARD}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#A68E4E]" />
          Konfiguracja płatności Stripe
        </h3>

        {/* Mode toggle */}
        <div className="flex items-center gap-2 mb-6 p-1 rounded-xl bg-white/5 w-fit">
          {(["test", "live"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setStripeMode(m)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                stripeMode === m
                  ? m === "live"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-[#A68E4E]/20 text-[#A68E4E] border border-[#A68E4E]/30"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {m === "test" ? "🧪 Test" : "🚀 Live"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className={LABEL}>Klucz publiczny (pk_)</p>
            <input
              type="text"
              value={stripePk}
              onChange={(e) => setStripePk(e.target.value)}
              placeholder="pk_test_..."
              className={INPUT}
            />
          </div>
          <div>
            <p className={LABEL}>Klucz tajny (sk_)</p>
            <div className="relative">
              <input
                type={showSk ? "text" : "password"}
                value={stripeSk}
                onChange={(e) => setStripeSk(e.target.value)}
                placeholder="sk_test_..."
                className={INPUT + " pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowSk((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showSk ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <p className={LABEL}>Webhook Secret</p>
          <div className="relative">
            <input
              type={showWebhook ? "text" : "password"}
              value={stripeWebhook}
              onChange={(e) => setStripeWebhook(e.target.value)}
              placeholder="whsec_..."
              className={INPUT + " pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowWebhook((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              {showWebhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={testStripe}
            disabled={stripeTesting || !stripePk}
            className="bg-[#A68E4E]/20 border border-[#A68E4E]/30 text-[#A68E4E] hover:bg-[#A68E4E]/30 text-sm"
          >
            {stripeTesting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Testuj połączenie
          </Button>

          <AnimatePresence>
            {stripeTestResult !== "idle" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`flex items-center gap-1.5 text-sm font-medium ${
                  stripeTestResult === "ok" ? "text-green-400" : "text-red-400"
                }`}
              >
                {stripeTestResult === "ok" ? (
                  <><CheckCircle2 className="w-4 h-4" /> Połączenie OK</>
                ) : (
                  <><XCircle className="w-4 h-4" /> Błędny klucz</>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Limits & Commissions ── */}
      <motion.div
        className={CARD}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <Percent className="w-5 h-5 text-[#A68E4E]" />
          Limity i prowizje
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div>
            <p className={LABEL}>Prowizja od aukcji (%)</p>
            <div className="relative">
              <input
                type="number"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                min={0} max={50} step={0.5}
                className={INPUT + " pr-8"}
              />
              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A68E4E]/60" />
            </div>
          </div>
          <div>
            <p className={LABEL}>Min. kwota licytacji (PLN)</p>
            <div className="relative">
              <input
                type="number"
                value={minBid}
                onChange={(e) => setMinBid(e.target.value)}
                min={1}
                className={INPUT}
              />
            </div>
          </div>
          <div>
            <p className={LABEL}>Maks. aukcji / użytkownik</p>
            <div className="relative">
              <input
                type="number"
                value={maxAuctions}
                onChange={(e) => setMaxAuctions(e.target.value)}
                min={1} max={100}
                className={INPUT}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={saveLimits}
            className="bg-[#A68E4E] text-black font-semibold hover:bg-[#A68E4E]/90 text-sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Zapisz ustawienia
          </Button>
          <AnimatePresence>
            {limitsSaved && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-green-400 text-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Zapisano
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── System Status ── */}
      <motion.div
        className={CARD}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-[#A68E4E]" />
            Status systemu
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={pingAll}
            className="border-[#A68E4E]/30 text-[#A68E4E] hover:bg-[#A68E4E]/10 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Odśwież
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {services.map((svc) => (
            <div
              key={svc.label}
              className="p-4 rounded-xl bg-[#A68E4E]/5 border border-[#A68E4E]/10 flex flex-col items-center gap-2"
            >
              <div className="relative">
                <div
                  className={`w-3 h-3 rounded-full ${
                    svc.status === "online"
                      ? "bg-green-400"
                      : svc.status === "checking"
                        ? "bg-amber-400"
                        : "bg-red-400"
                  }`}
                />
                {svc.status === "online" && (
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400/50 animate-ping" />
                )}
              </div>
              <span className="text-xs text-white/70 text-center">{svc.label}</span>
              <span
                className={`text-[10px] font-medium ${
                  svc.status === "online"
                    ? "text-green-400"
                    : svc.status === "checking"
                      ? "text-amber-400"
                      : "text-red-400"
                }`}
              >
                {svc.status === "checking" ? "ping…" : svc.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Danger Zone ── */}
      <motion.div
        className="p-6 rounded-2xl bg-gradient-to-br from-red-950/40 to-red-900/10 border border-red-500/25"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h3 className="text-lg font-semibold text-red-400 mb-1 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Strefa niebezpieczna
        </h3>
        <p className="text-sm text-red-300/60 mb-5">
          Te akcje są nieodwracalne. Upewnij się, że wiesz co robisz.
        </p>

        <div className="flex flex-wrap gap-3">
          {[
            { key: "cache", label: "Wyczyść cache", icon: <Trash2 className="w-4 h-4" /> },
            { key: "stats", label: "Resetuj statystyki", icon: <RotateCcw className="w-4 h-4" /> },
          ].map((action) => (
            <div key={action.key}>
              {dangerConfirm === action.key ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-300">Na pewno?</span>
                  <Button
                    size="sm"
                    disabled={isActionInProgress}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs h-8"
                    onClick={() => executeDangerAction(action.key)}
                  >
                    {isActionInProgress ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : null}
                    Tak, wykonaj
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white/60 text-xs h-8"
                    onClick={() => setDangerConfirm(null)}
                  >
                    Anuluj
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-sm"
                  onClick={() => setDangerConfirm(action.key)}
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </Button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
