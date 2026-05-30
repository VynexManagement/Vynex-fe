"use client";

import { useEffect, useState } from "react";
import { Download, Database, Plus, Loader2, Tag, Globe, Zap, CreditCard, User } from "lucide-react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { getPurchases, downloadLeads, type PurchaseItem } from "@/lib/api";
import { supabase } from "@/lib/supabase";

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<"datasets" | "profile">("datasets");

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
    getPurchases()
      .then(setPurchases)
      .catch((e) => setPurchaseError(e.message))
      .finally(() => setLoadingPurchases(false));

    fetchProfile();
  }, []);

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
        // Fallback to user metadata if profile wasn't found (trigger didn't run?)
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
    "No Email Marketing": "text-[#ffd6ba] bg-[#ffd6ba]/10 border-[#ffd6ba]/20",
    "No Reviews":         "text-[#ffdcdc] bg-[#ffdcdc]/10 border-[#ffdcdc]/20",
    "No Social Presence": "text-[#00adb5] bg-[#00adb5]/10 border-[#00adb5]/20",
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-5xl mx-auto px-6 py-10">
      {/* Header and Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#eeeeee] mb-1">Dashboard</h1>
          <p className="text-[#eeeeee]/45">Manage your datasets and profile.</p>
        </div>
        <Link
          href="/query"
          id="dashboard-new-query"
          className="btn-primary px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={16} /> New Query
        </Link>
      </div>

      <div className="flex border-b border-[#00adb5]/12 mb-8">
        <button
          onClick={() => setActiveTab("datasets")}
          className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === "datasets" ? "border-[#00adb5] text-[#00adb5]" : "border-transparent text-[#eeeeee]/40 hover:text-[#eeeeee]/70"
          }`}
        >
          My Datasets
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === "profile" ? "border-[#00adb5] text-[#00adb5]" : "border-transparent text-[#eeeeee]/40 hover:text-[#eeeeee]/70"
          }`}
        >
          My Profile
        </button>
      </div>

      {activeTab === "datasets" && (
        <>
          {loadingPurchases ? (
            <div className="flex items-center justify-center py-20 text-[#eeeeee]/40">
              <Loader2 className="animate-spin w-6 h-6 mr-2 text-[#00adb5]" /> Loading purchases...
            </div>
          ) : purchaseError ? (
            <div className="glass-card p-8 text-center text-[#ffdcdc]">{purchaseError}</div>
          ) : purchases.length === 0 ? (
            <div className="glass-card p-14 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#ffe8cd]/10 border border-[#ffe8cd]/15 flex items-center justify-center mx-auto">
                <Database className="w-8 h-8 text-[#ffe8cd]/60" />
              </div>
              <h2 className="text-xl font-bold text-[#eeeeee]/60">No purchases yet</h2>
              <p className="text-[#eeeeee]/35 text-sm max-w-xs mx-auto">
                Find your first dataset, preview leads, and unlock the full list to get started.
              </p>
              <Link href="/query" className="btn-primary inline-block px-6 py-3 rounded-full font-semibold text-sm">
                Find Leads
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {purchases.map((p) => (
                <div
                  key={p.id}
                  className="glass-card p-5 flex flex-col sm:flex-row justify-between gap-4 hover:border-[#00adb5]/28 transition-colors"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Database className="text-[#ffd6ba] w-4 h-4 shrink-0" />
                      <span className="font-bold text-[#eeeeee] text-lg">
                        {p.niche} Leads
                      </span>
                      <span className="text-xs font-mono text-[#eeeeee]/25">#{p.dataset_id.slice(0, 8)}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 bg-[#fff2eb]/08 border border-[#fff2eb]/14 text-[#fff2eb] px-2.5 py-1 rounded-full">
                        <Globe size={10} /> {p.country}
                      </span>
                      <span
                        className={`flex items-center gap-1 border px-2.5 py-1 rounded-full ${
                          SIGNAL_COLORS[p.signal] || "text-[#ffd6ba] bg-[#ffd6ba]/10 border-[#ffd6ba]/20"
                        }`}
                      >
                        <Zap size={10} /> {p.signal}
                      </span>
                      <span className="flex items-center gap-1 bg-[#00adb5]/10 border border-[#00adb5]/20 text-[#00adb5] px-2.5 py-1 rounded-full">
                        <Tag size={10} /> {p.total_leads.toLocaleString()} leads
                      </span>
                      {p.payment_method && (
                        <span className="flex items-center gap-1 text-[#eeeeee]/28 text-xs">
                          <CreditCard size={10} /> via {p.payment_method}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#eeeeee]/28">
                      Purchased {new Date(p.purchase_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <button
                      id={`download-${p.dataset_id.slice(0, 8)}`}
                      onClick={() => handleDownload(p.dataset_id, p.niche)}
                      disabled={downloading === p.dataset_id}
                      className="flex items-center gap-2 bg-[#393e46]/60 hover:bg-[#00adb5]/15 border border-[#00adb5]/18 hover:border-[#00adb5]/35 px-5 py-2.5 rounded-xl font-semibold text-sm text-[#eeeeee]/70 hover:text-[#00adb5] transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                      {downloading === p.dataset_id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Download size={15} />
                      )}
                      {downloading === p.dataset_id ? "Downloading..." : "Download CSV"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "profile" && (
        <div className="max-w-2xl">
          {loadingProfile ? (
            <div className="flex items-center py-20 text-[#eeeeee]/40">
              <Loader2 className="animate-spin w-6 h-6 mr-2 text-[#00adb5]" /> Loading profile...
            </div>
          ) : (
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6 border-b border-[#00adb5]/12 pb-4">
                <User className="text-[#00adb5] w-6 h-6" />
                <h2 className="text-xl font-bold text-[#eeeeee]">Profile Details</h2>
              </div>
              
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#eeeeee]/55">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({...prev, name: e.target.value}))}
                      className="w-full bg-[#393e46]/50 border border-[#00adb5]/18 rounded-xl px-4 py-3 text-[#eeeeee] focus:outline-none focus:ring-2 focus:ring-[#00adb5] transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#eeeeee]/55">Organization</label>
                    <input
                      type="text"
                      value={profile.org}
                      onChange={(e) => setProfile(prev => ({...prev, org: e.target.value}))}
                      className="w-full bg-[#393e46]/50 border border-[#00adb5]/18 rounded-xl px-4 py-3 text-[#eeeeee] focus:outline-none focus:ring-2 focus:ring-[#00adb5] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#eeeeee]/55">Phone</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({...prev, phone: e.target.value}))}
                      className="w-full bg-[#393e46]/50 border border-[#00adb5]/18 rounded-xl px-4 py-3 text-[#eeeeee] focus:outline-none focus:ring-2 focus:ring-[#00adb5] transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#eeeeee]/55">Purpose</label>
                    <select
                      required
                      value={profile.purpose}
                      onChange={(e) => setProfile(prev => ({...prev, purpose: e.target.value}))}
                      className="w-full bg-[#393e46]/50 border border-[#00adb5]/18 rounded-xl px-4 py-3 text-[#eeeeee] focus:outline-none focus:ring-2 focus:ring-[#00adb5] transition-all appearance-none"
                    >
                      <option value="" disabled>Select your purpose...</option>
                      <option value="Marketing Agency">Marketing Agency</option>
                      <option value="D2C Brand">D2C Brand</option>
                      <option value="E-commerce Founder">E-commerce Founder</option>
                      <option value="Sales/Lead Gen">Sales/Lead Gen</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <div>
                    {profileSuccess && <span className="text-sm text-[#00adb5]">Profile saved successfully!</span>}
                    {profileError && <span className="text-sm text-[#ffdcdc]">{profileError}</span>}
                  </div>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="btn-primary py-2.5 px-6 rounded-xl font-bold text-sm flex items-center gap-2"
                  >
                    {savingProfile ? <Loader2 className="animate-spin w-4 h-4" /> : "Save Changes"}
                  </button>
                </div>
              </form>
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
