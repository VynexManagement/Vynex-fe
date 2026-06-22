"use client";

import { useEffect, useState, useRef } from "react";
import { NICHES, COUNTRIES } from "@/lib/config";
import { API_URL, fetchSignals } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { refreshStaleStores, retryStore } from "@/features/admin/services/signals.service";
import { 
  Play, Loader2, Copy, Trash2, ShieldAlert, Sliders, CheckCircle2, XCircle, 
  RefreshCw, Terminal, Info, Settings, X, Search, Download, 
  AlertCircle, Activity, ChevronRight, Clock, AlertOctagon
} from "lucide-react";

interface SignalOption {
  id: string;
  name: string;
  slug?: string;
  type?: string;
  category?: string;
}

export default function ScraperControl() {
  const [niche, setNiche] = useState("all");
  const [country, setCountry] = useState("USA");
  const [limit, setLimit] = useState(200);

  const [signals, setSignals] = useState<SignalOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Run Scraper settings (drawer state - persisted in localStorage)
  const [settings, setSettings] = useState({
    freshnessThreshold: 30,
    maxConcurrency: 5,
    retryAttempts: 2,
    searchProvider: "Google"
  });

  // UI state controls
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [isAbortModalOpen, setIsAbortModalOpen] = useState(false);

  // Live Stats from Database
  const [dbStats, setDbStats] = useState({
    storesScraped: 0,
    newStores: 0,
    updatedStores: 0,
    validLeads: 0,
    brokenLeads: 0,
    activeSignalsCount: 0,
    lastSuccessfulRun: "Never"
  });

  const [recentDatasets, setRecentDatasets] = useState<any[]>([]);
  const [signalSummary, setSignalSummary] = useState<any[]>([]);

  // Logs & Diagnostics state
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("idle");
  const [summary, setSummary] = useState<any>(null);
  const [categorizedLogs, setCategorizedLogs] = useState<any>(null);
  const [logTab, setLogTab] = useState<"all" | "discovery" | "scraper" | "http" | "errors">("all");
  
  // Terminal view controls
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // SerpApi DB quota state
  const [quotaLimit, setQuotaLimit] = useState(250);
  const [quotaConsumed, setQuotaConsumed] = useState(0);

  // Job Duration state
  const [jobStartTime, setJobStartTime] = useState<number | null>(null);
  const [jobDuration, setJobDuration] = useState<string>("0s");

  // Job History state
  const [history, setHistory] = useState<any[]>([]);

  // Failed Stores list state
  const [failedStores, setFailedStores] = useState<{ url: string; error: string; stage: string; time: string }[]>([]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Load Session and LocalStorage settings
  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setToken(data.session?.access_token || null);
    };
    loadSession();

    const savedSettings = localStorage.getItem("scraper_settings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to load scraper settings", e);
      }
    }
  }, []);

  // Helper to format ISO string relative time
  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000));
      const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "Unknown";
    }
  };

  // Fetch metrics and stats
  const fetchDbMetrics = async (authToken: string) => {
    try {
      const headers = { Authorization: `Bearer ${authToken}` };
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [metricsRes, sigsRes, inventoryRes, newStoresRes, updatedStoresRes, latestRunRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/dashboard/metrics`, { headers }),
        fetch(`${API_URL}/api/admin/signals`, { headers }),
        fetch(`${API_URL}/api/admin/dashboard/inventory`, { headers }),
        supabase.from("stores").select("*", { count: "exact", head: true }).gte("created_at", oneDayAgo),
        supabase.from("stores").select("*", { count: "exact", head: true }).gte("last_scraped_at", oneDayAgo),
        supabase.from("stores").select("last_scraped_at").not("last_scraped_at", "is", null).order("last_scraped_at", { ascending: false }).limit(1)
      ]);

      let newStoresCount = 0;
      let updatedStoresCount = 0;
      let lastRunStr = "Never";

      if (newStoresRes.count !== null) newStoresCount = newStoresRes.count;
      if (updatedStoresRes.count !== null) updatedStoresCount = updatedStoresRes.count;
      if (latestRunRes.data && latestRunRes.data.length > 0 && latestRunRes.data[0].last_scraped_at) {
        lastRunStr = getRelativeTime(latestRunRes.data[0].last_scraped_at);
      }

      if (metricsRes.ok) {
        const metrics = await metricsRes.json();
        setDbStats(prev => ({
          ...prev,
          storesScraped: metrics.total_stores || 0,
          newStores: newStoresCount,
          updatedStores: updatedStoresCount,
          lastSuccessfulRun: lastRunStr,
          validLeads: metrics.valid_leads || 0,
          brokenLeads: Math.round((metrics.broken_leads_pct / 100) * metrics.valid_leads) || 0
        }));
      }

      if (sigsRes.ok) {
        const sigs = await sigsRes.json();
        setSignals(sigs);
        setDbStats(prev => ({
          ...prev,
          activeSignalsCount: sigs.filter((s: any) => s.is_active || s.active).length || 0
        }));
      }

      if (inventoryRes.ok) {
        const inv = await inventoryRes.json();
        setSignalSummary(inv.leads_by_signal || []);
      }

      // Query Recent Datasets
      const { data: dsData } = await supabase
        .from("datasets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (dsData) {
        setRecentDatasets(dsData);
      }

    } catch (err) {
      console.error("Failed to load db metrics for scraper", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDbMetrics(token);
      fetchQuota(token);
      fetchHistory(token);
    }
  }, [token]);

  // Load signals
  useEffect(() => {
    const loadSignals = async () => {
      try {
        const data = await fetchSignals();
        setSignals(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadSignals();
  }, []);

  // Fetch SerpApi DB quota
  const fetchQuota = async (authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/scraper/quota`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setQuotaLimit(data.limit || 250);
        setQuotaConsumed(data.consumed || 2);
      }
    } catch (err) {
      console.error("Quota fetch error", err);
    }
  };

  // Fetch scraper job history
  const fetchHistory = async (authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/scraper/history`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((run: any) => ({
          id: run.task_id,
          niche: run.niche,
          country: run.country,
          startedAt: run.started_at ? new Date(run.started_at).toLocaleString() : "Unknown",
          duration: run.duration || "N/A",
          stores: run.scraped_stores || 0,
          signals: run.leads_count || 0,
          status: run.status,
          discovered_urls: run.discovered_urls || 0,
          scraped_stores: run.scraped_stores || 0,
          skipped_stores: run.skipped_stores || 0,
          failed_stores: run.failed_stores || 0,
          signals_count: run.signals_count || 0,
          leads_count: run.leads_count || 0,
          db_failures: run.db_failures || 0,
        }));
        setHistory(mapped);

        // Initial Metrics Population:
        // Set summary state from latest run to populate summary widgets
        if (mapped.length > 0) {
          const latestRun = mapped[0];
          setSummary({
            discovered_urls: latestRun.discovered_urls,
            validation_domains: latestRun.discovered_urls,
            shopify_stores: latestRun.scraped_stores,
            scraped_stores: latestRun.scraped_stores,
            skipped_stores: latestRun.skipped_stores,
            failed_stores: latestRun.failed_stores,
            signals_count: latestRun.signals_count,
            saved_leads: latestRun.leads_count,
            db_failures: latestRun.db_failures,
            stage: "Completed",
            current_store: "None",
          });
          setJobDuration(latestRun.duration || "N/A");
        }
      }
    } catch (err) {
      console.error("History fetch error", err);
    }
  };

  // Poll logs and metrics when running
  useEffect(() => {
    if (!taskId || !token) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/scraper/logs/${taskId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        // If streaming paused, ignore logs update (keeps console static for reading)
        if (!isPaused) {
          setLogs(data.logs || []);
          setSummary(data.summary || null);
          setCategorizedLogs(data.categorized_logs || null);
        }
        
        setStatus(data.status);

        // Fetch latest quota usage to update live progress bar
        fetchQuota(token);

        if (data.status !== "running" && data.status !== "starting") {
          clearInterval(interval);
          // Refresh global counters & history from DB
          fetchDbMetrics(token);
          fetchHistory(token);
        }
      } catch (err) {
        console.error("Log fetch error", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [taskId, token, isPaused]);

  // Scroll to bottom of terminal
  useEffect(() => {
    if (autoScroll) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, logTab, autoScroll]);

  // Track job execution duration in real-time
  useEffect(() => {
    let timer: any;
    if (status === "running" || status === "starting") {
      if (!jobStartTime) {
        setJobStartTime(Date.now());
      }
      timer = setInterval(() => {
        const start = jobStartTime || Date.now();
        const diffMs = Date.now() - start;
        const diffSecs = Math.floor(diffMs / 1000);
        const mins = Math.floor(diffSecs / 60);
        const secs = diffSecs % 60;
        setJobDuration(mins > 0 ? `${mins}m ${secs}s` : `${secs}s`);
      }, 1000);
    } else {
      setJobStartTime(null);
    }
    return () => clearInterval(timer);
  }, [status, jobStartTime]);

  // Parse logs dynamically to build failed stores list in real-time
  useEffect(() => {
    if (logs.length > 0) {
      const failures: typeof failedStores = [];
      logs.forEach(line => {
        const l = line.toLowerCase();
        if (l.includes("fetch failed") || l.includes("timeout") || l.includes("403") || l.includes("error")) {
          let url = "";
          let stage = "Store Scraping";
          if (l.includes("phase 1") || l.includes("discovery")) stage = "Discovery";
          if (l.includes("validation")) stage = "Validation";

          const words = line.split(" ");
          for (const w of words) {
            if ((w.includes(".") && w.length > 4) || w.includes("http")) {
              url = w.replace(/[()\[\]{}'":,;➔→]/g, "").trim();
              break;
            }
          }
          if (url && (url.startsWith("http") || url.includes("."))) {
            failures.push({
              url: url.replace("https://", "").replace("http://", "").split("/")[0],
              error: l.includes("timeout") ? "Timeout" : l.includes("403") ? "403 Forbidden" : "Fetch Failed",
              stage,
              time: "Just Now"
            });
          }
        }
      });

      const deduped: typeof failedStores = [];
      const seen = new Set();
      failures.forEach(f => {
        if (!seen.has(f.url)) {
          seen.add(f.url);
          deduped.push(f);
        }
      });
      if (deduped.length > 0) {
        setFailedStores(deduped);
      }
    }
  }, [logs]);

  // Run scraper job
  const handleRunScraper = async () => {
    if (!token) {
      alert("Not authenticated");
      return;
    }

    setLoading(true);
    setLogs([]);
    setSummary(null);
    setCategorizedLogs(null);
    setStatus("starting");
    setIsJobDetailsOpen(true); // Open live job drawer

    try {
      const payload = {
        niche,
        country,
        limit,
        all_signals: true,
        concurrency: settings.maxConcurrency,
        retry_attempts: settings.retryAttempts
      };

      const res = await fetch(`${API_URL}/api/admin/scraper/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to start scraper");
      setTaskId(data.task_id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to start scraper");
      setStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  // Refresh stale stores older than 30 days
  const handleRefreshStale = async () => {
    if (!token) return;
    setLoading(true);
    setLogs([]);
    setSummary(null);
    setCategorizedLogs(null);
    setStatus("starting");
    setIsJobDetailsOpen(true);

    try {
      const res = await refreshStaleStores({
        freshness_threshold: settings.freshnessThreshold,
        concurrency: settings.maxConcurrency,
        retry_attempts: settings.retryAttempts
      });
      setTaskId(res.task_id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to start stale refresh");
      setStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  // Retry scraping single store directly
  const handleRetryStore = async (url: string, storeNiche: string, storeCountry: string) => {
    if (!token) return;
    setStatus("starting");
    setIsJobDetailsOpen(true);

    try {
      const res = await retryStore({
        url,
        niche: storeNiche || "Unknown",
        country: storeCountry || "Unknown"
      });
      setTaskId(res.task_id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to queue store retry");
    }
  };

  // Abort execution
  const handleAbortScraper = async () => {
    if (!taskId || !token) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/scraper/abort/${taskId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to abort scraper");
      setStatus("aborted");
      setIsAbortModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to abort scraper");
    }
  };

  // Trigger Recalculate Signals
  const handleRecalculate = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/signals/recalculate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Signal recalculation job successfully queued!");
      } else {
        alert("Failed to queue recalculation.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter logs by active tab
  const getLogsToRender = () => {
    if (logTab === "all") return logs;
    if (!categorizedLogs) return [];
    if (logTab === "discovery") return categorizedLogs.discovery || [];
    if (logTab === "scraper") return categorizedLogs.scraper || [];
    if (logTab === "http") return categorizedLogs.http || [];
    if (logTab === "errors") return categorizedLogs.errors || [];
    return logs;
  };

  const logsToRender = getLogsToRender();

  // Filter logs by search query
  const filteredLogs = logsToRender.filter((line: string) => 
    line.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyLogs = () => {
    if (logs.length === 0) return;
    navigator.clipboard.writeText(logs.join("\n"));
    alert("Logs successfully copied to clipboard!");
  };

  const handleDownloadLogs = () => {
    if (logs.length === 0) return;
    const blob = new Blob([logs.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scraper_task_${taskId || "log"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    setLogs([]);
    setSummary(null);
    setCategorizedLogs(null);
    setTaskId(null);
    setStatus("idle");
    setIsJobDetailsOpen(false);
  };

  // Status Badge Mapper
  const STATUS_STYLES: Record<string, { label: string, color: string, text: string, animate: boolean }> = {
    idle: { label: "Idle", color: "bg-slate-50 border-slate-100 text-slate-500", text: "text-slate-400", animate: false },
    starting: { label: "Starting...", color: "bg-amber-50 border-amber-100 text-amber-600 animate-pulse", text: "text-amber-500 font-semibold", animate: true },
    running: { label: "Running", color: "bg-amber-50 border-amber-100 text-amber-600 animate-pulse", text: "text-amber-500 font-bold", animate: true },
    completed: { label: "Completed", color: "bg-emerald-50 border-emerald-100 text-emerald-600", text: "text-emerald-600 font-bold", animate: false },
    aborted: { label: "Aborted", color: "bg-red-50 border-red-100 text-red-500", text: "text-red-500", animate: false },
    failed: { label: "Failed", color: "bg-red-50 border-red-100 text-red-500", text: "text-red-500 font-bold", animate: false },
    unknown_or_completed: { label: "Idle", color: "bg-slate-50 border-slate-100 text-slate-600", text: "text-slate-500", animate: false }
  };

  const currentStatus = STATUS_STYLES[status] || STATUS_STYLES.idle;

  // Search API Status mapping based on Quota Usage
  const getSearchApiStatus = () => {
    const pct = (quotaConsumed / quotaLimit) * 100;
    if (pct >= 100) return { label: "Exhausted", color: "bg-red-50 border-red-100 text-red-600" };
    if (pct >= 95) return { label: "Critical", color: "bg-orange-50 border-orange-100 text-orange-600" };
    if (pct >= 80) return { label: "Warning", color: "bg-amber-50 border-amber-100 text-amber-600" };
    return { label: "Healthy", color: "bg-emerald-50 border-emerald-100 text-emerald-600" };
  };

  const searchApiStatus = getSearchApiStatus();

  // Pipeline metrics counters
  const resultsCount = summary?.discovered_urls || 0;
  const validationCount = summary?.validation_domains || 0;
  const shopifyCount = summary?.shopify_stores || 0;
  const scrapedCount = summary?.scraped_stores || 0;
  const savedCount = summary?.saved_leads || summary?.leads_count || 0;

  const getProgressPct = () => {
    if (status === "starting") return 10;
    if (summary?.stage === "Discovery" || !resultsCount) {
      return Math.min(Math.round((resultsCount / limit) * 100), 100);
    }
    const processed = (summary?.scraped_stores || 0) + (summary?.skipped_stores || 0) + (summary?.failed_stores || 0);
    if (!resultsCount) return 0;
    return Math.min(Math.round((processed / resultsCount) * 100), 100);
  };

  const getDaysUntilReset = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    let resetDate = new Date(currentYear, currentMonth, 30, 0, 0, 0);
    if (now >= resetDate) {
      resetDate = new Date(currentYear, currentMonth + 1, 30, 0, 0, 0);
    }
    const diffMs = resetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Resets today";
    if (diffDays === 1) return "Resets tomorrow";
    return `Reset in ${diffDays} days`;
  };

  // Parsed log failures for discovery card breakdown
  const queryCount = logs.filter(l => l.toLowerCase().includes("query") && (l.toLowerCase().includes("search") || l.toLowerCase().includes("execute"))).length;
  const nonShopifyCount = Math.max(0, validationCount - shopifyCount);
  const timeoutErrors = logs.filter(l => l.toLowerCase().includes("timeout")).length;
  const blockedErrors = logs.filter(l => l.toLowerCase().includes("403")).length;
  const dnsErrors = logs.filter(l => l.toLowerCase().includes("dns") || l.toLowerCase().includes("host")).length;

  // Helper to map signal name to type
  const getSignalTypeByName = (name: string) => {
    const sig = signals.find(s => s.name === name);
    return sig?.type || (name.includes("+") ? "Derived" : "Base");
  };

  // Render Display list for failed stores
  const displayFailedStores = failedStores;

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* ── HEADER ACTIONS ───────────────────────────────────────────────── */}
      <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Data Acquisition
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Configure, deploy, and monitor intelligence extraction engines across global targets.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Settings Drawer Trigger */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors shadow-sm cursor-pointer"
            title="Scraper Settings"
          >
            <Settings size={14} />
          </button>
          {/* Recalculate Signals */}
          <button 
            onClick={handleRecalculate}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold border border-slate-200 rounded-xl text-xs transition-colors cursor-pointer"
            title="Recalculate DB Signals"
          >
            Recalculate Signals
          </button>
          {/* Refresh Stale Stores */}
          <button 
            onClick={handleRefreshStale}
            disabled={status === "running" || status === "starting"}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold border border-indigo-100/50 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Re-scrape stale stores"
          >
            Refresh Stale Stores
          </button>
          {/* Run Scraper */}
          <button
            onClick={handleRunScraper}
            disabled={loading || status === "running" || status === "starting"}
            className="btn-primary py-2 px-5 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-45 text-white"
          >
            {loading ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <Play size={12} fill="white" />}
            <span>Run Scraper</span>
          </button>
          {/* Abort Button */}
          {(status === "running" || status === "starting") && (
            <button
              onClick={() => setIsAbortModalOpen(true)}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 font-bold border border-red-100/50 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Abort Job
            </button>
          )}
        </div>
      </div>

      {/* ── KPI METRICS CARDS ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
        <div className="border border-slate-100 bg-white rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stores Scraped</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {dbStats.storesScraped.toLocaleString()}
          </div>
          <span className="text-[9px] text-slate-400 mt-1 block">In latest operations</span>
        </div>
        <div className="border border-slate-100 bg-white rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">New Stores</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {dbStats.newStores.toLocaleString()}
          </div>
          <span className="text-[9px] text-slate-400 mt-1 block">Added to system DB</span>
        </div>
        <div className="border border-slate-100 bg-white rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Updated Stores</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {dbStats.updatedStores.toLocaleString()}
          </div>
          <span className="text-[9px] text-slate-400 mt-1 block">Refreshed data targets</span>
        </div>
        <div className="border border-slate-100 bg-white rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Signal Matches</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2 tracking-tight">
            {dbStats.validLeads.toLocaleString()}
          </div>
          <span className="text-[9px] text-slate-400 mt-1 block">Store-Signal relationships</span>
        </div>
        <div className="border border-slate-100 bg-white rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Signals</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2 tracking-tight">
            {dbStats.activeSignalsCount.toLocaleString()}
          </div>
          <span className="text-[9px] text-slate-400 mt-1 block">Signal catalog definitions</span>
        </div>
        <div className="border border-slate-100 bg-white rounded-2xl p-5 shadow-sm col-span-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last Successful Run</span>
          <div className="text-lg font-bold text-slate-700 mt-3 tracking-tight truncate">
            {dbStats.lastSuccessfulRun}
          </div>
          <span className="text-[9px] text-slate-400 mt-1 block">Duration since completed</span>
        </div>
      </div>

      {/* ── SPLIT LAYOUT ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Dataset Configuration (Form Card) */}
        <div className="lg:col-span-1 border border-slate-100 bg-white rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders size={15} className="text-[#6366f1]" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Dataset Configuration</h2>
            </div>

            <div className="space-y-4">
              {/* Niche */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Niche</label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  disabled={status === "running" || status === "starting"}
                  className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-300 transition-all cursor-pointer"
                >
                  {NICHES.map((n) => (
                    <option key={n.value} value={n.value}>{n.label}</option>
                  ))}
                </select>
              </div>

              {/* Country */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={status === "running" || status === "starting"}
                  className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-300 transition-all cursor-pointer"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Limit */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Lead Limit</label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  disabled={status === "running" || status === "starting"}
                  className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-300 transition-all"
                  placeholder="500"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50">
            <button
              onClick={handleRunScraper}
              disabled={loading || status === "running" || status === "starting"}
              className="w-full btn-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-white cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Play size={12} fill="white" />}
              <span>Start Extraction Pipeline</span>
            </button>
          </div>
        </div>

        {/* System Diagnostics Card */}
        <div className="lg:col-span-1 border border-slate-100 bg-white rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Activity size={15} className="text-[#6366f1]" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">System Diagnostics</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-slate-50 bg-slate-50/30 flex flex-col justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Engine Status</span>
              <span className={`inline-flex self-start px-2.5 py-0.5 rounded-full text-[10px] font-bold border mt-2 capitalize ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-50 bg-slate-50/30 flex flex-col justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Search API Status</span>
              <span className={`inline-flex self-start px-2.5 py-0.5 rounded-full text-[10px] font-bold border mt-2 ${searchApiStatus.color}`}>
                {searchApiStatus.label}
              </span>
            </div>
          </div>

          {/* Quota Progress */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-400 uppercase tracking-wider">Quota Usage (Daily Requests)</span>
              <span className="font-mono text-slate-700">{quotaConsumed} / {quotaLimit}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((quotaConsumed / quotaLimit) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between items-center">
              <span>{Math.round((quotaConsumed / quotaLimit) * 100)}% Consumed</span>
              <span>{getDaysUntilReset()}</span>
            </div>
          </div>

          {/* Last Error */}
          <div className="p-3.5 rounded-xl bg-red-50/40 border border-red-100 text-xs text-red-600 flex flex-col gap-1.5 mt-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-red-400 block">Last Failure Alert</span>
            <div className="font-medium">
              {status === "failed" ? "Scraper subprocess exited with code 1 due to connection failure." : "None recorded."}
            </div>
          </div>
        </div>

      </div>



      {/* ── BENTO LOWER ROW: HISTORY & DATASETS ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Datasets Card */}
        <div className="border border-slate-100 bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Recent Dataset Generation</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 font-medium">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wider font-bold text-[10px] border-b border-slate-50">
                  <th className="pb-2">Dataset Target</th>
                  <th className="pb-2 text-center">Leads Count</th>
                  <th className="pb-2 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentDatasets.map((ds, idx) => {
                  const signalName = signals.find((s) => s.id === ds.signal_id)?.name;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/10">
                      <td className="py-2.5 font-bold text-slate-800 capitalize">
                        {ds.niche} | {ds.country} {signalName ? `(${signalName})` : ""}
                      </td>
                      <td className="py-2.5 text-center font-bold font-mono text-indigo-600">
                        {ds.total_leads || 0}
                      </td>
                      <td className="py-2.5 text-right text-slate-400">
                        {new Date(ds.created_at).toLocaleDateString() || "Unknown"}
                      </td>
                    </tr>
                  );
                })}
                {recentDatasets.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-400 italic">
                      No datasets generated yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Historical Scraper Runs */}
        <div className="border border-slate-100 bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Scraper Job History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 font-medium">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wider font-bold text-[10px] border-b border-slate-50">
                  <th className="pb-2">Target</th>
                  <th className="pb-2">Duration</th>
                  <th className="pb-2 text-center">Stores</th>
                  <th className="pb-2 text-center">Signals</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map((run) => (
                  <tr key={run.id} className="hover:bg-slate-50/10">
                    <td className="py-2.5 font-bold text-slate-800 capitalize">{run.niche} | {run.country}</td>
                    <td className="py-2.5 text-slate-500 font-mono text-[10px]">{run.duration}</td>
                    <td className="py-2.5 text-center font-mono">{run.stores}</td>
                    <td className="py-2.5 text-center font-mono text-indigo-600 font-bold">{run.signals}</td>
                    <td className="py-2.5 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        run.status === "completed"
                          ? "bg-emerald-50 text-emerald-600"
                          : run.status === "running"
                          ? "bg-amber-50 text-amber-600 animate-pulse"
                          : run.status === "aborted"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-red-50 text-red-500"
                      }`}>
                        {run.status === "completed"
                          ? "DONE"
                          : run.status === "running"
                          ? "RUNNING"
                          : run.status === "aborted"
                          ? "ABORTED"
                          : "FAILED"}
                      </span>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                      No scraper job history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── GRID: RUN SUMMARY / DISCOVERY ANALYTICS & failed stores ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Run Summary (latest finished scraper run) */}
        <div className="lg:col-span-1 border border-slate-100 bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <Clock size={14} className="text-indigo-500" /> Run Summary (Latest Job)
          </h2>
          
          <div className="space-y-3 text-xs font-semibold text-slate-700">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-400">Search Results Found</span>
              <span className="font-mono text-slate-900">{resultsCount}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-400">Unique Domains</span>
              <span className="font-mono text-slate-900">{validationCount}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-400">Shopify Stores</span>
              <span className="font-mono text-indigo-600">{shopifyCount}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-400">Rejected Non-Shopify</span>
              <span className="font-mono text-slate-500">{nonShopifyCount}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-400">Stores Scraped Successfully</span>
              <span className="font-mono text-slate-900">{scrapedCount}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-400">Skipped Stores</span>
              <span className="font-mono text-slate-500">{summary?.skipped_stores || 0}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-400">Failed Stores</span>
              <span className="font-mono text-red-500">{summary?.failed_stores || 0}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-400">DB Write Failures</span>
              <span className="font-mono text-red-600 font-bold">{summary?.db_failures || 0}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-400">Signal Leads Generated</span>
              <span className="font-mono text-emerald-600 font-bold">{savedCount}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-400">Duration</span>
              <span className="font-mono text-slate-900">{jobDuration}</span>
            </div>
          </div>
        </div>

        {/* Discovery Analytics & Failures */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Discovery Analytics */}
          <div className="border border-slate-100 bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Discovery Quality Analytics</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="p-2 border border-slate-50 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Search Queries</span>
                <div className="text-base font-extrabold text-slate-800 mt-1">{queryCount}</div>
              </div>
              <div className="p-2 border border-slate-50 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Results</span>
                <div className="text-base font-extrabold text-slate-800 mt-1">{resultsCount}</div>
              </div>
              <div className="p-2 border border-slate-50 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Unique Domains</span>
                <div className="text-base font-extrabold text-slate-800 mt-1">{validationCount}</div>
              </div>
              <div className="p-2 border border-slate-50 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Shopify Stores</span>
                <div className="text-base font-extrabold text-indigo-600 mt-1">{shopifyCount}</div>
              </div>
              <div className="p-2 border border-slate-50 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Detection Rate</span>
                <div className="text-base font-extrabold text-emerald-600 mt-1">
                  {validationCount ? `${Math.round((shopifyCount / validationCount) * 100)}%` : "0%"}
                </div>
              </div>
            </div>

            {/* Failure reasons */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Top Discovery Failures Breakdown</span>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[9px] text-slate-400 block">Not Shopify</span>
                  <span className="text-sm font-extrabold text-slate-800 mt-0.5 block">{nonShopifyCount}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[9px] text-slate-400 block">Timeouts</span>
                  <span className="text-sm font-extrabold text-slate-800 mt-0.5 block">{timeoutErrors}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[9px] text-slate-400 block">403 Blocked</span>
                  <span className="text-sm font-extrabold text-slate-800 mt-0.5 block">{blockedErrors}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[9px] text-slate-400 block">DNS Failures</span>
                  <span className="text-sm font-extrabold text-slate-800 mt-0.5 block">{dnsErrors}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── BOTTOM ROW: FAILED STORES & SIGNAL GENERATION SUMMARY ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Failed Stores Table with direct retry */}
        <div className="border border-slate-100 bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <AlertCircle size={14} className="text-red-500" /> Failed Store Targets
            </h2>
            <span className="text-[10px] text-slate-400 font-semibold">Retry triggers targeted background run</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 font-medium">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wider font-bold text-[10px] border-b border-slate-50">
                  <th className="pb-2">Store Domain</th>
                  <th className="pb-2">Error</th>
                  <th className="pb-2">Stage</th>
                  <th className="pb-2">Attempt</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayFailedStores.map((fail, i) => (
                  <tr key={i} className="hover:bg-slate-50/10">
                    <td className="py-2.5 font-mono text-[11px] text-slate-800 truncate max-w-[130px]" title={fail.url}>
                      {fail.url}
                    </td>
                    <td className="py-2.5 text-red-500 font-semibold">{fail.error}</td>
                    <td className="py-2.5 text-slate-500">{fail.stage}</td>
                    <td className="py-2.5 text-slate-400">{fail.time}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleRetryStore(fail.url, niche, country)}
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100/50 rounded-md font-bold text-[9px] transition-colors cursor-pointer"
                        title="Retry target store scrape directly"
                      >
                        Retry Store
                      </button>
                    </td>
                  </tr>
                ))}
                {displayFailedStores.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                      No failed stores recorded in the current session.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signal Generation Summary */}
        <div className="border border-slate-100 bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Signal Generation Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 font-medium">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wider font-bold text-[10px] border-b border-slate-50">
                  <th className="pb-2">Signal Intent</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2 text-center">Matches</th>
                  <th className="pb-2 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {signalSummary.map((item, idx) => {
                  const type = getSignalTypeByName(item.name);
                  const total = signalSummary.reduce((acc, curr) => acc + curr.count, 0) || 1;
                  const pct = Math.round((item.count / total) * 100);
                  
                  return (
                    <tr key={idx} className="hover:bg-slate-50/10">
                      <td className="py-2.5 font-bold text-slate-800">{item.name}</td>
                      <td className="py-2.5 text-slate-500">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          type === "Derived" 
                            ? "bg-purple-50 text-purple-600 border-purple-100" 
                            : "bg-indigo-50 text-indigo-600 border-indigo-100"
                        }`}>
                          {type}
                        </span>
                      </td>
                      <td className="py-2.5 text-center font-mono">{item.count}</td>
                      <td className="py-2.5 text-right text-indigo-600 font-bold font-mono">{pct}%</td>
                    </tr>
                  );
                })}
                {signalSummary.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400 italic">
                      No signal matches recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── TERMINAL EXECUTION LOGS ─────────────────────────────────────── */}
      <div className="border border-slate-100 bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Terminal size={15} className="text-[#6366f1] shrink-0" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">System Execution Logs</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Search Input inside logs */}
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-lg px-2.5 py-1 text-[10px] font-semibold focus:outline-none focus:border-indigo-300 w-32 focus:w-44 transition-all"
              />
              <Search size={10} className="absolute right-2 text-slate-400" />
            </div>

            {/* Auto Scroll Toggle */}
            <button
              onClick={() => setAutoScroll(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                autoScroll ? "bg-indigo-50 border-indigo-100 text-[#6366f1]" : "bg-slate-50 border-transparent text-slate-400"
              }`}
              title="Auto scroll logs terminal"
            >
              Auto-Scroll
            </button>

            {/* Pause Streaming Toggle */}
            <button
              onClick={() => setIsPaused(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                isPaused ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-slate-50 border-transparent text-slate-400"
              }`}
              title="Pause streaming logs"
            >
              {isPaused ? "Paused" : "Live"}
            </button>

            {/* Copy Logs */}
            <button
              onClick={handleCopyLogs}
              disabled={logs.length === 0}
              className="flex items-center gap-1 bg-slate-50 border border-slate-100 hover:bg-slate-100/50 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <Copy size={11} />
              <span>Copy</span>
            </button>

            {/* Download Logs */}
            <button
              onClick={handleDownloadLogs}
              disabled={logs.length === 0}
              className="flex items-center gap-1 bg-slate-50 border border-slate-100 hover:bg-slate-100/50 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download size={11} />
              <span>Download</span>
            </button>

            {status !== "running" && status !== "starting" && taskId && (
              <button
                onClick={handleClearLogs}
                className="flex items-center gap-1 border border-red-100 hover:bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                <Trash2 size={11} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tab bar */}
        <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-none">
          {[
            { id: "all", label: "All Logs" },
            { id: "discovery", label: "Discovery" },
            { id: "scraper", label: "Scrapers" },
            { id: "http", label: "HTTP Requests" },
            { id: "errors", label: "Errors" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setLogTab(t.id as any)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all shrink-0 cursor-pointer ${
                logTab === t.id
                  ? "bg-[#6366f1] border-[#4f46e5] text-white"
                  : "bg-slate-50 border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Terminal Console Output */}
        <div className="h-64 overflow-y-auto text-[11px] font-mono text-slate-300 bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-1 relative">
          {filteredLogs.length === 0 ? (
            <p className="text-slate-500/60 italic py-2">No logging sequences matching criteria...</p>
          ) : (
            filteredLogs.map((line: string, i: number) => {
              const l = line.toLowerCase();
              let color = "text-slate-300";
              if (l.includes("error") || l.includes("fail") || l.includes("critical")) color = "text-red-400";
              if (l.includes("http request") && l.includes("200")) color = "text-emerald-400";
              if (l.includes("✓ match") || l.includes("match found")) color = "text-emerald-300 font-bold";
              if (l.includes("discovery query:") || l.includes("phase 1")) color = "text-indigo-400";

              return (
                <div key={i} className={`leading-relaxed break-all ${color}`}>
                  {line}
                </div>
              );
            })
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* ── SETTINGS DRAWER (Slide-over from right) ───────────────────────── */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setIsSettingsOpen(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          />
          {/* Drawer content */}
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-100 p-6 space-y-5 animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Settings size={15} className="text-[#6366f1]" /> Scraper Run Settings
              </h3>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-4 flex-1">
              {/* Freshness Threshold */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Freshness Threshold (Days)</label>
                <input
                  type="number"
                  value={settings.freshnessThreshold}
                  onChange={(e) => setSettings(prev => ({ ...prev, freshnessThreshold: Number(e.target.value) }))}
                  className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-300"
                />
                <span className="text-[9px] text-slate-400 leading-normal block">Stores scraped longer than X days ago are treated as stale.</span>
              </div>

              {/* Max Concurrency */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Max Concurrent Stores</label>
                <input
                  type="number"
                  value={settings.maxConcurrency}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxConcurrency: Number(e.target.value) }))}
                  className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-300"
                />
              </div>

              {/* Retry Attempts */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Retry Attempts</label>
                <input
                  type="number"
                  value={settings.retryAttempts}
                  onChange={(e) => setSettings(prev => ({ ...prev, retryAttempts: Number(e.target.value) }))}
                  className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-300"
                />
              </div>

              {/* Search Provider */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Search Provider</label>
                <select
                  value={settings.searchProvider}
                  onChange={(e) => setSettings(prev => ({ ...prev, searchProvider: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-300 cursor-pointer"
                >
                  <option value="Google">Google (via SerpApi)</option>
                  <option value="Bing" disabled>Bing (Phase-2)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  localStorage.setItem("scraper_settings", JSON.stringify(settings));
                  setIsSettingsOpen(false);
                }}
                className="flex-1 btn-primary py-2.5 font-bold text-xs text-white rounded-xl cursor-pointer text-center"
              >
                Save Settings
              </button>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="flex-1 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-xl cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RUNNING JOB DRAWER (Slide-over live console + pipeline) ────────── */}
      {isJobDetailsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setIsJobDetailsOpen(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          />
          {/* Drawer content */}
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-100 p-6 space-y-5 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5">
                <Loader2 className="animate-spin text-indigo-500 w-4 h-4" />
                <h3 className="text-sm font-bold text-slate-900">Scraper Live Job Telemetry</h3>
              </div>
              <button 
                onClick={() => setIsJobDetailsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              
              {/* Job Stage and Target Domain details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Current Target</span>
                  <div className="text-xs font-bold text-slate-800 mt-1 truncate" title={summary?.current_store || "None"}>
                    {summary?.current_store || "Resolving..."}
                  </div>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Job Status</span>
                  <div className={`text-xs font-bold mt-1 capitalize ${currentStatus.text}`}>
                    {currentStatus.label}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400 uppercase tracking-wider">Extract Pipeline Progress</span>
                  <span className="font-mono text-slate-700">
                    {getProgressPct()}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-100">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPct()}%` }}
                  />
                </div>
              </div>

              {/* Store Pipeline Metrics Flow Chart */}
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Store Pipeline Metrics</span>
                
                {/* Horizontal flow design */}
                <div className="flex items-center justify-between gap-1 text-center select-none">
                  {/* Discovery */}
                  <div className="flex-1 bg-white border border-slate-100 p-2.5 rounded-xl">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Discovery</span>
                    <span className="text-xs font-extrabold text-slate-800 block mt-1">{resultsCount} Results</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />

                  {/* Validation */}
                  <div className="flex-1 bg-white border border-slate-100 p-2.5 rounded-xl">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Validation</span>
                    <span className="text-xs font-extrabold text-slate-800 block mt-1">{validationCount} Domains</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />

                  {/* Shopify */}
                  <div className="flex-1 bg-white border border-slate-100 p-2.5 rounded-xl">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Shopify</span>
                    <span className="text-xs font-extrabold text-indigo-600 block mt-1">{shopifyCount} Stores</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />

                  {/* Scraped */}
                  <div className="flex-1 bg-white border border-slate-100 p-2.5 rounded-xl">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Scraped</span>
                    <span className="text-xs font-extrabold text-slate-800 block mt-1">{scrapedCount} Scraped</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />

                  {/* Saved */}
                  <div className="flex-1 bg-white border border-slate-100 p-2.5 rounded-xl shadow-sm ring-1 ring-emerald-500/20">
                    <span className="text-[9px] text-emerald-500 uppercase font-bold block">Saved</span>
                    <span className="text-xs font-extrabold text-emerald-600 block mt-1">{savedCount} Leads</span>
                  </div>
                </div>
              </div>

              {/* Scraper Live Streaming Terminal */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Streaming Logs</span>
                
                {/* Logs Terminal view */}
                <div className="h-56 overflow-y-auto text-[11px] font-mono text-slate-300 bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-1 relative">
                  {logs.length === 0 ? (
                    <p className="text-slate-500 italic py-2 animate-pulse">Establishing container link and launching headless runtime...</p>
                  ) : (
                    logs.map((line: string, i: number) => {
                      const l = line.toLowerCase();
                      let color = "text-slate-300";
                      if (l.includes("error") || l.includes("fail")) color = "text-red-400";
                      if (l.includes("http request") && l.includes("200")) color = "text-emerald-400";
                      if (l.includes("✓ match") || l.includes("match found")) color = "text-emerald-300 font-bold";
                      if (l.includes("discovery query:")) color = "text-indigo-300";

                      return (
                        <div key={i} className={`leading-relaxed break-all ${color}`}>{line}</div>
                      );
                    })
                  )}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={handleCopyLogs}
                disabled={logs.length === 0}
                className="flex-1 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700 py-2.5 font-bold text-xs rounded-xl cursor-pointer text-center disabled:opacity-50"
              >
                Copy Logs
              </button>
              {(status === "running" || status === "starting") ? (
                <button
                  onClick={() => setIsAbortModalOpen(true)}
                  className="flex-1 bg-red-50 border border-red-100 hover:bg-red-100 text-red-500 py-2.5 font-bold text-xs rounded-xl cursor-pointer text-center"
                >
                  Abort Job
                </button>
              ) : (
                <button
                  onClick={handleClearLogs}
                  className="flex-1 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 py-2.5 font-bold text-xs rounded-xl cursor-pointer text-center"
                >
                  Reset Controller
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ABORT CONFIRMATION MODAL ─────────────────────────────────────── */}
      {isAbortModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            onClick={() => setIsAbortModalOpen(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          {/* Modal body */}
          <div className="bg-white border border-slate-100 rounded-2xl max-w-sm w-full p-6 shadow-2xl z-10 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-red-500">
              <AlertOctagon size={20} />
              <h4 className="font-extrabold text-sm text-slate-900">Abort Scraper?</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Current progress will be saved but the job will stop immediately. This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-2 justify-end">
              <button
                onClick={() => setIsAbortModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAbortScraper}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Abort
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER STATUS BAR ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 pt-2 text-xs text-slate-400 font-semibold select-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shrink-0"></span>
        <span>System Operational</span>
      </div>
    </div>
  );
}
