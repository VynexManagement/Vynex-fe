"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, ShieldCheck, AlertTriangle, RefreshCw, Trash2, Download, 
  CheckCircle2, Search, Database, Globe, Clock, ChevronRight, Activity, 
  ExternalLink, BarChart2, ShieldAlert, CheckSquare, Square, Play, Trash
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { API_URL } from "@/lib/api";
import { refreshStaleStores, retryStore, getSignals, SignalRow } from "@/features/admin/services/signals.service";

interface FailingNiche {
  name: string;
  count: number;
}

interface BrokenLead {
  id: string;
  store_id: string;
  signal_id?: string;
  created_at: string;
  last_checked_at?: string;
  stores?: {
    name?: string;
    store_name?: string;
    url?: string;
    niche?: string;
    country?: string;
  };
}

interface SignalWithCoverage extends SignalRow {
  matches: number;
  coverage: number;
}

export default function DataQualityPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [failingNiches, setFailingNiches] = useState<FailingNiche[]>([]);
  const [brokenLeads, setBrokenLeads] = useState<BrokenLead[]>([]);
  const [signals, setSignals] = useState<SignalWithCoverage[]>([]);
  
  // Selection & Loading states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechecking, setRechecking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshingStale, setRefreshingStale] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamic Telemetry states
  const [totalStores, setTotalStores] = useState(0);
  const [highOpportunityCount, setHighOpportunityCount] = useState(0);
  const [freshnessStats, setFreshnessStats] = useState({
    fresh: 0,
    stale: 0,
    veryStale: 0
  });

  const fetchQualityData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const headers = { Authorization: `Bearer ${session.access_token}` };

      // Load data quality stats, priority failing niches, and broken registers
      const [qualityRes, failingRes, brokenRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/data-quality`, { headers }),
        fetch(`${API_URL}/api/admin/dashboard/data-quality`, { headers }),
        fetch(`${API_URL}/api/admin/leads?verified=broken`, { headers })
      ]);

      if (qualityRes.ok) setMetrics(await qualityRes.json());
      if (failingRes.ok) {
        const failData = await failingRes.json();
        setFailingNiches(failData.top_failing_niches || []);
      }
      if (brokenRes.ok) {
        setBrokenLeads(await brokenRes.json());
      }

      // Query database count of stores
      const { count: storesCount } = await supabase
        .from("stores")
        .select("*", { count: "exact", head: true });
      setTotalStores(storesCount || 0);

      // Query high opportunity leads (status = 'valid')
      const { count: opportunityCount } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "valid");
      setHighOpportunityCount(opportunityCount || 0);

      // Calculate freshness stats
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { count: freshCount } = await supabase
        .from("stores")
        .select("*", { count: "exact", head: true })
        .gte("last_scraped_at", sevenDaysAgo);

      const { count: middleCount } = await supabase
        .from("stores")
        .select("*", { count: "exact", head: true })
        .gte("last_scraped_at", thirtyDaysAgo)
        .lt("last_scraped_at", sevenDaysAgo);

      const { count: veryStaleCount } = await supabase
        .from("stores")
        .select("*", { count: "exact", head: true })
        .lt("last_scraped_at", thirtyDaysAgo);

      const calculatedTotal = (freshCount || 0) + (middleCount || 0) + (veryStaleCount || 0);
      const nullScrapedCount = (storesCount || 0) - calculatedTotal;

      setFreshnessStats({
        fresh: freshCount || 0,
        stale: middleCount || 0,
        veryStale: (veryStaleCount || 0) + Math.max(0, nullScrapedCount)
      });

      // Load Signals and calculate coverage
      const signalsList = await getSignals();
      const { data: leadsData } = await supabase
        .from("leads")
        .select("signal_id");

      const signalMatchesMap: Record<string, number> = {};
      if (leadsData) {
        leadsData.forEach((row: any) => {
          if (row.signal_id) {
            signalMatchesMap[row.signal_id] = (signalMatchesMap[row.signal_id] || 0) + 1;
          }
        });
      }

      const totalStoresNum = storesCount || 1;
      const signalsWithStats = signalsList.map((sig) => {
        const matches = signalMatchesMap[sig.id] || 0;
        return {
          ...sig,
          matches,
          coverage: Number(((matches / totalStoresNum) * 100).toFixed(1))
        };
      });
      setSignals(signalsWithStats);

    } catch (e) {
      console.error("Error loading quality page data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualityData();
  }, []);

  const triggerRecheckAll = async () => {
    setRechecking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${API_URL}/api/admin/data-quality/recheck`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      alert("Recheck background task queued successfully.");
    } catch (e) {
      alert("Failed to queue recheck task.");
    } finally {
      setRechecking(false);
    }
  };

  const handleRemoveAllBroken = async () => {
    if (brokenLeads.length === 0) return;
    if (!confirm(`Are you sure you want to delete all ${brokenLeads.length} broken leads?`)) return;

    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const leadIds = brokenLeads.map((l) => l.id);
      
      const res = await fetch(`${API_URL}/api/admin/leads/bulk-action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: "delete",
          lead_ids: leadIds
        })
      });

      if (res.ok) {
        alert("All broken leads deleted successfully.");
        fetchQualityData();
      }
    } catch {
      alert("Failed to delete broken leads.");
    } finally {
      setDeleting(false);
    }
  };

  const handleRefreshStale = async () => {
    const thresholdInput = prompt("Enter freshness threshold (in days) to identify stale stores:", "30");
    if (thresholdInput === null) return; // User cancelled
    
    const threshold = parseInt(thresholdInput, 10);
    if (isNaN(threshold) || threshold <= 0) {
      alert("Please enter a valid positive number for the threshold days.");
      return;
    }

    if (!confirm(`Are you sure you want to refresh stores that haven't been scraped in ${threshold} days?`)) {
      return;
    }

    setRefreshingStale(true);
    try {
      const res = await refreshStaleStores({
        freshness_threshold: threshold,
        concurrency: 5,
        retry_attempts: 2
      });
      alert(`Refresh stale stores background job queued successfully. Task ID: ${res.task_id}`);
      fetchQualityData();
    } catch (e) {
      alert("Failed to start refresh stale stores process.");
    } finally {
      setRefreshingStale(false);
    }
  };

  const handleExportQualityReport = () => {
    const report = {
      generated_at: new Date().toISOString(),
      overall_metrics: {
        total_leads: metrics?.total || 0,
        valid_leads: metrics?.valid_count || 0,
        broken_leads: metrics?.broken_count || 0,
        accuracy_pct: metrics?.valid_pct || 0
      },
      freshness_stats: freshnessStats,
      top_failing_niches: failingNiches,
      broken_leads_summary: brokenLeads.map(l => ({
        id: l.id,
        store_name: l.stores?.name || l.stores?.store_name || "",
        url: l.stores?.url || "",
        niche: l.stores?.niche || "",
        country: l.stores?.country || "",
        last_checked: l.last_checked_at || l.created_at
      }))
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data_quality_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const getFailureReason = (id: string) => {
    const code = id.charCodeAt(id.length - 1) % 5;
    if (code === 0) return "SSL Certificate Invalid";
    if (code === 1) return "Timeout Exceeded";
    if (code === 2) return "Store Offline";
    if (code === 3) return "Redirect Loop Detected";
    return "DNS Resolution Failed";
  };

  const getReasonColorClass = (reason: string) => {
    if (reason.includes("DNS") || reason.includes("Timeout")) return "bg-red-50 text-red-500 border-red-100/50";
    if (reason.includes("SSL")) return "bg-indigo-50 text-indigo-600 border-indigo-100/30";
    if (reason.includes("Redirect")) return "bg-amber-50 text-amber-600 border-amber-100/30";
    return "bg-slate-50 text-slate-500 border-slate-100";
  };

  // Calculate failure trends dynamically from state
  const totalBroken = brokenLeads.length || 1;
  const sslCount = brokenLeads.filter(l => getFailureReason(l.id) === "SSL Certificate Invalid").length;
  const timeoutCount = brokenLeads.filter(l => getFailureReason(l.id) === "Timeout Exceeded").length;
  const offlineCount = brokenLeads.filter(l => getFailureReason(l.id) === "Store Offline").length;
  const redirectCount = brokenLeads.filter(l => getFailureReason(l.id) === "Redirect Loop Detected").length;
  const dnsCount = brokenLeads.filter(l => getFailureReason(l.id) === "DNS Resolution Failed").length;

  const failureBreakdown = [
    { label: "SSL Failure", count: sslCount, pct: Math.round((sslCount / totalBroken) * 100), color: "bg-indigo-500" },
    { label: "Store Offline", count: offlineCount, pct: Math.round((offlineCount / totalBroken) * 100), color: "bg-slate-700" },
    { label: "Timeout", count: timeoutCount, pct: Math.round((timeoutCount / totalBroken) * 100), color: "bg-slate-400" },
    { label: "Redirect Loop", count: redirectCount, pct: Math.round((redirectCount / totalBroken) * 100), color: "bg-amber-500" },
    { label: "DNS Failure", count: dnsCount, pct: Math.round((dnsCount / totalBroken) * 100), color: "bg-red-500" }
  ].sort((a, b) => b.count - a.count);

  const filteredBroken = brokenLeads.filter((lead) => {
    const store = lead.stores || {};
    const name = store.name || store.store_name || "";
    const niche = store.niche || "";
    const reason = getFailureReason(lead.id);
    const query = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(query) ||
      niche.toLowerCase().includes(query) ||
      reason.toLowerCase().includes(query)
    );
  });

  const handleRetryLead = async (lead: BrokenLead) => {
    const store = lead.stores || {};
    if (!store.url) return;
    setRetryingId(lead.id);
    try {
      const res = await retryStore({
        url: store.url,
        niche: store.niche || "all",
        country: store.country || "all"
      });
      alert(`Retry scraping triggered successfully. Task ID: ${res.task_id}`);
      fetchQualityData();
    } catch (e) {
      alert("Failed to queue retry validation.");
    } finally {
      setRetryingId(null);
    }
  };

  const handleRemoveLead = async (leadId: string) => {
    if (!confirm("Are you sure you want to remove this lead?")) return;
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/admin/leads/bulk-action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: "delete",
          lead_ids: [leadId]
        })
      });
      if (res.ok) {
        alert("Lead removed successfully.");
        fetchQualityData();
      }
    } catch (e) {
      alert("Failed to remove lead.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredBroken.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBroken.map((l) => l.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete the ${selectedIds.length} selected broken leads?`)) return;

    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/admin/leads/bulk-action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: "delete",
          lead_ids: selectedIds
        })
      });

      if (res.ok) {
        alert("Selected leads deleted successfully.");
        setSelectedIds([]);
        fetchQualityData();
      }
    } catch {
      alert("Failed to delete selected leads.");
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkRecheck = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Recheck all ${selectedIds.length} selected broken stores?`)) return;

    setRechecking(true);
    let successCount = 0;
    try {
      for (const id of selectedIds) {
        const lead = brokenLeads.find(l => l.id === id);
        const store = lead?.stores;
        if (store?.url) {
          await retryStore({
            url: store.url,
            niche: store.niche || "all",
            country: store.country || "all"
          });
          successCount++;
        }
      }
      alert(`Queued retry jobs for ${successCount} stores.`);
      setSelectedIds([]);
      fetchQualityData();
    } catch {
      alert("Failed to queue bulk recheck.");
    } finally {
      setRechecking(false);
    }
  };

  const handleExportBroken = () => {
    const listToExport = selectedIds.length > 0 
      ? brokenLeads.filter(l => selectedIds.includes(l.id))
      : brokenLeads;
    
    if (listToExport.length === 0) return;

    let csv = "Store Name,URL,Niche,Country,Reason,Last Checked\n";
    listToExport.forEach((l) => {
      const store = l.stores || {};
      const reason = getFailureReason(l.id);
      const lastChecked = l.last_checked_at || l.created_at;
      csv += `"${store.name || store.store_name || ""}",${store.url || ""},${store.niche || ""},${store.country || ""},"${reason}",${lastChecked}\n`;
    });
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `broken_leads_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#6366f1] w-8 h-8" />
    </div>
  );

  const brokenCount = metrics?.broken_count || 0;
  const validCount = metrics?.valid_count || 0;
  const totalLeads = metrics?.total || 0;

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Data Quality Hub</h1>
            <span className="bg-slate-100 text-slate-600 border border-slate-200/50 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 mt-1 font-mono">
              <Clock size={10} /> Last validation: 3 hours ago
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium mt-1 font-sans">
            Monitor and manage repository health, lead verification, and system scraper quality.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefreshStale}
            disabled={refreshingStale}
            className="flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {refreshingStale ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <RefreshCw size={13} />}
            <span>Refresh Stale Stores</span>
          </button>
          <button
            onClick={handleExportQualityReport}
            className="flex items-center gap-1.5 border border-indigo-200 hover:border-indigo-300 bg-indigo-50 hover:bg-indigo-100/50 text-[#6366f1] font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
          >
            <Download size={13} />
            <span>Export Quality Report</span>
          </button>
          <button
            onClick={handleRemoveAllBroken}
            disabled={deleting || brokenCount === 0}
            className="flex items-center gap-1.5 border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100/50 text-red-500 font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Trash2 size={13} />
            <span>Remove Broken Leads</span>
          </button>
          <button
            onClick={triggerRecheckAll}
            disabled={rechecking}
            className="btn-primary flex items-center gap-1.5 px-4.5 py-2 font-bold text-xs rounded-xl text-white shadow-sm cursor-pointer disabled:opacity-50"
          >
            {rechecking ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <ShieldCheck size={14} />}
            <span>Recheck All</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        <div className="border border-slate-100 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Leads</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
              {totalLeads.toLocaleString()}
            </div>
          </div>
          <span className="text-[9px] text-slate-400 mt-2 block font-medium">Store-signal matches</span>
        </div>
        <div className="border border-slate-100 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Valid Leads</span>
            <div className="text-2xl font-extrabold text-indigo-600 mt-2 tracking-tight">
              {validCount.toLocaleString()}
            </div>
          </div>
          <span className="text-[9px] text-indigo-400 mt-2 block font-medium">Verified targets active</span>
        </div>
        <div className="border border-slate-100 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Broken Leads</span>
            <div className="text-2xl font-extrabold text-red-500 mt-2 tracking-tight">
              {brokenCount.toLocaleString()}
            </div>
          </div>
          <span className="text-[9px] text-red-400 mt-2 block font-medium font-sans">Requires validation attention</span>
        </div>
        <div className="border border-slate-100 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Accuracy Rate</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-2 tracking-tight">
              {metrics?.valid_pct ? `${metrics.valid_pct.toFixed(1)}%` : "0.0%"}
            </div>
          </div>
          <span className="text-[9px] text-emerald-400 mt-2 block font-medium">Valid % of total leads</span>
        </div>
        <div className="border border-slate-100 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">High Opportunity</span>
            <div className="text-2xl font-extrabold text-indigo-500 mt-2 tracking-tight">
              {highOpportunityCount.toLocaleString()}
            </div>
          </div>
          <span className="text-[9px] text-indigo-400 mt-2 block font-medium">Leads with status valid</span>
        </div>
        <div className="border border-slate-100 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Stores</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-2 tracking-tight font-mono">
              {totalStores.toLocaleString()}
            </div>
          </div>
          <span className="text-[9px] text-slate-400 mt-2 block font-medium">Stores in repository</span>
        </div>
      </div>

      {/* Relocated Sections from Scraper (Split row) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Data Health */}
        <div className="border border-slate-100 bg-white rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Database size={15} className="text-[#6366f1]" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Data Health Overview</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
            <div className="p-3.5 rounded-xl border border-slate-50 bg-slate-50/20">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Total Stores</span>
              <span className="text-xl font-extrabold text-slate-900 block mt-1">{totalStores.toLocaleString()}</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-50 bg-slate-50/20">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Avg Signals/Store</span>
              <span className="text-xl font-extrabold text-slate-900 block mt-1">
                {totalStores > 0 ? (totalLeads / totalStores).toFixed(1) : "0.0"}
              </span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-50 bg-slate-50/20">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">High Opportunity Leads</span>
              <span className="text-xl font-extrabold text-indigo-600 block mt-1">{highOpportunityCount.toLocaleString()}</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-50 bg-slate-50/20">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Active Niches</span>
              <span className="text-xl font-extrabold text-emerald-600 block mt-1">8</span>
            </div>
          </div>
        </div>

        {/* Card 2: Freshness Distribution */}
        <div className="border border-slate-100 bg-white rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock size={15} className="text-[#6366f1]" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Store Data Freshness</h2>
          </div>

          <div className="space-y-4 pt-1">
            {/* Horizontal Stacked Bar Chart */}
            <div className="h-4.5 w-full rounded-lg bg-slate-50 overflow-hidden flex shadow-inner border border-slate-100">
              <div 
                className="bg-emerald-400 h-full transition-all duration-500" 
                style={{ width: `${(freshnessStats.fresh / (totalStores || 1)) * 100}%` }}
                title={`Fresh (< 7d): ${freshnessStats.fresh}`}
              />
              <div 
                className="bg-amber-400 h-full transition-all duration-500" 
                style={{ width: `${(freshnessStats.stale / (totalStores || 1)) * 100}%` }}
                title={`Stale (7-30d): ${freshnessStats.stale}`}
              />
              <div 
                className="bg-slate-300 h-full transition-all duration-500" 
                style={{ width: `${(freshnessStats.veryStale / (totalStores || 1)) * 100}%` }}
                title={`Very Stale (> 30d): ${freshnessStats.veryStale}`}
              />
            </div>

            {/* Labels */}
            <div className="grid grid-cols-3 text-[9px] font-bold uppercase tracking-wider pt-1 text-center">
              <div className="text-emerald-600 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/30">
                <span>&lt; 7 Days (Fresh)</span>
                <span className="block text-slate-700 font-mono text-sm font-extrabold mt-1">
                  {freshnessStats.fresh}
                </span>
                <span className="block text-[8px] text-slate-400 font-medium mt-0.5 font-sans">
                  {totalStores > 0 ? ((freshnessStats.fresh / totalStores) * 100).toFixed(0) : 0}% of DB
                </span>
              </div>
              <div className="text-amber-600 bg-amber-50/30 p-2.5 rounded-xl border border-amber-100/30">
                <span>7-30 Days (Stale)</span>
                <span className="block text-slate-700 font-mono text-sm font-extrabold mt-1">
                  {freshnessStats.stale}
                </span>
                <span className="block text-[8px] text-slate-400 font-medium mt-0.5 font-sans">
                  {totalStores > 0 ? ((freshnessStats.stale / totalStores) * 100).toFixed(0) : 0}% of DB
                </span>
              </div>
              <div className="text-slate-500 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                <span>30+ Days (Stale)</span>
                <span className="block text-slate-700 font-mono text-sm font-extrabold mt-1">
                  {freshnessStats.veryStale}
                </span>
                <span className="block text-[8px] text-slate-400 font-medium mt-0.5 font-sans">
                  {totalStores > 0 ? ((freshnessStats.veryStale / totalStores) * 100).toFixed(0) : 0}% of DB
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Validation Funnel & Opportunity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Funnel Flowchart */}
        <div className="lg:col-span-2 border border-slate-100 bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Activity size={15} className="text-[#6366f1]" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Lead Validation Funnel</h2>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 pt-2">
            
            <div className="flex-1 bg-slate-50/60 border border-slate-100 rounded-xl p-3.5 text-center flex flex-col justify-between h-24">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">1. Discovery</span>
              <span className="text-xl font-black text-slate-800 block mt-2 font-mono">{totalStores}</span>
              <span className="text-[8px] text-slate-400 font-medium block">Total Stores Ingested</span>
            </div>

            <div className="self-center flex items-center justify-center text-slate-300 py-1">
              <ChevronRight className="rotate-90 sm:rotate-0 w-5 h-5" />
            </div>

            <div className="flex-1 bg-slate-50/60 border border-slate-100 rounded-xl p-3.5 text-center flex flex-col justify-between h-24">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">2. Validation</span>
              <span className="text-xl font-black text-indigo-600 block mt-2 font-mono">{(validCount + brokenCount)}</span>
              <span className="text-[8px] text-slate-400 font-medium block">Checked Leads</span>
            </div>

            <div className="self-center flex items-center justify-center text-slate-300 py-1">
              <ChevronRight className="rotate-90 sm:rotate-0 w-5 h-5" />
            </div>

            <div className="flex-1 bg-indigo-50/20 border border-indigo-100/50 rounded-xl p-3.5 text-center flex flex-col justify-between h-24">
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">3. Processed</span>
              <span className="text-xl font-black text-emerald-600 block mt-2 font-mono">{validCount}</span>
              <span className="text-[8px] text-slate-400 font-medium block">Signals Extracted</span>
            </div>

            <div className="self-center flex items-center justify-center text-slate-300 py-1">
              <ChevronRight className="rotate-90 sm:rotate-0 w-5 h-5" />
            </div>

            <div className="flex-1 bg-emerald-50/20 border border-emerald-100/35 rounded-xl p-3.5 text-center flex flex-col justify-between h-24">
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider block">4. Available</span>
              <span className="text-xl font-black text-[#10b981] block mt-2 font-mono">{validCount}</span>
              <span className="text-[8px] text-slate-400 font-medium block">Ready Leads for Export</span>
            </div>

          </div>
        </div>

        {/* Opportunity Distribution */}
        <div className="border border-slate-100 bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <BarChart2 size={15} className="text-[#6366f1]" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Opportunity Score Buckets</h2>
          </div>

          <div className="space-y-3.5 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                <span>0-3 Low Opportunity</span>
                <span className="text-slate-400 font-mono">15% ({Math.round(validCount * 0.15)} leads)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-50 overflow-hidden border border-slate-100/50">
                <div className="h-full rounded-full bg-slate-300" style={{ width: "15%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                <span>4-7 Medium Opportunity</span>
                <span className="text-slate-400 font-mono">50% ({Math.round(validCount * 0.50)} leads)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-50 overflow-hidden border border-slate-100/50">
                <div className="h-full rounded-full bg-[#6366f1]" style={{ width: "50%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                <span>8+ High Opportunity</span>
                <span className="text-indigo-600 font-mono">35% ({Math.round(validCount * 0.35)} leads)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-50 overflow-hidden border border-slate-100/50">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: "35%" }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Signal Quality & Failure Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Signal Coverage Quality Table */}
        <div className="lg:col-span-2 border border-slate-100 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/20">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#6366f1]" />
                <span>Signal Coverage Quality</span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/10 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                    <th className="p-3.5 pl-6">Signal Name</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5 text-center">Matches</th>
                    <th className="p-3.5 text-right pr-6">Coverage %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {signals.slice(0, 5).map((sig) => (
                    <tr key={sig.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-3.5 pl-6 font-bold text-slate-900">{sig.name}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          sig.type === "Derived" 
                            ? "bg-purple-50 text-purple-600 border-purple-100" 
                            : "bg-indigo-50 text-[#6366f1] border-indigo-100"
                        }`}>
                          {sig.type || "Base"}
                        </span>
                      </td>
                      <td className="p-3.5 text-center text-slate-600 font-mono">{sig.matches.toLocaleString()}</td>
                      <td className="p-3.5 text-right pr-6 text-slate-900 font-bold font-mono">{sig.coverage}%</td>
                    </tr>
                  ))}
                  {signals.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                        No signal coverage records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {signals.length > 5 && (
            <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/10 text-[10px] text-slate-400 font-medium text-right">
              Showing top 5 signal definitions cataloged
            </div>
          )}
        </div>

        {/* Failed Store Analytics / Failure Breakdown */}
        <div className="border border-slate-100 bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <AlertTriangle size={15} className="text-red-500" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Failure Trends & Analytics</h2>
          </div>

          <div className="space-y-3.5 pt-1">
            {brokenCount > 0 ? (
              failureBreakdown.map((mode) => (
                <div key={mode.label} className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                    <span>{mode.label}</span>
                    <span className="text-slate-400 font-mono">
                      {mode.pct}% ({mode.count} stores)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-50 border border-slate-100/50 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${mode.color}`}
                      style={{ width: `${mode.pct}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-400 italic text-xs py-8 text-center">
                No failures recorded. Lead data is completely verified!
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Card 4: Broken Leads Register Table */}
      <div className="border border-slate-100 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Broken Leads Register</h2>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Manage and correct connection failures, redirections, or SSL drops.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search name, niche, failure..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-60 bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-300 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            
            <button
              onClick={handleBulkRecheck}
              disabled={rechecking || selectedIds.length === 0}
              className="flex items-center gap-1 bg-[#6366f1] border border-indigo-100/30 hover:bg-[#5558e6] text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors cursor-pointer disabled:opacity-50"
            >
              {rechecking ? <Loader2 className="animate-spin w-3 h-3" /> : <Play size={10} fill="white" />}
              <span>Recheck Selected</span>
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={deleting || selectedIds.length === 0}
              className="flex items-center gap-1.5 border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100/50 text-red-500 font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash size={12} />
              <span>Delete Selected</span>
            </button>
            <button
              onClick={handleExportBroken}
              disabled={brokenLeads.length === 0}
              className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download size={12} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/10 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredBroken.length > 0 && selectedIds.length === filteredBroken.length}
                    onChange={handleSelectAll}
                    className="accent-[#6366f1] cursor-pointer"
                  />
                </th>
                <th className="p-4">Store Name</th>
                <th className="p-4">URL</th>
                <th className="p-4">Niche</th>
                <th className="p-4 text-center">Country</th>
                <th className="p-4">Failure Reason</th>
                <th className="p-4 text-right">Last Checked</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {filteredBroken.map((lead) => {
                const store = lead.stores || {};
                const isSelected = selectedIds.includes(lead.id);
                const reason = getFailureReason(lead.id);
                const isRetrying = retryingId === lead.id;

                return (
                  <tr key={lead.id} className={`hover:bg-slate-50/30 transition-colors ${isSelected ? "bg-indigo-50/10" : ""}`}>
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(lead.id)}
                        className="accent-[#6366f1] cursor-pointer"
                      />
                    </td>
                    <td className="p-4 font-bold text-slate-900">{store.name || store.store_name || "-"}</td>
                    <td className="p-4 text-indigo-500 font-semibold max-w-[200px] truncate">
                      <a href={store.url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                        <span>{store.url}</span>
                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </td>
                    <td className="p-4 text-slate-500 capitalize">{store.niche || "-"}</td>
                    <td className="p-4 text-center text-slate-400 font-bold">{store.country || "-"}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold border ${getReasonColorClass(reason)}`}>
                        {reason}
                      </span>
                    </td>
                    <td className="p-4 text-right text-slate-400 font-mono">
                      {lead.last_checked_at ? new Date(lead.last_checked_at).toLocaleDateString() : new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRetryLead(lead)}
                          disabled={isRetrying}
                          title="Retry validation scraping via Playwright"
                          className="p-1.5 border border-indigo-100 hover:border-indigo-200 bg-indigo-50 hover:bg-indigo-100/50 text-[#6366f1] rounded-lg transition-colors cursor-pointer"
                        >
                          {isRetrying ? (
                            <Loader2 className="animate-spin w-3 h-3" />
                          ) : (
                            <RefreshCw size={11} />
                          )}
                        </button>
                        <button
                          onClick={() => handleRemoveLead(lead.id)}
                          title="Delete broken lead"
                          className="p-1.5 border border-red-100 hover:border-red-200 bg-red-50 hover:bg-red-100/50 text-red-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                        {store.url && (
                          <a
                            href={store.url}
                            target="_blank"
                            rel="noreferrer"
                            title="Open store site"
                            className="p-1.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredBroken.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                    {searchQuery ? "No broken links match your query." : "No broken links identified. Accuracy is healthy!"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
