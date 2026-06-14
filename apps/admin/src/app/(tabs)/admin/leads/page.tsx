"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
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

  if (loading) return <div className="p-10"><Loader2 className="animate-spin text-[#00adb5]" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#eeeeee]">Leads Management</h1>
        <p className="text-[#eeeeee]/60">Operational view of all scraped and processed stores.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="rounded-xl border border-[#00adb5]/20 bg-[#393e46]/40 px-3 py-2 text-sm text-[#eeeeee]"
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
          className="rounded-xl border border-[#00adb5]/20 bg-[#393e46]/40 px-3 py-2 text-sm text-[#eeeeee]"
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
          className="rounded-xl border border-[#00adb5]/20 bg-[#393e46]/40 px-3 py-2 text-sm text-[#eeeeee]"
        >
          <option value="all">All Verification</option>
          <option value="valid">Verified (Valid)</option>
          <option value="broken">Verified (Broken)</option>
          <option value="unverified">Unverified</option>
        </select>
        <button
          onClick={() => fetchLeads({ country: countryFilter, signal: signalFilter, verified: verifiedFilter })}
          className="rounded-xl border border-[#00adb5]/20 bg-[#00adb5]/10 px-3 py-2 text-sm font-semibold text-[#00adb5]"
        >
          Apply Filters
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#00adb5]/20 bg-[#393e46]/30 text-[#eeeeee]/60">
              <th className="p-4 font-semibold uppercase">Store</th>
              <th className="p-4 font-semibold uppercase">Niche & Country</th>
              <th className="p-4 font-semibold uppercase">Signal</th>
              <th className="p-4 font-semibold uppercase">Status</th>
              <th className="p-4 font-semibold uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#00adb5]/10">
            {leads.map(lead => (
              <tr key={lead.id} className="hover:bg-[#393e46]/20 text-[#eeeeee]">
                <td className="p-4">
                  <div className="font-semibold">{lead.stores?.name || lead.stores?.store_name || "-"}</div>
                  <div className="text-xs text-[#eeeeee]/50">{lead.stores?.url}</div>
                </td>
                <td className="p-4">
                  <div>{lead.stores?.niche}</div>
                  <div className="text-xs text-[#eeeeee]/50">{lead.stores?.country}</div>
                </td>
                <td className="p-4">
                  <span className="bg-[#00adb5]/10 text-[#00adb5] px-2 py-1 rounded text-xs">
                    {lead.signals?.name || "Unknown"}
                  </span>
                </td>
                <td className="p-4">
                  {lead.status === "valid" ? (
                    <span className="flex items-center gap-1.5 text-[#00adb5]"><CheckCircle size={14}/> Valid</span>
                  ) : lead.status === "broken" ? (
                    <span className="flex items-center gap-1.5 text-[#ffdcdc]"><XCircle size={14}/> Broken</span>
                  ) : (
                    <span className="text-[#eeeeee]/40">Unchecked</span>
                  )}
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => updateStatus(lead.id, "valid")} className="px-2 py-1 text-xs border border-[#00adb5]/20 hover:bg-[#00adb5]/10 rounded">Mark Valid</button>
                  <button onClick={() => updateStatus(lead.id, "broken")} className="px-2 py-1 text-xs border border-[#ffdcdc]/20 hover:bg-[#ffdcdc]/10 rounded text-[#ffdcdc]">Mark Broken</button>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-[#eeeeee]/40">No leads found. Run the scraper.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
