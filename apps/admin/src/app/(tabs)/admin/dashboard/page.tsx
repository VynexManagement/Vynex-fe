"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Play, Database, RefreshCw, AlertCircle } from "lucide-react";
import { API_URL } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import MetricCard from "@/components/admin/MetricCard";
import SectionCard from "@/components/admin/SectionCard";

interface DashboardData {
  metrics: { total_stores: number; valid_leads: number; broken_leads_pct: number; total_revenue: number };
  dataQuality: { valid_pct: number; valid_count: number; broken_count: number; top_failing_niches: { name: string; count: number }[] };
  inventory: { leads_by_niche: { name: string; count: number }[]; leads_by_signal: { name: string; count: number }[] };
  scraper: { last_run_at: string | null; total_scraped: number; success_count: number; failure_count: number };
  sales: { total_orders: number; revenue_7d: number; top_niche: string; top_signal: string };
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [rechecking, setRechecking] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setError("You are not authenticated.");
          return;
        }
        const headers = { Authorization: `Bearer ${session.access_token}` };
        const [metricsRes, qualityRes, inventoryRes, scraperRes, salesRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/dashboard/metrics`, { headers }),
          fetch(`${API_URL}/api/admin/dashboard/data-quality`, { headers }),
          fetch(`${API_URL}/api/admin/dashboard/inventory`, { headers }),
          fetch(`${API_URL}/api/admin/dashboard/scraper`, { headers }),
          fetch(`${API_URL}/api/admin/dashboard/sales`, { headers }),
        ]);

        if (!metricsRes.ok || !qualityRes.ok || !inventoryRes.ok || !scraperRes.ok || !salesRes.ok) {
          throw new Error("Failed to load dashboard data.");
        }

        setData({
          metrics: await metricsRes.json(),
          dataQuality: await qualityRes.json(),
          inventory: await inventoryRes.json(),
          scraper: await scraperRes.json(),
          sales: await salesRes.json(),
        });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const recheckData = async () => {
    setRechecking(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      await fetch(`${API_URL}/api/admin/data-quality/recheck`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      alert("Recheck request queued.");
    } catch {
      alert("Failed to queue recheck.");
    } finally {
      setRechecking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#6366f1] w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="font-medium">{error}</span>
      </div>
    );
  }

  if (!data) {
    return <div className="text-slate-400">No dashboard data available.</div>;
  }

  const totalRuns = data.scraper.success_count + data.scraper.failure_count;
  const successRate = totalRuns > 0 ? ((data.scraper.success_count / totalRuns) * 100).toFixed(1) : "100.0";
  const averageOrderValue = data.sales.total_orders > 0 ? (data.metrics.total_revenue / data.sales.total_orders).toFixed(2) : "0.00";

  const colors = ["bg-[#6366f1]", "bg-slate-700", "bg-cyan-400", "bg-slate-400"];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">Monitor data quality, inventory, scraper performance, and sales.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Stores" value={data.metrics.total_stores.toLocaleString()} />
        <MetricCard label="Valid Leads" value={data.metrics.valid_leads.toLocaleString()} />
        <MetricCard label="Broken Leads %" value={`${data.metrics.broken_leads_pct}%`} />
        <MetricCard label="Total Revenue" value={`$${data.metrics.total_revenue.toLocaleString()}`} />
      </div>

      {/* Grid: Niches & Scraper Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Niche Distribution Card */}
        <SectionCard title="Leads by Niche">
          <div className="space-y-4">
            {data.inventory.leads_by_niche.length === 0 ? (
              <div className="text-sm text-slate-400 italic">No niches populated. Run the scraper.</div>
            ) : (
              data.inventory.leads_by_niche.slice(0, 4).map((item, idx) => {
                const maxVal = Math.max(...data.inventory.leads_by_niche.map(n => n.count));
                const pct = maxVal > 0 ? (item.count / maxVal) * 100 : 0;
                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                      <span className="capitalize">{item.name}</span>
                      <span className="font-mono text-slate-500">{item.count.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colors[idx % colors.length]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SectionCard>

        {/* Scraper Health Card */}
        <SectionCard title="Scraper Health">
          <div className="relative flex flex-col justify-between h-full min-h-[160px]">
            <div className="absolute top-[-36px] right-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Active</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Run</span>
                <div className="text-sm font-semibold text-slate-700">
                  {data.scraper.last_run_at ? new Date(data.scraper.last_run_at).toLocaleDateString() : "Never"}
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Success Rate</span>
                <div className="text-sm font-semibold text-emerald-600">{successRate}%</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Failed</span>
                <div className="text-sm font-semibold text-red-500">{data.scraper.failure_count}</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Running Jobs</span>
                <div className="text-sm font-semibold text-indigo-600">
                  {data.scraper.last_run_at && !data.scraper.success_count ? 1 : 0}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Grid: Signals & Revenue & Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Signals Card */}
        <SectionCard title="Top Signals">
          <div className="space-y-3">
            {data.inventory.leads_by_signal.length === 0 ? (
              <div className="text-sm text-slate-400 italic">No signals matching.</div>
            ) : (
              data.inventory.leads_by_signal.slice(0, 4).map((item) => (
                <div key={item.name} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                  <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                  <span className="text-xs font-bold bg-indigo-50 text-[#6366f1] border border-indigo-100/40 px-2.5 py-0.5 rounded-full">
                    {item.count.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        {/* Revenue & Orders Overview Card */}
        <SectionCard title="Revenue & Orders Overview">
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Revenue This Month</span>
              <div className="text-lg font-extrabold text-slate-900 mt-1 tracking-tight">
                ${data.metrics.total_revenue.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
              <div className="text-lg font-extrabold text-slate-900 mt-1 tracking-tight">
                {data.sales.total_orders.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Avg Order Value</span>
              <div className="text-lg font-extrabold text-slate-900 mt-1 tracking-tight">
                ${averageOrderValue}
              </div>
            </div>
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Top Selling Niche</span>
              <div className="text-lg font-extrabold text-[#6366f1] mt-1 tracking-tight capitalize">
                {data.sales.top_niche || "-"}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Quick Actions Panel */}
      <SectionCard title="Quick Actions">
        <div className="flex flex-wrap gap-3.5 mt-2">
          <Link
            href="/admin/scraper"
            className="btn-primary py-2 px-5 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer text-white"
          >
            <Play size={12} fill="white" />
            <span>Run Scraper</span>
          </Link>
          <Link
            href="/admin/dataset-builder"
            className="border border-indigo-200 text-[#6366f1] hover:bg-indigo-50/30 font-bold text-xs py-2 px-5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Database size={12} />
            <span>Build Dataset</span>
          </Link>
          <button
            onClick={recheckData}
            disabled={rechecking}
            className="bg-slate-50 border border-slate-100 hover:bg-slate-100/50 text-slate-700 font-bold text-xs py-2 px-5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {rechecking ? (
              <Loader2 className="animate-spin w-3.5 h-3.5 text-slate-500" />
            ) : (
              <RefreshCw size={12} />
            )}
            <span>Recheck Broken Leads</span>
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
