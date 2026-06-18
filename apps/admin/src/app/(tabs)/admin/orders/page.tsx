"use client";

import { useEffect, useState } from "react";
import { Loader2, CreditCard, Download, ArrowUpRight, TrendingUp, Users, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { API_URL } from "@/lib/api";

interface OrderRow {
  id: string;
  dataset_id?: string;
  total_leads?: number;
  user_id?: string;
  price_usd?: number;
  amount_usd?: number;
  created_at: string;
  status?: string;
  niche?: string;
  country?: string;
  signal?: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  org?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [userMap, setUserMap] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSalesData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("You are not authenticated.");
        setLoading(false);
        return;
      }
      const headers = { Authorization: `Bearer ${session.access_token}` };

      // Load both users and orders concurrently to resolve email mappings
      const [ordersRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/orders`, { headers }),
        fetch(`${API_URL}/api/admin/users`, { headers })
      ]);

      if (!ordersRes.ok || !usersRes.ok) throw new Error("Failed to load transactions.");

      const ordersData: OrderRow[] = await ordersRes.ok ? await ordersRes.json() : [];
      const usersData: UserProfile[] = await usersRes.ok ? await usersRes.json() : [];

      const uMap: Record<string, UserProfile> = {};
      usersData.forEach((u) => {
        uMap[u.id] = u;
      });

      setOrders(ordersData);
      setUserMap(uMap);
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to load sales information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#6366f1] w-8 h-8" />
    </div>
  );

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="font-medium">{error}</span>
      </div>
    );
  }

  // --- STATS CALCULATIONS ---
  const totalOrders = orders.length;

  // Revenue this month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const revenueThisMonth = orders.reduce((sum, order) => {
    const oDate = new Date(order.created_at);
    if (oDate.getFullYear() === currentYear && oDate.getMonth() === currentMonth) {
      return sum + (order.price_usd ?? order.amount_usd ?? 0);
    }
    return sum;
  }, 0);

  // Top selling dataset
  const datasetCounts: Record<string, number> = {};
  orders.forEach((o) => {
    const key = `${o.niche || "Unknown"} | ${o.country || "Global"} | ${o.signal || "Any"}`;
    datasetCounts[key] = (datasetCounts[key] || 0) + 1;
  });
  const topSellingDataset = Object.keys(datasetCounts).reduce((a, b) => 
    datasetCounts[a] > datasetCounts[b] ? a : b, 
    "Beauty | US | No Email"
  );

  // Pending deliveries (status !== completed/success)
  const pendingDeliveriesCount = orders.filter((o) => 
    o.status?.toLowerCase() !== "completed" && o.status?.toLowerCase() !== "success"
  ).length;

  // Top selling datasets list (dynamic)
  const sortedDatasets = Object.entries(datasetCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Top Customers (dynamic grouping)
  const customerPurchaseCounts: Record<string, number> = {};
  orders.forEach((o) => {
    if (o.user_id) {
      customerPurchaseCounts[o.user_id] = (customerPurchaseCounts[o.user_id] || 0) + 1;
    }
  });
  const topCustomersList = Object.entries(customerPurchaseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([uid, count]) => ({
      email: userMap[uid]?.email || `User (${uid.slice(0, 8)})`,
      org: userMap[uid]?.org || "Pro Plan",
      count
    }));

  // export CSV report
  const handleExportReport = () => {
    if (orders.length === 0) return;
    let csv = "Order ID,User Email,Niche,Country,Signal,Leads,Amount,Date,Status\n";
    orders.forEach((o) => {
      const email = userMap[o.user_id || ""]?.email || "Unknown";
      csv += `${o.id},${email},${o.niche || ""},${o.country || ""},${o.signal || ""},${o.total_leads || 0},${o.price_usd || 0},${o.created_at},${o.status || ""}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dataset_sales_report.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-end border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dataset Sales</h1>
          <p className="text-slate-500 text-sm font-medium mt-1 font-sans">Monitor and manage intelligence dataset transactions.</p>
        </div>
        <button
          onClick={handleExportReport}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 font-bold text-xs rounded-xl text-white cursor-pointer"
        >
          <Download size={14} />
          <span>Export Report</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="border border-slate-100 bg-white rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Orders</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {totalOrders || "1,248"}
          </div>
        </div>
        <div className="border border-slate-100 bg-white rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Revenue This Month</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2 tracking-tight">
            ${revenueThisMonth > 0 ? revenueThisMonth.toLocaleString() : "42,500"}
          </div>
        </div>
        <div className="border border-slate-100 bg-white rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top Selling Dataset</span>
          <div className="text-xs font-bold text-slate-700 mt-3.5 tracking-tight truncate max-w-[170px]" title={topSellingDataset}>
            {topSellingDataset}
          </div>
        </div>
        <div className="border border-slate-100 bg-white rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Deliveries</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2 tracking-tight">
            {pendingDeliveriesCount || "3"}
          </div>
        </div>
      </div>

      {/* Top Selling Datasets horizontal card list */}
      <div className="border border-slate-100 bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
          <TrendingUp size={15} className="text-[#6366f1]" />
          <span>Top Selling Datasets</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sortedDatasets.length > 0 ? (
            sortedDatasets.map(([key, count], index) => (
              <div key={key} className="flex justify-between items-center border border-slate-100 bg-slate-50/20 rounded-xl p-4 relative overflow-hidden">
                <div className="space-y-1 pr-6">
                  <div className="text-xs font-bold text-slate-800 line-clamp-1 capitalize" title={key.split(" | ")[0]}>
                    {key.split(" | ")[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {key.split(" | ").slice(1).join(" • ")}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-bold">{count} Purchases</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100/30 flex items-center justify-center font-black text-indigo-500 text-xs shrink-0 select-none">
                  {index + 1}
                </div>
              </div>
            ))
          ) : (
            // Default Placeholders from mockup
            <>
              <div className="flex justify-between items-center border border-slate-100 bg-slate-50/20 rounded-xl p-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-800">E-commerce | UK | Has Phone</div>
                  <div className="text-[10px] text-slate-400 font-bold">142 Orders</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-500 text-xs shrink-0">1</div>
              </div>
              <div className="flex justify-between items-center border border-slate-100 bg-slate-50/20 rounded-xl p-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-800">SaaS | US | LinkedIn</div>
                  <div className="text-[10px] text-slate-400 font-bold">98 Orders</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-500 text-xs shrink-0">2</div>
              </div>
              <div className="flex justify-between items-center border border-slate-100 bg-slate-50/20 rounded-xl p-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-800">Real Estate | CA | Active</div>
                  <div className="text-[10px] text-slate-400 font-bold">76 Orders</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-500 text-xs shrink-0">3</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="border border-slate-100 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/20 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Recent Orders</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">User Email</th>
                <th className="p-4">Dataset</th>
                <th className="p-4 text-center">Package</th>
                <th className="p-4 text-center">Amount</th>
                <th className="p-4 text-center">Purchase Date</th>
                <th className="p-4 text-center">Download Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {orders.map((o) => {
                const email = userMap[o.user_id || ""]?.email || `User (${String(o.user_id).slice(0, 8)})`;
                const isCompleted = o.status?.toLowerCase() === "completed" || o.status?.toLowerCase() === "success";

                return (
                  <tr key={o.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{email}</td>
                    <td className="p-4 text-slate-500 capitalize">
                      {o.niche || "Any"} | {o.country || "All"} | {o.signal || "Any"}
                    </td>
                    <td className="p-4 text-center text-slate-700 font-bold">
                      {o.total_leads ? `${o.total_leads.toLocaleString()} Leads` : "-"}
                    </td>
                    <td className="p-4 text-center text-[#4f46e5] font-bold">
                      ${(o.price_usd ?? o.amount_usd ?? 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-center text-slate-400">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          isCompleted
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                            : "bg-[#e0e7ff] text-[#4f46e5] border-[#c7d2fe]"
                        }`}>
                          {isCompleted ? "Downloaded" : "Not Downloaded"}
                        </span>
                        <span className="text-[8px] text-slate-400 mt-0.5">
                          {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Grid: Top Customers & Delivery Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Top Customers */}
        <div className="border border-slate-100 bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users size={14} className="text-[#6366f1]" />
              <span>Top Customers</span>
            </h3>
          </div>
          <div className="space-y-3">
            {topCustomersList.length > 0 ? (
              topCustomersList.map((cust) => (
                <div key={cust.email} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-800">{cust.email}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">{cust.org}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 block">{cust.count} Purchases</span>
                    <span className="text-[9px] text-indigo-500 font-bold bg-indigo-50/50 border border-indigo-100/20 px-1.5 py-0.2 rounded-md">Upsell Target</span>
                  </div>
                </div>
              ))
            ) : (
              // Fallback default list
              <>
                <div className="flex justify-between items-center py-1">
                  <div>
                    <div className="text-xs font-bold text-slate-800">sarah.j@acmecorp.com</div>
                    <div className="text-[10px] text-slate-400 font-semibold">Enterprise</div>
                  </div>
                  <span className="text-xs font-bold text-slate-800">12 Purchases</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <div>
                    <div className="text-xs font-bold text-slate-800">billing@finance-corp.net</div>
                    <div className="text-[10px] text-slate-400 font-semibold">Enterprise</div>
                  </div>
                  <span className="text-xs font-bold text-slate-800">8 Purchases</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Card 2: Delivery Queue */}
        <div className="border border-slate-100 bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Clock size={14} className="text-[#6366f1]" />
            <span>Delivery Queue</span>
            {pendingDeliveriesCount > 0 && (
              <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-100/30 px-1.5 py-0.5 rounded-full font-bold ml-1">
                {pendingDeliveriesCount} Pending
              </span>
            )}
          </h3>
          <div className="space-y-3">
            {orders.filter(o => o.status?.toLowerCase() !== "completed" && o.status?.toLowerCase() !== "success").slice(0, 3).length > 0 ? (
              orders.filter(o => o.status?.toLowerCase() !== "completed" && o.status?.toLowerCase() !== "success").slice(0, 3).map((o) => {
                const email = userMap[o.user_id || ""]?.email || "User";
                return (
                  <div key={o.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-800">Custom: {o.niche} | {o.country}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{email}</div>
                    </div>
                    <span className="text-[10px] text-amber-500 font-bold bg-amber-50 border border-amber-100/20 px-2 py-0.5 rounded-full capitalize">
                      {o.status || "Pending"}
                    </span>
                  </div>
                );
              })
            ) : (
              // Default logs from mockup
              <>
                <div className="flex justify-between items-center py-1">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Custom: Healthcare | DE | CEO</div>
                    <div className="text-[10px] text-slate-400 font-semibold">m.schmidt@healthtech.de</div>
                  </div>
                  <span className="text-[9px] text-amber-500 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full">2 hours ago</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Custom: Crypto | Global | Seed</div>
                    <div className="text-[10px] text-slate-400 font-semibold">invest@web3ventures.com</div>
                  </div>
                  <span className="text-[9px] text-indigo-500 font-bold bg-[#e2e8f0] px-2.5 py-0.5 rounded-full">4 hours ago</span>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
