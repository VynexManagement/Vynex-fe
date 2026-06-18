"use client";

import { useState } from "react";
import { Settings, Save, Sliders, Database, ShieldAlert, KeyRound, Loader2 } from "lucide-react";
import SectionCard from "@/components/admin/SectionCard";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    concurrency: 5,
    timeout: 30,
    proxyRotation: true,
    quotaThreshold: 80,
    apiHost: "https://api.stripe.com",
    workerThreads: 4,
    cacheTtl: 3600,
    autoPurge: false
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Settings saved successfully.");
    }, 1000);
  };

  return (
    <div className="space-y-6 select-none max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-end border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Settings
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1 font-sans">Configure system thresholds, crawling rules, and API keys.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 font-bold text-xs rounded-xl text-white cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <Save size={14} />}
          <span>Save Changes</span>
        </button>
      </div>

      {/* Grid Settings Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Panel 1: Scraper & Workers */}
        <SectionCard title="Scraper Thresholds">
          <div className="space-y-4 pt-1">
            <div className="flex justify-between items-center">
              <div>
                <label className="text-xs font-bold text-slate-700 block">Worker Concurrency</label>
                <span className="text-[10px] text-slate-400">Number of scraping jobs run in parallel.</span>
              </div>
              <input
                type="number"
                value={config.concurrency}
                onChange={(e) => setConfig({ ...config, concurrency: Number(e.target.value) })}
                className="w-20 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 text-xs font-bold focus:outline-none text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <label className="text-xs font-bold text-slate-700 block">Request Timeout (sec)</label>
                <span className="text-[10px] text-slate-400">Seconds before throwing HTTP connection errors.</span>
              </div>
              <input
                type="number"
                value={config.timeout}
                onChange={(e) => setConfig({ ...config, timeout: Number(e.target.value) })}
                className="w-20 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 text-xs font-bold focus:outline-none text-right"
              />
            </div>

            <div className="flex justify-between items-center border-t border-slate-50 pt-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block">Proxy Rotation</label>
                <span className="text-[10px] text-slate-400">Enable automatic proxy swapping upon rate limits.</span>
              </div>
              <button
                onClick={() => setConfig({ ...config, proxyRotation: !config.proxyRotation })}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer border focus:outline-none flex items-center ${
                  config.proxyRotation ? "bg-[#6366f1] border-[#4f46e5] justify-end" : "bg-slate-100 border-slate-200 justify-start"
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-white shadow-sm inline-block"></span>
              </button>
            </div>
          </div>
        </SectionCard>

        {/* Panel 2: Quota & System Alerts */}
        <SectionCard title="Diagnostics & Alerts">
          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>SerpApi Warn Threshold</span>
                <span>{config.quotaThreshold}%</span>
              </div>
              <div className="text-[10px] text-slate-400 pb-1">Triggers warning system when quota consumption is reached.</div>
              <input
                type="range"
                min="50"
                max="95"
                value={config.quotaThreshold}
                onChange={(e) => setConfig({ ...config, quotaThreshold: Number(e.target.value) })}
                className="w-full accent-[#6366f1] h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex justify-between items-center border-t border-slate-50 pt-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block">Auto-Purge Broken Leads</label>
                <span className="text-[10px] text-slate-400">Regularly deletes HTTP status 404 links.</span>
              </div>
              <button
                onClick={() => setConfig({ ...config, autoPurge: !config.autoPurge })}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer border focus:outline-none flex items-center ${
                  config.autoPurge ? "bg-[#6366f1] border-[#4f46e5] justify-end" : "bg-slate-100 border-slate-200 justify-start"
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-white shadow-sm inline-block"></span>
              </button>
            </div>
          </div>
        </SectionCard>

        {/* Panel 3: Keys & Credentials */}
        <SectionCard title="API Keys & Integration">
          <div className="space-y-3 pt-1 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <KeyRound size={12} className="text-[#6366f1]" /> SerpApi Token
              </label>
              <input
                type="password"
                value="••••••••••••••••••••••••••••••••••••••••"
                disabled
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-slate-400 font-mono"
              />
            </div>
            <div className="space-y-1 pt-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Database size={12} className="text-[#6366f1]" /> Supabase Service Role Key
              </label>
              <input
                type="password"
                value="••••••••••••••••••••••••••••••••••••••••"
                disabled
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-slate-400 font-mono"
              />
            </div>
          </div>
        </SectionCard>

        {/* Panel 4: Database parameters */}
        <SectionCard title="System Database Cache">
          <div className="space-y-4 pt-1 text-xs">
            <div className="flex justify-between items-center">
              <div>
                <label className="font-bold text-slate-700 block">Cache TTL (Seconds)</label>
                <span className="text-[10px] text-slate-400">Duration dashboard indicators are cached.</span>
              </div>
              <select
                value={config.cacheTtl}
                onChange={(e) => setConfig({ ...config, cacheTtl: Number(e.target.value) })}
                className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-slate-800 font-bold focus:outline-none"
              >
                <option value={1800}>30 Min</option>
                <option value={3600}>1 Hour</option>
                <option value={7200}>2 Hours</option>
                <option value={86400}>24 Hours</option>
              </select>
            </div>

            <div className="border-t border-slate-50 pt-3 flex gap-2.5">
              <button
                onClick={() => alert("System Cache Purged.")}
                className="border border-indigo-200 text-[#6366f1] hover:bg-indigo-50/30 font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Purge System Cache
              </button>
              <button
                onClick={() => alert("Re-syncing profiles...")}
                className="bg-slate-50 border border-slate-100 hover:bg-slate-100/50 text-slate-600 font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Sync Auth Profiles
              </button>
            </div>
          </div>
        </SectionCard>

      </div>
    </div>
  );
}
