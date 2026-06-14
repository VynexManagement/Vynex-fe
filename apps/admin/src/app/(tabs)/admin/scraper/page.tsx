"use client";

import { useEffect, useState, useRef } from "react";
import { NICHES, COUNTRIES } from "@/lib/config";
import { API_URL, fetchSignals } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { 
  Code, Play, AlertCircle, CheckCircle, Info, RefreshCw, 
  Layers, Sliders, Cpu, Terminal, Copy, Trash2, ShieldAlert 
} from "lucide-react";

interface SignalOption {
  id: string;
  name: string;
  slug?: string;
}

export default function ScraperControl() {
  const [niche, setNiche] = useState("all");
  const [country, setCountry] = useState("USA");
  const [limit, setLimit] = useState(200);

  const [mode, setMode] = useState<"all" | "single">("all");
  const [signal, setSignal] = useState("");

  const [signals, setSignals] = useState<SignalOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // LOGS & DIAGNOSTICS STATE
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("idle");
  const [summary, setSummary] = useState<any>(null);
  const [categorizedLogs, setCategorizedLogs] = useState<any>(null);
  const [logTab, setLogTab] = useState<"all" | "discovery" | "scraper" | "http" | "errors">("all");
  
  // Database quota state
  const [quotaLimit, setQuotaLimit] = useState(250);
  const [quotaConsumed, setQuotaConsumed] = useState(2);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setToken(data.session?.access_token || null);
    };

    loadSession();
  }, []);

  // Fetch signals
  useEffect(() => {
    const loadSignals = async () => {
      try {
        const data = await fetchSignals();
        setSignals(data);
        if (data.length > 0) setSignal(data[0].slug || data[0].name);
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

  useEffect(() => {
    if (token) {
      fetchQuota(token);
    }
  }, [token]);

  // POLL LOGS & STATISTICS
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

        setLogs(data.logs || []);
        setStatus(data.status);
        setSummary(data.summary || null);
        setCategorizedLogs(data.categorized_logs || null);

        // Fetch latest quota usage to update live progress bar
        fetchQuota(token);

        if (data.status !== "running" && data.status !== "starting") {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Log fetch error", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [taskId, token]);

  // Scroll to bottom of terminal when logs render
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, logTab]);

  const runScraper = async () => {
    if (!token) {
      alert("Not authenticated");
      return;
    }

    setLoading(true);
    setLogs([]);
    setSummary(null);
    setCategorizedLogs(null);
    setStatus("starting");

    try {
      const payload = {
        niche,
        country,
        limit,
        all_signals: mode === "all",
        signal: mode === "single" ? signal : null,
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

      if (!res.ok) throw new Error(data.detail);

      setTaskId(data.task_id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to start scraper");
      setStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  const abortScraper = async () => {
    if (!taskId || !token) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/scraper/abort/${taskId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to abort scraper");
      }
      setStatus("aborted");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to abort scraper");
    }
  };

  // Logs to show based on active tab
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

  const handleCopyLogs = () => {
    if (logs.length === 0) return;
    navigator.clipboard.writeText(logs.join("\n"));
    alert("Full scraper logs copied to clipboard!");
  };

  const handleClearLogs = () => {
    setLogs([]);
    setSummary(null);
    setCategorizedLogs(null);
    setTaskId(null);
    setStatus("idle");
  };

  // Grayscale Notion status mappings
  const STATUS_STYLES: Record<string, { label: string, color: string, text: string }> = {
    idle: { label: "Offline", color: "bg-[#2f2f2f] border-[#3f3f3f]", text: "text-[#a3a3a3]" },
    starting: { label: "Starting...", color: "bg-amber-500/10 border-amber-500/20 animate-pulse", text: "text-amber-400" },
    running: { label: "Running", color: "bg-amber-500/10 border-amber-500/20 animate-pulse", text: "text-amber-400 font-bold" },
    completed: { label: "Completed", color: "bg-[#2f2f2f] border-[#3f3f3f]", text: "text-white font-bold" },
    aborted: { label: "Aborted", color: "bg-red-500/06 border-red-500/10", text: "text-red-400" },
    failed: { label: "Failed", color: "bg-red-500/06 border-red-500/10", text: "text-red-400 font-bold" },
    unknown_or_completed: { label: "Idle / Done", color: "bg-[#2f2f2f] border-[#3f3f3f]", text: "text-white" }
  };

  const currentStatus = STATUS_STYLES[status] || STATUS_STYLES.idle;

  return (
    <div className="space-y-6 font-sans select-none max-w-5xl mx-auto py-6">
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="pb-4 border-b border-[#2f2f2f] flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders size={18} className="text-[#a3a3a3]" /> Scraper Control
          </h1>
          <p className="text-[#a3a3a3] text-[11px] mt-0.5">Configure, run, and monitor store discovery crawlers and metadata crawlers.</p>
        </div>
      </div>

      {/* ── BENTO CONFIGURATION LAYOUT ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Bento Block 1: Scraper Configuration Bento Panel (col-span-2) */}
        <div className="lg:col-span-2 border border-[#2f2f2f] bg-[#202020] rounded-lg p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#2f2f2f] pb-2">
              <Sliders size={13} className="text-[#a3a3a3]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Job Configurator</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Niche */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#a3a3a3]">Target Niche</label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  disabled={status === "running" || status === "starting"}
                  className="w-full bg-[#191919] border border-[#2f2f2f] hover:border-[#3f3f3f] rounded px-3 py-2 text-[#e3e3e3] text-xs font-medium focus:outline-none focus:border-[#4f4f4f] transition-all"
                >
                  {NICHES.map((n) => (
                    <option key={n.value} value={n.value}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Country */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#a3a3a3]">Target Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={status === "running" || status === "starting"}
                  className="w-full bg-[#191919] border border-[#2f2f2f] hover:border-[#3f3f3f] rounded px-3 py-2 text-[#e3e3e3] text-xs font-medium focus:outline-none focus:border-[#4f4f4f] transition-all"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lead Limit */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#a3a3a3]">Lead Limit</label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  disabled={status === "running" || status === "starting"}
                  className="w-full bg-[#191919] border border-[#2f2f2f] hover:border-[#3f3f3f] rounded px-3 py-2 text-[#e3e3e3] text-xs font-medium focus:outline-none focus:border-[#4f4f4f] transition-all"
                >
                  <option value={10}>10 stores</option>
                  <option value={50}>50 stores</option>
                  <option value={100}>100 stores</option>
                  <option value={200}>200 stores</option>
                  <option value={500}>500 stores</option>
                  <option value={1000}>1000 stores</option>
                </select>
              </div>

              {/* Mode Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#a3a3a3]">Scraping Mode</label>
                <div className="flex gap-4 border border-[#2f2f2f] bg-[#191919] rounded px-3 py-2 h-[34px] items-center">
                  <label className="flex items-center gap-1.5 text-[10px] font-medium text-[#e3e3e3] cursor-pointer">
                    <input
                      type="radio"
                      checked={mode === "all"}
                      disabled={status === "running" || status === "starting"}
                      onChange={() => setMode("all")}
                      className="accent-white"
                    />
                    All Signals
                  </label>
                  <label className="flex items-center gap-1.5 text-[10px] font-medium text-[#e3e3e3] cursor-pointer">
                    <input
                      type="radio"
                      checked={mode === "single"}
                      disabled={status === "running" || status === "starting"}
                      onChange={() => setMode("single")}
                      className="accent-white"
                    />
                    Single Signal
                  </label>
                </div>
              </div>

              {/* Specific Signal Dropdown */}
              {mode === "single" && (
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#a3a3a3]">Select Active Signal</label>
                  <select
                    value={signal}
                    onChange={(e) => setSignal(e.target.value)}
                    disabled={status === "running" || status === "starting"}
                    className="w-full bg-[#191919] border border-[#2f2f2f] hover:border-[#3f3f3f] rounded px-3 py-2 text-[#e3e3e3] text-xs font-medium focus:outline-none focus:border-[#4f4f4f] transition-all"
                  >
                    {signals.map((s) => (
                      <option key={s.id} value={s.slug || s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Config Controls */}
          <div className="flex gap-3 pt-3 border-t border-[#2f2f2f]">
            <button
              onClick={runScraper}
              disabled={loading || status === "running" || status === "starting"}
              className="btn-primary py-2 px-4 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-white"
            >
              {loading ? <Cpu className="animate-spin w-3.5 h-3.5" /> : <Play size={11} />}
              {status === "running" || status === "starting" ? "Discovery Active" : "Run Scraper"}
            </button>

            {(status === "running" || status === "starting") && taskId && (
              <button
                onClick={abortScraper}
                className="flex items-center gap-1.5 border border-red-500/20 hover:border-red-500/40 bg-red-500/06 hover:bg-red-500/10 text-red-400 font-bold px-4 py-2 rounded text-xs transition-premium cursor-pointer"
              >
                <ShieldAlert size={12} /> Abort Scraper
              </button>
            )}
          </div>
        </div>

        {/* Bento Block 2: API Quota Gauge & Activity (col-span-1) */}
        <div className="border border-[#2f2f2f] bg-[#202020] rounded-lg p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#2f2f2f] pb-2">
              <Cpu size={13} className="text-[#a3a3a3]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">System Diagnostics</h2>
            </div>

            {/* Flat status widget */}
            <div className={`flex items-center gap-3 border rounded px-3 py-2 ${currentStatus.color}`}>
              <div className="relative shrink-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-current"></div>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#a3a3a3] block">Engine Status</span>
                <div className={`text-xs font-bold ${currentStatus.text}`}>{currentStatus.label}</div>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-[#a3a3a3] uppercase tracking-wider">SerpApi Quota usage</span>
                <span className="font-mono text-white">{quotaConsumed}/{quotaLimit}</span>
              </div>
              <div className="w-full h-2 bg-[#191919] border border-[#2f2f2f] rounded overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#a3a3a3] rounded-sm transition-all duration-1000"
                  style={{ width: `${Math.min((quotaConsumed / quotaLimit) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-[#a3a3a3] leading-relaxed italic">
                {quotaConsumed >= quotaLimit ? "⚠️ Limit reached. Scraper discovery is restricted." : "Quota checks loaded from Supabase signals catalog."}
              </p>
            </div>
          </div>

          <div className="rounded border border-[#2f2f2f] bg-[#191919] p-3 text-[10px] text-[#a3a3a3] leading-relaxed flex gap-2">
            <Info size={13} className="text-[#a3a3a3] shrink-0 mt-0.5" />
            <span>
              Store discovery searches dynamically write to the database and increment counts securely page-by-page.
            </span>
          </div>
        </div>

        {/* Bento Block 3: Dynamic Job Diagnostics Dashboard (col-span-3) */}
        {taskId && (
          <div className="col-span-1 lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 animate-premium">
            {/* Counter 1: Discovered URLs */}
            <div className="border border-[#2f2f2f] bg-[#202020] rounded-lg p-4 space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-[#a3a3a3] block">Discovered Stores</span>
              <div className="text-xl font-bold text-white tracking-tight tabular-nums">
                {summary?.discovered_urls || 0}
              </div>
            </div>

            {/* Counter 2: Matches Found */}
            <div className="border border-[#2f2f2f] bg-[#202020] rounded-lg p-4 space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-[#a3a3a3] block">Target Matches</span>
              <div className="text-xl font-bold text-white tracking-tight tabular-nums">
                {summary?.matches_found || 0}
              </div>
            </div>

            {/* Counter 3: Fetch Failures */}
            <div className="border border-[#2f2f2f] bg-[#202020] rounded-lg p-4 space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-[#a3a3a3] block">Fetch Failures</span>
              <div className="text-xl font-bold text-white tracking-tight tabular-nums">
                {summary?.fetch_failures || 0}
              </div>
            </div>

            {/* Counter 4: Logged Errors */}
            <div className="border border-[#2f2f2f] bg-[#202020] rounded-lg p-4 space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-[#a3a3a3] block">System Errors</span>
              <div className={`text-xl font-bold tracking-tight tabular-nums ${
                summary?.errors > 0 ? "text-red-400" : "text-[#a3a3a3]"
              }`}>
                {summary?.errors || 0}
              </div>
            </div>
          </div>
        )}

        {/* Bento Block 4: Diagnostic Monospaced Shell Terminal (col-span-3) */}
        {taskId && (
          <div className="col-span-1 lg:col-span-3 border border-[#2f2f2f] bg-[#202020] rounded-lg p-5 space-y-4 animate-premium">
            
            {/* Terminal Utility Navigation & CTAs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-[#2f2f2f]">
              <div className="flex items-center gap-2">
                <Terminal size={13} className="text-[#a3a3a3] shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">Console Output Log</span>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={handleCopyLogs}
                  className="flex items-center gap-1.5 bg-[#191919] border border-[#2f2f2f] hover:border-[#3f3f3f] px-3 py-1 rounded text-[10px] font-bold text-[#e3e3e3] transition-all cursor-pointer"
                >
                  <Copy size={11} /> Copy logs
                </button>
                {status !== "running" && status !== "starting" && (
                  <button
                    onClick={handleClearLogs}
                    className="flex items-center gap-1.5 border border-red-500/25 bg-red-500/06 hover:bg-red-500/10 text-red-400 px-3 py-1 rounded text-[10px] font-bold transition-all cursor-pointer"
                  >
                    <Trash2 size={11} /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Logs filter tab bar */}
            <div className="flex gap-2 border-b border-[#2f2f2f] pb-2 overflow-x-auto scrollbar-none">
              {[
                { id: "all", label: "All Logs" },
                { id: "discovery", label: "Discovery Logs" },
                { id: "scraper", label: "Scraper Logs" },
                { id: "http", label: "HTTP Requests" },
                { id: "errors", label: "Errors" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setLogTab(t.id as any)}
                  className={`px-3 py-1 rounded text-[10px] font-bold border transition-premium shrink-0 cursor-pointer ${
                    logTab === t.id
                      ? "bg-[#2f2f2f] border-[#3f3f3f] text-white"
                      : "bg-[#191919] border-transparent text-[#a3a3a3] hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Monospaced Grayscale Terminal Output Box */}
            <div className="h-64 overflow-y-auto text-[11px] font-mono text-[#a3a3a3] bg-[#191919] border border-[#2f2f2f] p-4 rounded space-y-1 relative">
              {logsToRender.length === 0 ? (
                <p className="text-[#a3a3a3]/30 italic py-2">No logging sequences recorded for this module...</p>
              ) : (
                logsToRender.map((line: string, i: number) => {
                  const l = line.toLowerCase();
                  let color = "text-[#e3e3e3]";
                  if (l.includes("error") || l.includes("failed")) color = "text-red-400";
                  if (l.includes("http request") && l.includes("200")) color = "text-emerald-400";
                  if (l.includes("✓ match") || l.includes("match found")) color = "text-emerald-300 font-bold";
                  if (l.includes("discovery query:")) color = "text-[#a3a3a3]";

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
        )}
      </div>
    </div>
  );
}
