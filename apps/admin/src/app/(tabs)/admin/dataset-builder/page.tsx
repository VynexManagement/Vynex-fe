"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, Database, Table } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchSignals, API_URL } from "@/lib/api";
import { NICHES, COUNTRIES } from "@/lib/config";

export default function DatasetBuilderPage() {
  const [niche, setNiche] = useState("all");
  const [country, setCountry] = useState("US");
  const [signal, setSignal] = useState("");
  const [limit, setLimit] = useState(50);
  
  const [signals, setSignals] = useState<any[]>([]);
  const [preview, setPreview] = useState<{
    items: any[];
    total_available: number;
    limit_applied: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSignals = async () => {
      try {
        const data = await fetchSignals();
        setSignals(data);
        if (data.length > 0) setSignal(data[0].name);
      } catch (err) {
        console.error("Failed to load signals:", err);
      }
    };
    loadSignals();
  }, []);

  const fetchPreview = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const params = new URLSearchParams({ niche, country, signal, limit: limit.toString() });
      const res = await fetch(`${API_URL}/api/admin/dataset/preview?${params}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        setPreview(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const params = new URLSearchParams({ niche, country, signal, limit: limit.toString() });
      const res = await fetch(`${API_URL}/api/admin/dataset/export?${params}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dataset_${niche || "all"}_leads.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("Failed to export");
    }
  };

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dataset Builder</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Generate lead lists from explicitly valid data chunks.</p>
      </div>

      {/* Configuration Grid Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
        {/* Niche Select */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Niche</label>
          <select 
            value={niche} 
            onChange={e => setNiche(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-300 transition-all cursor-pointer"
          >
            <option value="all">All Niches</option>
            {NICHES.map(n => (
              <option key={n.value} value={n.value}>{n.label}</option>
            ))}
          </select>
        </div>

        {/* Country Select */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Country</label>
          <select 
            value={country} 
            onChange={e => setCountry(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-300 transition-all cursor-pointer"
          >
            <option value="all">All Countries</option>
            {COUNTRIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Signal Select */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Signal</label>
          <select 
            value={signal} 
            onChange={e => setSignal(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-300 transition-all cursor-pointer"
          >
            <option value="">All Signals</option>
            {signals.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Limit Select */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Leads Limit</label>
          <select 
            value={limit} 
            onChange={e => setLimit(Number(e.target.value))} 
            className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-300 transition-all cursor-pointer"
          >
            <option value={50}>Limit 50</option>
            <option value={100}>Limit 100</option>
            <option value={200}>Limit 200</option>
            <option value={500}>Limit 500</option>
          </select>
        </div>

        <button 
          onClick={fetchPreview} 
          disabled={loading} 
          className="btn-primary md:col-span-4 py-2.5 rounded-xl font-bold text-xs flex justify-center items-center gap-2 text-white shadow-sm mt-2"
        >
          {loading ? (
            <Loader2 className="animate-spin w-3.5 h-3.5 text-white" />
          ) : (
            <>
              <Table size={14} />
              <span>Preview Dataset</span>
            </>
          )}
        </button>
      </div>

      {/* Dataset Preview Section */}
      {preview && (
        <div className="border border-slate-100 bg-white rounded-2xl shadow-sm p-6 space-y-4 animate-premium">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/50 p-4 rounded-xl border border-slate-100 gap-4">
            <div>
              <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                <Database size={15} className="text-[#6366f1]" />
                <span>Preview Ready</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-semibold">Total Available Valid Leads: {preview.total_available}</p>
            </div>
            <button 
              onClick={handleExport} 
              className="flex gap-2 items-center bg-indigo-50 border border-indigo-100/30 hover:bg-indigo-100/50 text-[#6366f1] px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-sm"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
          
          <table className="w-full text-left text-xs text-slate-700 mt-4">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">Store Name</th>
                <th className="p-3">Store URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {preview.items.map((i: any) => (
                <tr key={i.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{i.stores?.name}</td>
                  <td className="p-3 text-indigo-500 font-semibold font-mono text-[11px] truncate max-w-[280px]">
                    <a href={i.stores?.url} target="_blank" rel="noreferrer" className="hover:underline">{i.stores?.url}</a>
                  </td>
                </tr>
              ))}
              {preview.items.length === 0 && (
                <tr>
                  <td colSpan={2} className="p-8 text-center text-slate-400 italic">
                    No preview matches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
