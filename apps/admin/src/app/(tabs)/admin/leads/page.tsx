"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { API_URL, fetchSignals } from "@/lib/api";

interface LeadRow {
  id: string;
  status?: string;
  stores?: { name?: string; store_name?: string; url?: string; niche?: string; country?: string };
  signals?: { name?: string };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [signals, setSignals] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState("");
  const [signalFilter, setSignalFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("all");

  const countries = Array.from(new Set(leads.map((l) => l.stores?.country).filter(Boolean))).sort() as string[];

  useEffect(() => {
    fetchLeads();
    fetchSignals()
      .then((rows) => setSignals(rows || []))
      .catch(() => setSignals([]));
  }, []);

  const fetchLeads = async (filters?: { country?: string; signal?: string; verified?: string }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const params = new URLSearchParams();
      if (filters?.country) params.set("country", filters.country);
      if (filters?.signal) params.set("signal", filters.signal);
      if (filters?.verified && filters.verified !== "all") params.set("verified", filters.verified);
      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`${API_URL}/api/admin/leads${query}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        setLeads(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${API_URL}/api/admin/leads/${id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ status })
      });
      setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
    } catch {
      alert("Failed to update status");
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#6366f1] w-8 h-8" />
    </div>
  );

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Leads Management</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Operational view of all scraped and processed stores.</p>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-300 transition-all cursor-pointer"
        >
          <option value="">All Countries</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        <select
          value={signalFilter}
          onChange={(e) => setSignalFilter(e.target.value)}
          className="bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-300 transition-all cursor-pointer"
        >
          <option value="">All Signals</option>
          {signals.map((signal) => (
            <option key={signal.id} value={signal.name}>
              {signal.name}
            </option>
          ))}
        </select>
        <select
          value={verifiedFilter}
          onChange={(e) => setVerifiedFilter(e.target.value)}
          className="bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-300 transition-all cursor-pointer"
        >
          <option value="all">All Verification</option>
          <option value="valid">Verified (Valid)</option>
          <option value="broken">Verified (Broken)</option>
          <option value="unverified">Unverified</option>
        </select>
        <button
          onClick={() => fetchLeads({ country: countryFilter, signal: signalFilter, verified: verifiedFilter })}
          className="border border-indigo-200 text-[#6366f1] hover:bg-indigo-50/30 font-bold text-xs py-2 px-5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Search size={12} />
          <span>Apply Filters</span>
        </button>
      </div>

      {/* Leads Register Table */}
      <div className="border border-slate-100 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="border-b border-slate-100 bg-[#f3f2ff]/40 text-[#6366f1] font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Store</th>
                <th className="p-4">Niche & Country</th>
                <th className="p-4">Signal</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-900 text-xs">
                      {lead.stores?.name || lead.stores?.store_name || "-"}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]" title={lead.stores?.url}>
                      {lead.stores?.url}
                    </div>
                  </td>
                  <td className="p-4 text-slate-500 capitalize">
                    <div>{lead.stores?.niche}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-bold">{lead.stores?.country}</div>
                  </td>
                  <td className="p-4">
                    <span className="bg-indigo-50 text-[#6366f1] border border-indigo-100/30 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                      {lead.signals?.name || "Unknown"}
                    </span>
                  </td>
                  <td className="p-4">
                    {lead.status === "valid" ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-full text-[10px]">
                        <CheckCircle size={12} /> Valid
                      </span>
                    ) : lead.status === "broken" ? (
                      <span className="inline-flex items-center gap-1.5 text-red-500 font-bold bg-red-50 border border-red-100/30 px-2 py-0.5 rounded-full text-[10px]">
                        <XCircle size={12} /> Broken
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Unchecked</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => updateStatus(lead.id, "valid")}
                        className="px-2.5 py-1.5 text-[10px] font-bold border border-emerald-200 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                      >
                        Mark Valid
                      </button>
                      <button
                        onClick={() => updateStatus(lead.id, "broken")}
                        className="px-2.5 py-1.5 text-[10px] font-bold border border-red-200 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                      >
                        Mark Broken
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                    No leads found in database. Run the scraper.
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
