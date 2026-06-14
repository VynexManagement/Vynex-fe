"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#eeeeee]">Dataset Builder</h1>
        <p className="text-[#eeeeee]/60">Generate lead lists from explicitly valid data chunks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Niche Select */}
        <select 
          value={niche} 
          onChange={e => setNiche(e.target.value)} 
          className="bg-[#393e46] border border-[#00adb5]/20 rounded-xl px-4 py-2 text-sm text-[#eeeeee]"
        >
          <option value="all">All Niches</option>
          {NICHES.map(n => (
            <option key={n.value} value={n.value}>{n.label}</option>
          ))}
        </select>

        {/* Country Select */}
        <select 
          value={country} 
          onChange={e => setCountry(e.target.value)} 
          className="bg-[#393e46] border border-[#00adb5]/20 rounded-xl px-4 py-2 text-sm text-[#eeeeee]"
        >
          <option value="all">All Countries</option>
          {COUNTRIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        {/* Signal Select */}
        <select 
          value={signal} 
          onChange={e => setSignal(e.target.value)} 
          className="bg-[#393e46] border border-[#00adb5]/20 rounded-xl px-4 py-2 text-sm text-[#eeeeee]"
        >
          <option value="">All Signals</option>
          {signals.map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>

        <select value={limit} onChange={e => setLimit(Number(e.target.value))} className="bg-[#393e46] border border-[#00adb5]/20 rounded-xl px-4 py-2 text-sm text-[#eeeeee]">
          <option value={50}>Limit 50</option>
          <option value={100}>Limit 100</option>
          <option value={200}>Limit 200</option>
          <option value={500}>Limit 500</option>
        </select>

        <button onClick={fetchPreview} disabled={loading} className="btn-primary md:col-span-4 py-2 bg-[#00adb5] text-white rounded-xl font-bold flex justify-center items-center">
          {loading ? <Loader2 className="animate-spin" /> : "Preview Dataset"}
        </button>
      </div>

      {preview && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex justify-between items-center bg-[#393e46]/30 p-4 rounded-xl border border-[#00adb5]/10">
            <div>
              <h2 className="font-bold text-[#eeeeee] text-xl">Preview Ready</h2>
              <p className="text-sm text-[#eeeeee]/60">Total Available Valid Leads: {preview.total_available}</p>
            </div>
            <button onClick={handleExport} className="flex gap-2 items-center bg-[#00adb5]/10 hover:bg-[#00adb5]/20 text-[#00adb5] px-4 py-2 rounded-lg font-semibold transition-colors">
              <Download size={16}/> Export CSV
            </button>
          </div>
          
          <table className="w-full text-left text-sm mt-4">
            <thead>
              <tr className="border-b border-[#00adb5]/20 text-[#eeeeee]/60"><th className="p-2">Store</th><th className="p-2">URL</th></tr>
            </thead>
            <tbody>
              {preview.items.map((i: any) => (
                <tr key={i.id} className="border-b border-[#eeeeee]/05 text-[#eeeeee]">
                  <td className="p-2">{i.stores?.name}</td>
                  <td className="p-2 text-[#eeeeee]/50 font-mono text-xs">{i.stores?.url}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
