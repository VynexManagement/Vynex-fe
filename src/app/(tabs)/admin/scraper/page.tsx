"use client";

import { useEffect, useState } from "react";
import { NICHES, COUNTRIES } from "@/lib/config";
import { API_URL, fetchSignals } from "@/lib/api";
import { supabase } from "@/lib/supabase";

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

  // 🔥 LOG STATES
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("idle");

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

  // 🔥 POLL LOGS
  useEffect(() => {
    if (!taskId || !token) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/scraper/logs/${taskId}`, {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ REQUIRED
          },
        });

        const data = await res.json();

        setLogs(data.logs || []);
        setStatus(data.status);

        if (data.status !== "running") {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Log fetch error", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [taskId, token]);

  const runScraper = async () => {
    if (!token) {
      alert("Not authenticated");
      return;
    }

    setLoading(true);
    setLogs([]);
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
          Authorization: `Bearer ${token}`, // ✅ added
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

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-[#eeeeee]">Scraper Control</h2>
        <p className="text-[#eeeeee]/40 text-sm mt-1">
          Run scraping jobs manually
        </p>
      </div>

      {/* CONTROL CARD */}
      <div className="bg-[#393e46]/40 border border-[#00adb5]/10 rounded-2xl p-6 space-y-6">
        <div className="rounded-lg border border-[#00adb5]/20 bg-[#00adb5]/10 p-3 text-sm text-[#eeeeee]/80">
          Discovery now uses Google Search API. Daily quota is 100 requests/day.
        </div>
        {/* Niche */}
        <div>
          <label className="text-sm text-[#eeeeee]/60 mb-2 block">
            Target Niche
          </label>
          <select
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="w-full bg-[#222831] border border-[#00adb5]/20 rounded-lg px-3 py-2 text-[#eeeeee]"
          >
            {NICHES.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="text-sm text-[#eeeeee]/60 mb-2 block">
            Target Country
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-[#222831] border border-[#00adb5]/20 rounded-lg px-3 py-2 text-[#eeeeee]"
          >
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Limit */}
        <div>
          <label className="text-sm text-[#eeeeee]/60 mb-2 block">
            Lead Limit
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full bg-[#222831] border border-[#00adb5]/20 rounded-lg px-3 py-2 text-[#eeeeee]"
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={500}>500</option>
            <option value={1000}>1000</option>
          </select>
        </div>

        {/* Mode */}
        <div>
          <label className="text-sm text-[#eeeeee]/60 mb-3 block">
            Scraping Mode
          </label>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-[#eeeeee]/70">
              <input
                type="radio"
                checked={mode === "all"}
                onChange={() => setMode("all")}
              />
              All Signals
            </label>

            <label className="flex items-center gap-2 text-[#eeeeee]/70">
              <input
                type="radio"
                checked={mode === "single"}
                onChange={() => setMode("single")}
              />
              Single Signal
            </label>
          </div>
        </div>

        {/* Signal Dropdown */}
        {mode === "single" && (
          <div>
            <label className="text-sm text-[#eeeeee]/60 mb-2 block">
              Select Signal
            </label>

            <select
              value={signal}
              onChange={(e) => setSignal(e.target.value)}
              className="w-full bg-[#222831] border border-[#00adb5]/20 rounded-lg px-3 py-2 text-[#eeeeee]"
            >
              {signals.map((s) => (
                <option key={s.id} value={s.slug || s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={runScraper}
          disabled={loading}
          className="w-full bg-[#00adb5] text-black font-semibold py-3 rounded-lg hover:opacity-90 transition"
        >
          {loading ? "Running..." : "Run Scraper"}
        </button>
        {(status === "running" || status === "starting") && taskId && (
          <button
            onClick={abortScraper}
            className="w-full border border-[#ffdcdc]/25 bg-[#ffdcdc]/10 text-[#ffdcdc] font-semibold py-3 rounded-lg hover:opacity-90 transition"
          >
            Abort Scraping
          </button>
        )}

        {/* STATUS */}
        {status !== "idle" && (
          <div className="text-sm text-[#eeeeee]/50">
            Status:{" "}
            <span
              className={`${
                status === "running"
                  ? "text-yellow-400"
                  : status === "completed"
                    ? "text-green-400"
                    : "text-red-400"
              }`}
            >
              {status}
            </span>
          </div>
        )}
      </div>

      {/* 🔥 LOGS PANEL */}
      {taskId && (
        <div className="bg-black/40 border border-[#00adb5]/10 rounded-2xl p-4">
          <h3 className="text-sm text-[#eeeeee]/60 mb-2">Scraper Logs</h3>

          <div className="h-64 overflow-y-auto text-xs font-mono text-[#00adb5] bg-black/50 p-3 rounded-lg space-y-1">
            {logs.length === 0 ? (
              <p className="text-[#eeeeee]/30">Waiting for logs...</p>
            ) : (
              logs.map((line, i) => <div key={i}>{line}</div>)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
