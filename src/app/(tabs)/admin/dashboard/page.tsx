"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { API_URL } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import MetricCard from "@/components/admin/MetricCard";
import SectionCard from "@/components/admin/SectionCard";
import ProgressBar from "@/components/admin/ProgressBar";

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
    }
  };

  if (loading) {
    return (
      <div className="p-10">
        <Loader2 className="animate-spin text-[#00adb5]" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-xl border border-[#ffdcdc]/20 bg-[#ffdcdc]/10 p-4 text-[#ffdcdc]">{error}</div>;
  }

  if (!data) {
    return <div className="text-[#eeeeee]/50">No dashboard data available.</div>;
  }

  return (
    <div className="space-y-6 text-[#eeeeee]">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-[#eeeeee]/60">Monitor data quality, inventory, scraper performance, and sales.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Stores" value={data.metrics.total_stores.toLocaleString()} />
        <MetricCard label="Valid Leads" value={data.metrics.valid_leads.toLocaleString()} />
        <MetricCard label="Broken Leads %" value={`${data.metrics.broken_leads_pct}%`} />
        <MetricCard label="Total Revenue" value={`$${data.metrics.total_revenue.toLocaleString()}`} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCard title="Data Quality">
          <div className="space-y-3">
            <ProgressBar value={data.dataQuality.valid_pct} />
            <div className="text-sm text-[#eeeeee]/70">
              Valid: {data.dataQuality.valid_count.toLocaleString()} | Broken: {data.dataQuality.broken_count.toLocaleString()}
            </div>
            <div>
              <div className="mb-2 text-sm text-[#eeeeee]/70">Top failing niches</div>
              {data.dataQuality.top_failing_niches.length === 0 ? (
                <div className="text-sm text-[#eeeeee]/40">No failing niches found.</div>
              ) : (
                <ul className="space-y-1 text-sm">
                  {data.dataQuality.top_failing_niches.map((item) => (
                    <li key={item.name} className="flex justify-between text-[#eeeeee]/80">
                      <span>{item.name}</span>
                      <span>{item.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Lead Inventory">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 text-sm font-medium text-[#eeeeee]/70">Leads by Niche</h4>
              {data.inventory.leads_by_niche.length === 0 ? (
                <div className="text-sm text-[#eeeeee]/40">No data available.</div>
              ) : (
                <ul className="space-y-1 text-sm">
                  {data.inventory.leads_by_niche.map((item) => (
                    <li key={item.name} className="flex justify-between text-[#eeeeee]/80">
                      <span>{item.name}</span>
                      <span>{item.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium text-[#eeeeee]/70">Leads by Signal</h4>
              {data.inventory.leads_by_signal.length === 0 ? (
                <div className="text-sm text-[#eeeeee]/40">No data available.</div>
              ) : (
                <ul className="space-y-1 text-sm">
                  {data.inventory.leads_by_signal.map((item) => (
                    <li key={item.name} className="flex justify-between text-[#eeeeee]/80">
                      <span>{item.name}</span>
                      <span>{item.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCard title="Scraper Activity">
          <div className="space-y-2 text-sm text-[#eeeeee]/80">
            <div>Last run: {data.scraper.last_run_at ? new Date(data.scraper.last_run_at).toLocaleString() : "Never"}</div>
            <div>Total scraped: {data.scraper.total_scraped.toLocaleString()}</div>
            <div>Success count: {data.scraper.success_count.toLocaleString()}</div>
            <div>Failure count: {data.scraper.failure_count.toLocaleString()}</div>
          </div>
        </SectionCard>

        <SectionCard title="Sales Insights">
          <div className="space-y-2 text-sm text-[#eeeeee]/80">
            <div>Total orders: {data.sales.total_orders.toLocaleString()}</div>
            <div>Revenue (last 7 days): ${data.sales.revenue_7d.toLocaleString()}</div>
            <div>Top niche: {data.sales.top_niche}</div>
            <div>Top signal: {data.sales.top_signal}</div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Quick Actions">
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/scraper" className="rounded-lg border border-[#00adb5]/20 bg-[#00adb5]/10 px-4 py-2 text-sm font-semibold text-[#00adb5]">
            Run Scraper
          </Link>
          <Link href="/admin/dataset" className="rounded-lg border border-[#00adb5]/20 bg-[#00adb5]/10 px-4 py-2 text-sm font-semibold text-[#00adb5]">
            Build Dataset
          </Link>
          <button onClick={recheckData} className="rounded-lg border border-[#00adb5]/20 bg-[#00adb5]/10 px-4 py-2 text-sm font-semibold text-[#00adb5]">
            Recheck Data
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
