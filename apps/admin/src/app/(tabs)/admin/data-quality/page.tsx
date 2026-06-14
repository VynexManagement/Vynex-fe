"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { API_URL } from "@/lib/api";

export default function DataQualityPage() {
  const [metrics, setMetrics] = useState<any>(null);

  const fetchMetrics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/admin/data-quality`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (res.ok) setMetrics(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchMetrics(); }, []);

  const triggerRecheck = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${API_URL}/api/admin/data-quality/recheck`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      alert("Recheck background task queued successfully.");
    } catch (e) {}
  };

  if (!metrics) return <div className="p-10"><Loader2 className="animate-spin text-[#00adb5]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#eeeeee]">Data Quality</h1>
          <p className="text-[#eeeeee]/60">Monitor and maintain lead URL accuracy.</p>
        </div>
        <button onClick={triggerRecheck} className="btn-primary flex gap-2 items-center px-4 py-2 rounded-lg font-bold">
          <ShieldCheck size={16}/> Recheck All URLs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col gap-2">
          <span className="text-[#eeeeee]/50 text-sm font-semibold uppercase">Total Extracted</span>
          <span className="text-4xl font-bold text-[#eeeeee]">{metrics.total}</span>
        </div>
        <div className="glass-card p-6 flex flex-col gap-2 border-t-2 border-[#00adb5]">
          <span className="text-[#eeeeee]/50 text-sm font-semibold uppercase">Valid Leads</span>
          <span className="text-4xl font-bold text-[#00adb5]">{metrics.valid_pct.toFixed(1)}%</span>
          <span className="text-xs text-[#eeeeee]/40">{metrics.valid_count} URLs return Status 200</span>
        </div>
        <div className="glass-card p-6 flex flex-col gap-2 border-t-2 border-[#ffdcdc]">
          <span className="text-[#eeeeee]/50 text-sm font-semibold uppercase">Broken Links</span>
          <span className="text-4xl font-bold text-[#ffdcdc]">{metrics.broken_pct.toFixed(1)}%</span>
          <span className="text-xs text-[#eeeeee]/40">{metrics.broken_count} flagged connections</span>
        </div>
      </div>
      
      {metrics.broken_count > 0 && (
        <div className="glass-card p-6 flex gap-4 items-center bg-[#ffdcdc]/10 border border-[#ffdcdc]/20">
          <AlertTriangle className="text-[#ffdcdc] w-8 h-8" />
          <div>
            <h3 className="font-bold text-[#ffdcdc]">Action Required</h3>
            <p className="text-sm text-[#eeeeee]/70">There are {metrics.broken_count} broken leads in your system. Consider running a bulk delete from the Leads tab to maintain dataset quality.</p>
          </div>
        </div>
      )}
    </div>
  );
}
