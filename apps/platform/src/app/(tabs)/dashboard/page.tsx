"use client";

import React, { useState } from "react";
import { 
  Users, 
  Layers, 
  Radio, 
  Globe, 
  ChevronDown,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Loader2
} from "lucide-react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { usePulse } from "@/features/dashboard/hooks/usePulse";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

import { usePurchases } from "@/features/dashboard/hooks/usePurchases";

function DashboardContent() {
  const { data: purchases = [], isLoading: purchasesLoading } = usePurchases();
  const [viewType, setViewType] = useState<"chart" | "table">("chart");

  const formatDateString = (dateStr?: string) => {
    const date = dateStr ? new Date(dateStr) : new Date();
    try {
      const day = date.getDate();
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return "18-June-2026";
    }
  };

  // Dynamic metrics calculations
  const totalLeads = purchases.reduce((sum: number, p: any) => sum + (p.total_leads || 0), 0);

  const nichesSet = new Set<string>();
  purchases.forEach((p: any) => {
    if (p.niche) {
      p.niche.split(",").forEach((n: string) => {
        const val = n.trim();
        if (val && val.toLowerCase() !== "all") {
          nichesSet.add(val.charAt(0).toUpperCase() + val.slice(1).toLowerCase());
        }
      });
    }
  });
  const totalNiches = nichesSet.size;

  const signalsSet = new Set<string>();
  purchases.forEach((p: any) => {
    if (p.signal) {
      p.signal.split(",").forEach((s: string) => {
        const val = s.trim();
        if (val && val.toLowerCase() !== "unknown signal") {
          signalsSet.add(val);
        }
      });
    }
  });
  const totalSignals = signalsSet.size;

  const countriesSet = new Set<string>();
  purchases.forEach((p: any) => {
    if (p.country) {
      p.country.split(",").forEach((c: string) => {
        const val = c.trim();
        if (val && val.toLowerCase() !== "all") {
          countriesSet.add(val);
        }
      });
    }
  });
  const totalCountries = countriesSet.size;

  // Leads by Niche grouping
  const nicheMap: { [niche: string]: number } = {};
  purchases.forEach((p: any) => {
    const niches = p.niche ? p.niche.split(",").map((x: string) => x.trim()).filter(Boolean) : [];
    if (niches.length > 0) {
      const share = (p.total_leads || 0) / niches.length;
      niches.forEach((n: string) => {
        const formattedN = n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
        nicheMap[formattedN] = (nicheMap[formattedN] || 0) + share;
      });
    } else {
      nicheMap["Other"] = (nicheMap["Other"] || 0) + (p.total_leads || 0);
    }
  });

  const chartData = Object.entries(nicheMap).map(([name, leads]) => ({
    name,
    leads: Math.round(leads)
  })).sort((a, b) => b.leads - a.leads);

  // Recent purchases signals feed
  const recentSignals = purchases.slice(0, 5).map((p: any, idx: number) => {
    const colors = ["bg-[#6366f1]", "bg-[#10b981]", "bg-[#a855f7]", "bg-amber-500", "bg-rose-500"];
    const defaultName = formatDateString(p.purchase_date);
    const name = p.name || `Dataset ${defaultName}`;
    return {
      store: name,
      action: `unlocked with ${p.total_leads || 0} leads (${p.niche || "All Niches"} in ${p.country || "All Countries"})`,
      time: formatDateString(p.purchase_date),
      color: colors[idx % colors.length]
    };
  });

  const stats = [
    {
      label: "TOTAL LEADS UNLOCKED",
      value: purchasesLoading ? "..." : totalLeads.toLocaleString(),
      Icon: Users,
      color: "bg-indigo-50 border-indigo-100/50 text-[#6366f1]"
    },
    {
      label: "UNIQUE NICHES",
      value: purchasesLoading ? "..." : totalNiches.toString(),
      Icon: Layers,
      color: "bg-orange-50 border-orange-100/50 text-orange-500"
    },
    {
      label: "SIGNALS TRACKED",
      value: purchasesLoading ? "..." : totalSignals.toString(),
      Icon: Radio,
      color: "bg-blue-50 border-blue-100/50 text-blue-500"
    },
    {
      label: "REGIONS SELECTED",
      value: purchasesLoading ? "..." : totalCountries.toString(),
      Icon: Globe,
      color: "bg-indigo-50 border-indigo-100/50 text-indigo-500"
    }
  ];

  return (
    <div className="min-h-screen px-6 py-10 max-w-6xl mx-auto space-y-8 select-none">
      
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Intelligence Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Live analytics and segment breakdown of your unlocked intelligence datasets.
          </p>
        </div>
        <Link
          href="/query"
          className="bg-[#6366f1] text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-[#4f46e5] shadow-md hover:shadow-indigo-500/15 transition-all flex items-center gap-2 group active:scale-[0.98]"
        >
          <Sparkles size={15} />
          <span>New Query</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {stats.map(({ label, value, Icon, color }, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0_12px_30px_-15px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-slate-200 transition-all duration-300"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${color} mb-5`}>
              <Icon className="w-5 h-5" strokeWidth={2.25} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                {label}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {purchasesLoading ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-20 flex flex-col items-center justify-center gap-2">
          <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-400">Loading intelligence dashboard...</span>
        </div>
      ) : purchases.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.02)] p-12 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-indigo-600 mx-auto">
            <TrendingUp size={22} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">Your Dashboard is Empty</h3>
            <p className="text-slate-500 text-xs leading-relaxed max-w-md mx-auto">
              You haven't unlocked any Shopify leads datasets yet. Use the Opportunity Finder to search by niche, country, or signals and unlock verified lead lists.
            </p>
          </div>
          <Link
            href="/query"
            className="inline-flex bg-[#6366f1] text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-[#4f46e5] transition-all cursor-pointer shadow-md hover:shadow-indigo-500/10 active:scale-[0.98]"
          >
            Go to Opportunity Finder
          </Link>
        </div>
      ) : (
        <>
          {/* Leads by Niche Card */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.02)] p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 pb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Leads by Niche</h3>
                <p className="text-slate-400 text-xs mt-0.5">Lead distribution across your unlocked market segments</p>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                {/* View Toggle */}
                <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/40">
                  <button
                    onClick={() => setViewType("chart")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewType === "chart"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Chart
                  </button>
                  <button
                    onClick={() => setViewType("table")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewType === "table"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Table
                  </button>
                </div>
              </div>
            </div>

            {/* View Content */}
            {viewType === "chart" ? (
              <div className="h-72 w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                    <XAxis 
                      dataKey="name" 
                      tickLine={false} 
                      axisLine={false} 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      fontWeight={600} 
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      fontWeight={600} 
                    />
                    <Tooltip cursor={{ fill: "#f8fafc" }} />
                    <Bar 
                      dataKey="leads" 
                      fill="#6366f1" 
                      radius={[4, 4, 0, 0]} 
                      barSize={32} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="w-full mt-6 overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/20">
                      <th className="px-6 py-4">Niche Name</th>
                      <th className="px-6 py-4 text-right">Leads Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700 font-semibold">
                    {chartData.map((d, i) => (
                      <tr key={i} className="hover:bg-slate-50/20 transition-colors">
                        <td className="px-6 py-4 text-slate-900">{d.name}</td>
                        <td className="px-6 py-4 text-right text-indigo-600">{d.leads.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Lead Signals Section */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.02)] p-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-5 mb-5">
              <div className="flex items-center gap-2">
                <Activity className="text-indigo-600 w-4 h-4" />
                <h3 className="text-base font-bold text-slate-900">Recent Library Unlocks</h3>
              </div>
              <Link href="/lead-library" className="text-[#6366f1] hover:text-[#4f46e5] text-xs font-bold hover:underline transition-all">
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-50">
              {recentSignals.map((sig, i) => (
                <div key={i} className="flex justify-between items-center py-4 first:pt-0 last:pb-0 hover:bg-slate-50/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${sig.color}`} />
                    <p className="text-sm font-semibold text-slate-600">
                      <strong className="text-slate-900 font-bold">{sig.store}</strong> {sig.action}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-medium shrink-0 ml-4">
                    {sig.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
