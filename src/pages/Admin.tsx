import React, { useEffect, useState } from "react";
import { logger } from "@/lib/logger";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/services/api";
import useChampions from "@/hooks/useChampions";
import { meetingsService, Meeting } from "@/services/meetingsService";
import referenceService, { Reference } from "@/services/referenceService";
import { Trophy, Users, Star, UserCog, AlertCircle } from "lucide-react";

interface UserItem {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  created_at?: string;
}

const AdminPage: React.FC = () => {
  const { profile, session } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "users" | "champions" | "meetings" | "references"
  >("users");

  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Data for new tabs
  const { champions, loading: champsLoading } = useChampions();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      if (!session?.access_token) return;
      const data = await apiClient.getWithToken<{ users: UserItem[] }>(
        "/admin/users",
        undefined,
        session.access_token,
      );
      setUsers(data.users || []);
    } catch (e) {
      logger.error(e);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  const fetchStats = React.useCallback(async () => {
    try {
      if (!session?.access_token) return;
      const stats = await apiClient.getWithToken(
        "/admin/stats",
        undefined,
        session.access_token,
      );
      setStats(stats);
    } catch (e) {
      logger.error(e);
    }
  }, [session?.access_token]);

  const fetchOtherData = async () => {
    try {
      const ms = await meetingsService.getMeetings();
      setMeetings(ms);

      const rs = await referenceService.getReferences();
      setReferences(rs);
    } catch (e) {
      logger.error(e);
    }
  };

  useEffect(() => {
    if (!profile || profile.role !== "ADMIN" || !session?.access_token) return;
    fetchData();
    fetchStats();
    fetchOtherData();
  }, [profile, session?.access_token, fetchData, fetchStats]);

  async function updateRole(id: string, role: string) {
    try {
      if (!session?.access_token) return;
      await apiClient.put(
        `/admin/users/${id}/role`,
        { role },
        session.access_token,
      );
      await fetchData();
    } catch (e) {
      logger.error(e);
    }
  }

  async function deleteUser(id: string) {
    if (
      !confirm(
        "Na pewno usunąć użytkownika? (This will attempt to delete auth record and profile)",
      )
    )
      return;
    try {
      const r = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed");
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  }

  const handleFeatureNotImplemented = () => {
    alert(
      "Funkcja edycji zaawansowanej jest we wczesnym etapie budowy (Wymaga aktywacji po stronie backendu/bazy). Na ten moment wyświetlamy jedynie widok danych.",
    );
  };

  if (!profile)
    return <div className="container mx-auto p-8">Ładowanie...</div>;
  if (profile.role !== "ADMIN")
    return (
      <div className="container mx-auto p-8 flex items-center gap-2 text-red-500">
        <AlertCircle /> Dostęp zabroniony
      </div>
    );

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-display text-3xl md:text-5xl text-foreground font-bold leading-tight mb-2 text-gold">
            Panel Administratora
          </h1>
          <p className="text-muted-foreground text-sm">
            Zarządzaj systemem, użytkownikami i treścią strony
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-black/40 border border-white/5 p-4 rounded-xl backdrop-blur-md">
          <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
            Aukcje
          </div>
          <div className="text-2xl font-bold">
            {stats?.totalAuctions ?? "..."}
          </div>
        </div>
        <div className="bg-black/40 border border-white/5 p-4 rounded-xl backdrop-blur-md">
          <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
            Aktywne
          </div>
          <div className="text-2xl font-bold text-green-500">
            {stats?.activeAuctions ?? "..."}
          </div>
        </div>
        <div className="bg-black/40 border border-white/5 p-4 rounded-xl backdrop-blur-md">
          <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
            Użytkownicy
          </div>
          <div className="text-2xl font-bold">{stats?.totalUsers ?? "..."}</div>
        </div>
        <div className="bg-black/40 border border-gold/20 p-4 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(212,175,55,0.1)]">
          <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
            Wolumen całkowity
          </div>
          <div className="text-2xl font-bold text-gold">
            {stats?.totalVolume ?? "..."} PLN
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 border-b border-white/10 shrink-0 scrollbar-hide">
        <button
          onClick={() => setActiveTab("users")}
          className={`whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "users" ? "bg-gold/10 text-gold border border-gold/30" : "bg-transparent text-white/60 hover:text-white hover:bg-white/5 border border-transparent"}`}
        >
          <UserCog className="w-4 h-4" /> Użytkownicy
        </button>
        <button
          onClick={() => setActiveTab("champions")}
          className={`whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "champions" ? "bg-gold/10 text-gold border border-gold/30" : "bg-transparent text-white/60 hover:text-white hover:bg-white/5 border border-transparent"}`}
        >
          <Trophy className="w-4 h-4" /> Championy
        </button>
        <button
          onClick={() => setActiveTab("meetings")}
          className={`whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "meetings" ? "bg-gold/10 text-gold border border-gold/30" : "bg-transparent text-white/60 hover:text-white hover:bg-white/5 border border-transparent"}`}
        >
          <Users className="w-4 h-4" /> Spotkania
        </button>
        <button
          onClick={() => setActiveTab("references")}
          className={`whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "references" ? "bg-gold/10 text-gold border border-gold/30" : "bg-transparent text-white/60 hover:text-white hover:bg-white/5 border border-transparent"}`}
        >
          <Star className="w-4 h-4" /> Referencje
        </button>
      </div>

      <div className="bg-black/20 border border-white/5 rounded-2xl p-6 backdrop-blur-md relative min-h-[400px]">
        {/* USERS TAB */}
        {activeTab === "users" && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="font-medium text-xl mb-4 text-white">
              Zarządzanie Użytkownikami
            </h2>
            {loading ? (
              <div className="py-8 text-center text-muted-foreground animate-pulse">
                Pobieranie użytkowników...
              </div>
            ) : (
              <div className="grid gap-3">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/20 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-lg">
                        {u.name || (u.email ? u.email.split("@")[0] : u.id)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {u.email}
                      </div>
                      <div className="text-xs mt-1 inline-flex px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
                        Rola: {u.role}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-white rounded outline-none transition-colors border border-white/10"
                        onClick={() => updateRole(u.id, "USER_REGISTERED")}
                      >
                        User
                      </button>
                      <button
                        className="px-3 py-1.5 text-xs font-medium bg-blue-900/50 hover:bg-blue-800/80 text-blue-100 rounded outline-none transition-colors border border-blue-500/30"
                        onClick={() => updateRole(u.id, "USER_FULL_VERIFIED")}
                      >
                        VIP
                      </button>
                      <button
                        className="px-3 py-1.5 text-xs font-medium bg-gold/20 hover:bg-gold/40 text-gold rounded outline-none transition-colors border border-gold/30"
                        onClick={() => updateRole(u.id, "ADMIN")}
                      >
                        Admin
                      </button>
                      <button
                        className="px-3 py-1.5 text-xs font-medium bg-red-900/30 hover:bg-red-900/60 text-red-400 rounded outline-none transition-colors border border-red-900/50 ml-auto md:ml-2"
                        onClick={() => deleteUser(u.id)}
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    Brak użytkowników
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* CHAMPIONS TAB */}
        {activeTab === "champions" && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-medium text-xl text-white">
                Bliższe dane Championów
              </h2>
              <button
                onClick={handleFeatureNotImplemented}
                className="px-4 py-2 bg-gold hover:bg-gold-light text-black font-bold text-sm rounded-lg shadow-lg shadow-gold/20 transition-all active:scale-95"
              >
                + Dodaj Championa
              </button>
            </div>
            {champsLoading ? (
              <div className="py-8 text-center text-muted-foreground animate-pulse">
                Pobieranie bazy championów...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {champions.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-gold/30 transition-colors group"
                  >
                    <div className="h-48 w-full bg-black/40 overflow-hidden relative">
                      <img
                        src={c.images[0]}
                        alt={c.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <div className="font-bold text-lg">{c.name}</div>
                        <div className="text-xs text-gold">{c.ringNumber}</div>
                      </div>
                    </div>
                    <div className="p-4 flex gap-2">
                      <button
                        onClick={handleFeatureNotImplemented}
                        className="flex-1 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-md transition-colors border border-white/5"
                      >
                        Podgląd / Edytuj
                      </button>
                      <button
                        onClick={handleFeatureNotImplemented}
                        className="py-1.5 px-3 text-sm bg-red-900/30 text-red-400 hover:bg-red-900/60 rounded-md transition-colors"
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                ))}
                {champions.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground w-full col-span-full">
                    Brak wystawionych championów
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* MEETINGS TAB */}
        {activeTab === "meetings" && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-medium text-xl text-white">
                Galeria Spotkań z Hodowcami
              </h2>
              <button
                onClick={handleFeatureNotImplemented}
                className="px-4 py-2 bg-gold hover:bg-gold-light text-black font-bold text-sm rounded-lg shadow-lg shadow-gold/20 transition-all active:scale-95"
              >
                + Nowe Spotkanie
              </button>
            </div>
            <div className="grid gap-3">
              {meetings.map((m, idx) => (
                <div
                  key={m.id || idx}
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
                        {m.images?.length || 0} zdjęć w galerii
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={handleFeatureNotImplemented}
                      className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/5"
                    >
                      Zarządzaj wpisem
                    </button>
                  </div>
                </div>
              ))}
              {meetings.length === 0 && (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  Nic jeszcze tutaj nie ma.
                </div>
              )}
            </div>
          </section>
        )}

        {/* REFERENCES TAB */}
        {activeTab === "references" && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-medium text-xl text-white">
                Referencje Użytkowników
              </h2>
              <button
                onClick={handleFeatureNotImplemented}
                className="px-4 py-2 bg-gold hover:bg-gold-light text-black font-bold text-sm rounded-lg shadow-lg shadow-gold/20 transition-all active:scale-95"
              >
                + Dodaj Referencję
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {references.map((r, idx) => (
                <div
                  key={r.id || idx}
                  className="p-5 bg-white/5 border border-white/10 rounded-xl relative"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-lg text-gold">
                        {r.breeder_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {r.location || "Brak wpisanej lokalizacji"}
                      </div>
                    </div>
                    <div className="bg-black/30 px-2 py-1 rounded-md text-sm border border-white/10">
                      Ocena: {r.rating}/5
                    </div>
                  </div>
                  <p className="text-sm text-white/80 line-clamp-3 mb-4 italic">
                    "{r.opinion || r.testimonial}"
                  </p>

                  {r.images && r.images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto mb-4 pb-2 scrollbar-thin">
                      {r.images.map((img, i) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-md bg-black/40 overflow-hidden shrink-0 border border-white/10"
                        >
                          <img
                            src={img}
                            className="w-full h-full object-cover"
                            alt="ref"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={handleFeatureNotImplemented}
                      className="flex-1 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded pl-2 pr-2 transition-colors"
                    >
                      Edytuj
                    </button>
                    {!r.is_approved && (
                      <button
                        onClick={handleFeatureNotImplemented}
                        className="flex-1 py-1.5 text-xs bg-green-900/30 text-green-400 hover:bg-green-900/60 border border-green-900/50 rounded transition-colors"
                      >
                        Akceptuj
                      </button>
                    )}
                    <button
                      onClick={handleFeatureNotImplemented}
                      className="flex-1 py-1.5 text-xs bg-red-900/30 text-red-400 hover:bg-red-900/60 border border-red-900/50 rounded transition-colors"
                    >
                      Usuń
                    </button>
                  </div>

                  {!r.is_approved && (
                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                      OCZEKUJE
                    </div>
                  )}
                </div>
              ))}
              {references.length === 0 && (
                <div className="py-8 text-center text-muted-foreground w-full col-span-2">
                  Baza referencji jest pusta
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
