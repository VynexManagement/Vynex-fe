"use client";

import { useEffect, useState } from "react";
import { Download, Database, Plus, Loader2, Tag, Globe, Zap, CreditCard, User, History, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { getPurchases, downloadLeads, type PurchaseItem } from "@/lib/api";
import { supabase } from "@/lib/supabase";

interface SavedQuery {
  id: string;
  name: string;
  niches: string[];
  countries: string[];
  signalIds: string[];
  signalNames: string[];
  timestamp: string;
}

function DashboardContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"datasets" | "profile">("datasets");

  // Platform Pulse State
  const [pulse, setPulse] = useState({ totalStores: 0, totalLeads: 0, activeNiches: 0, loading: true });

  // Saved Queries State
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);

  // Purchases State
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState("");

  // Profile State
  const [profile, setProfile] = useState({ name: "", org: "", purpose: "", phone: "" });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    // Load Purchases
    getPurchases()
      .then(setPurchases)
      .catch((e) => setPurchaseError(e.message))
      .finally(() => setLoadingPurchases(false));

    // Load Live Platform Pulse
    fetchPulse();

    // Load Saved Queries from LocalStorage
    loadSavedQueries();

    // Load Profile
    fetchProfile();
  }, []);

  const fetchPulse = async () => {
    try {
      const [storesRes, leadsRes, distinctNiches] = await Promise.all([
        supabase.from("stores").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("stores").select("niche")
      ]);
      
      const uniqueNiches = new Set((distinctNiches.data || []).map(x => x.niche)).size;
      
      setPulse({
        totalStores: storesRes.count || 0,
        totalLeads: leadsRes.count || 0,
        activeNiches: uniqueNiches || 8,
        loading: false
      });
    } catch (err) {
      console.error("Pulse metrics fetch failed", err);
      setPulse(prev => ({ ...prev, loading: false }));
    }
  };

  const loadSavedQueries = () => {
    try {
      const raw = localStorage.getItem("savedLeadQueries");
      if (raw) {
        setSavedQueries(JSON.parse(raw));
      }
    } catch (err) {
      console.error("Failed loading saved queries", err);
    }
  };

  const handleDeleteQuery = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const updated = savedQueries.filter(q => q.id !== id);
      setSavedQueries(updated);
      localStorage.setItem("savedLeadQueries", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoadQuery = (q: SavedQuery) => {
    const nParams = q.niches.length ? `&niches=${q.niches.join(",")}` : "";
    const cParams = q.countries.length ? `&countries=${q.countries.join(",")}` : "";
    const sParams = q.signalIds.length ? `&signal_ids=${q.signalIds.join(",")}` : "";
    const snParams = q.signalNames.length ? `&signal_names=${q.signalNames.join(",")}` : "";
    
    router.push(`/query?load=1${nParams}${cParams}${sParams}${snParams}`);
  };

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (error && error.code !== "PGRST116") throw error; // ignore not found
      if (data) {
        setProfile({
          name: data.name || "",
          org: data.org || "",
          purpose: data.purpose || "",
          phone: data.phone || ""
        });
      } else {
        setProfile({
          name: user.user_metadata.name || "",
          org: user.user_metadata.org || "",
          purpose: user.user_metadata.purpose || "",
          phone: user.user_metadata.phone || ""
        });
      }
    } catch (e: any) {
      console.error(e);
      setProfileError("Could not fetch profile.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    setProfileSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const { error } = await supabase.from("profiles").update({
        name: profile.name,
        org: profile.org,
        purpose: profile.purpose,
        phone: profile.phone
      }).eq("id", user.id);

      if (error) throw error;
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (e: any) {
      console.error(e);
      setProfileError("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDownload = async (datasetId: string, niche: string) => {
    setDownloading(datasetId);
    try {
      const blob = await downloadLeads(datasetId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${niche.toLowerCase()}_leads.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setDownloading(null);
    }
  };

  const SIGNAL_COLORS: Record<string, string> = {
    "no_email_detected": "text-[#ffd6ba] bg-[#ffd6ba]/10 border-[#ffd6ba]/20",
    "no_reviews_detected": "text-[#ffdcdc] bg-[#ffdcdc]/10 border-[#ffdcdc]/20",
    "no_social_links": "text-[#00adb5] bg-[#00adb5]/10 border-[#00adb5]/20",
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* ── HEADER & QUICK CTAs ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-white/05">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#00adb5] font-semibold block mb-1.5">CLIENT CONSOLE</span>
          <h1 className="text-4xl font-extrabold text-[#fafafa] tracking-tight">Dashboard</h1>
          <p className="text-[#eeeeee]/45 mt-1 text-sm">Monitor platform metrics, saved searches, and downloads.</p>
        </div>
        <Link
          href="/query"
          id="dashboard-new-query"
          className="btn-primary group px-6 py-3.5 text-sm font-bold flex items-center gap-2"
        >
          <Plus size={16} /> New Query
          <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-1 group-active:scale-95 shrink-0">
            <ArrowRight size={12} />
          </span>
        </Link>
      </div>

      {/* ── BENTO GRID: PLATFORM PULSE & SEARCH HISTORY ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Platform Pulse Card (col-span-2) */}
        <div className="lg:col-span-2 double-bezel-outer">
          <div className="double-bezel-inner p-6 space-y-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-[#00adb5]" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#eeeeee]/60">Platform Pulse</h3>
              </div>
              <h2 className="text-2xl font-bold text-[#eeeeee] tracking-tight">Live Platform Data</h2>
              <p className="text-xs text-[#eeeeee]/45 mt-1.5 leading-relaxed">
                Direct metrics fetched from our active scraping networks and lead catalogs.
              </p>
            </div>

            {pulse.loading ? (
              <div className="flex items-center justify-center py-6 text-xs text-[#eeeeee]/30">
                <Loader2 className="animate-spin w-4 h-4 mr-2 text-[#00adb5]" /> Syncing metrics...
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/05">
                <div className="text-center">
                  <div className="text-xl font-extrabold text-[#00adb5] tracking-tight">
                    {pulse.totalStores.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#eeeeee]/40 mt-1 uppercase tracking-wider">Stores</div>
                </div>
                <div className="text-center border-x border-white/05">
                  <div className="text-xl font-extrabold text-[#eeeeee] tracking-tight">
                    {pulse.totalLeads.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#eeeeee]/40 mt-1 uppercase tracking-wider">Leads</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-extrabold text-[#ffd6ba] tracking-tight">
                    {pulse.activeNiches}
                  </div>
                  <div className="text-[10px] text-[#eeeeee]/40 mt-1 uppercase tracking-wider">Niches</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Saved Searches / History Card (col-span-3) */}
        <div className="lg:col-span-3 double-bezel-outer">
          <div className="double-bezel-inner p-6 space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <History size={16} className="text-[#ffd6ba]" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#eeeeee]/60">Saved Searches</h3>
              </div>
              <h2 className="text-2xl font-bold text-[#eeeeee] tracking-tight">Query Templates</h2>
              <p className="text-xs text-[#eeeeee]/45 mt-1">
                Quickly reload your custom search filters to check for newly scraped leads.
              </p>
            </div>

            <div className="max-h-[120px] overflow-y-auto space-y-2 pr-1 pt-2 border-t border-white/05">
              {savedQueries.length === 0 ? (
                <div className="text-xs text-[#eeeeee]/30 italic py-4">
                  No saved searches yet. Check "Save this query" when searching to add templates!
                </div>
              ) : (
                savedQueries.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => handleLoadQuery(q)}
                    className="flex justify-between items-center bg-white/[0.02] hover:bg-[#00adb5]/06 border border-white/05 hover:border-[#00adb5]/25 rounded-xl px-4 py-2.5 cursor-pointer transition-all group"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-[#eeeeee] group-hover:text-[#00adb5] transition-colors">
                        {q.name}
                      </div>
                      <div className="text-[10px] text-[#eeeeee]/45 flex flex-wrap gap-x-2">
                        {q.niches.length > 0 && <span>Niches: {q.niches.join(", ")}</span>}
                        {q.countries.length > 0 && <span>Countries: {q.countries.join(", ")}</span>}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteQuery(q.id, e)}
                      className="p-1.5 rounded-lg text-[#eeeeee]/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete Template"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS NAVIGATION ────────────────────────────────────────────────── */}
      <div className="flex border-b border-[#2f2f2f]">
        <button
          onClick={() => setActiveTab("datasets")}
          className={`pb-3 px-6 font-bold text-sm transition-all border-b-2 ${
            activeTab === "datasets" ? "border-white text-white" : "border-transparent text-[#a3a3a3] hover:text-white"
          }`}
        >
          My Purchased Lists
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 px-6 font-bold text-sm transition-all border-b-2 ${
            activeTab === "profile" ? "border-white text-white" : "border-transparent text-[#a3a3a3] hover:text-white"
          }`}
        >
          Account Settings
        </button>
      </div>

      {/* ── TAB CONTENT ────────────────────────────────────────────────────── */}
      {activeTab === "datasets" && (
        <div className="space-y-6">
          {loadingPurchases ? (
            <div className="flex items-center justify-center py-20 text-[#a3a3a3]">
              <Loader2 className="animate-spin w-6 h-6 mr-2 text-white" /> Loading purchased files...
            </div>
          ) : purchaseError ? (
            <div className="glass-card p-8 text-center text-[#ffdcdc] border-red-500/20 bg-red-950/10">{purchaseError}</div>
          ) : purchases.length === 0 ? (
            <div className="glass-card p-16 text-center space-y-6 max-w-xl mx-auto border-white/05 bg-white/[0.01]">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/08 flex items-center justify-center mx-auto">
                <Database className="w-7 h-7 text-[#eeeeee]/30" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-[#eeeeee]">No unlocked lists yet</h2>
                <p className="text-[#eeeeee]/40 text-xs max-w-xs mx-auto leading-relaxed">
                  Search leads, preview available stores, and purchase to unlock instant CSV downloads.
                </p>
              </div>
              <Link href="/query" className="btn-primary inline-block px-6 py-3 font-bold text-sm">
                Search Leads
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {purchases.map((p) => (
                <div key={p.id} className="double-bezel-outer transition-premium hover:-translate-y-0.5">
                  <div className="double-bezel-inner p-5 space-y-4 h-full flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Database className="text-[#00adb5] w-4 h-4 shrink-0" />
                          <span className="font-extrabold text-[#eeeeee] text-base tracking-tight">
                            {p.niche} Leads
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#eeeeee]/30 uppercase">ID: {p.dataset_id.slice(0, 8)}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 bg-[#fff2eb]/08 border border-[#fff2eb]/14 text-[#fff2eb] px-2.5 py-0.5 rounded-full text-[10px] font-medium">
                          <Globe size={9} /> {p.country}
                        </span>
                        <span
                          className={`flex items-center gap-1 border px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                            SIGNAL_COLORS[p.signal] || "text-[#ffd6ba] bg-[#ffd6ba]/10 border-[#ffd6ba]/20"
                          }`}
                        >
                          <Zap size={9} /> {p.signal.replace(/_/g, " ")}
                        </span>
                        <span className="flex items-center gap-1 bg-[#00adb5]/10 border border-[#00adb5]/20 text-[#00adb5] px-2.5 py-0.5 rounded-full text-[10px] font-medium">
                          <Tag size={9} /> {p.total_leads.toLocaleString()} records
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/05 flex items-center justify-between gap-4">
                      <div className="text-[10px] text-[#eeeeee]/35">
                        Unlocked {new Date(p.purchase_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <button
                        id={`download-${p.dataset_id.slice(0, 8)}`}
                        onClick={() => handleDownload(p.dataset_id, p.niche)}
                        disabled={downloading === p.dataset_id}
                        className="flex items-center gap-2 bg-white/[0.02] hover:bg-[#00adb5]/10 border border-white/08 hover:border-[#00adb5]/40 px-4 py-2 rounded-xl font-bold text-xs text-[#eeeeee]/70 hover:text-[#00adb5] transition-all disabled:opacity-50"
                      >
                        {downloading === p.dataset_id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Download size={13} />
                        )}
                        {downloading === p.dataset_id ? "Syncing..." : "Download CSV"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "profile" && (
        <div className="max-w-2xl">
          {loadingProfile ? (
            <div className="flex items-center py-20 text-[#eeeeee]/40">
              <Loader2 className="animate-spin w-6 h-6 mr-2 text-[#00adb5]" /> Loading settings...
            </div>
          ) : (
            <div className="double-bezel-outer">
              <div className="double-bezel-inner p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/05 pb-4">
                  <User className="text-[#00adb5] w-5 h-5" />
                  <h2 className="text-xl font-extrabold text-[#eeeeee] tracking-tight">Account Profile</h2>
                </div>
                
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#eeeeee]/55">Full Name</label>
                      <input
                        type="text"
                        required
                        value={profile.name}
                        onChange={(e) => setProfile(prev => ({...prev, name: e.target.value}))}
                        className="w-full bg-[#121212]/50 border border-white/08 focus:border-[#00adb5]/50 rounded-xl px-4 py-3 text-[#eeeeee] text-sm focus:outline-none focus:ring-1 focus:ring-[#00adb5] transition-all"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#eeeeee]/55">Organization</label>
                      <input
                        type="text"
                        value={profile.org}
                        onChange={(e) => setProfile(prev => ({...prev, org: e.target.value}))}
                        className="w-full bg-[#121212]/50 border border-white/08 focus:border-[#00adb5]/50 rounded-xl px-4 py-3 text-[#eeeeee] text-sm focus:outline-none focus:ring-1 focus:ring-[#00adb5] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#eeeeee]/55">Phone Number</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => ({...prev, phone: e.target.value}))}
                        className="w-full bg-[#121212]/50 border border-white/08 focus:border-[#00adb5]/50 rounded-xl px-4 py-3 text-[#eeeeee] text-sm focus:outline-none focus:ring-1 focus:ring-[#00adb5] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#eeeeee]/55">Usage Purpose</label>
                      <select
                        required
                        value={profile.purpose}
                        onChange={(e) => setProfile(prev => ({...prev, purpose: e.target.value}))}
                        className="w-full bg-[#121212]/50 border border-white/08 focus:border-[#00adb5]/50 rounded-xl px-4 py-3 text-[#eeeeee] text-sm focus:outline-none focus:ring-1 focus:ring-[#00adb5] transition-all appearance-none"
                      >
                        <option value="" disabled>Select your usage...</option>
                        <option value="Marketing Agency">Marketing Agency</option>
                        <option value="D2C Brand">D2C Brand</option>
                        <option value="E-commerce Founder">E-commerce Founder</option>
                        <option value="Sales/Lead Gen">Sales/Lead Gen</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/05 flex items-center justify-between">
                    <div>
                      {profileSuccess && <span className="text-xs font-semibold text-[#00adb5]">Settings saved successfully!</span>}
                      {profileError && <span className="text-xs font-semibold text-red-400">{profileError}</span>}
                    </div>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="btn-primary py-2.5 px-6 font-bold text-xs flex items-center gap-2"
                    >
                      {savingProfile ? <Loader2 className="animate-spin w-4 h-4" /> : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
