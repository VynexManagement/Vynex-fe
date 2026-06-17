"use client";

import React from "react";
import { Button } from "@leadflow/ui";

export function HeroSection() {
  const leads = [
    {
      name: "Trendsetter Threads",
      platform: "Shopify Plus",
      tool: "Klaviyo",
      toolBg: "bg-red-50 text-red-500 border border-red-100/50",
    },
    {
      name: "Eco Living Essentials",
      platform: "Shopify",
      tool: "LoyaltyLion",
      toolBg: "bg-blue-50 text-blue-500 border border-blue-100/50",
    },
    {
      name: "Tech Gadgets Co.",
      platform: "Shopify",
      tool: "Gorgias",
      toolBg: "bg-purple-50 text-purple-500 border border-purple-100/50",
    },
  ];

  return (
    <section className="w-full pt-20 md:pt-28 pb-16 flex flex-col items-center px-6 max-w-6xl mx-auto">
      {/* Hero Content */}
      <div className="text-center flex flex-col items-center max-w-4xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] max-w-3xl">
          Find High-Converting Shopify Leads Before Your Competitors Do
        </h1>
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed">
          Discover stores missing key growth tools and reach out with the perfect pitch.
        </p>
        
        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto px-8 py-3.5 text-base shadow-lg shadow-indigo-500/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
            onClick={() => (window.location.href = "http://localhost:3001/signup")}
          >
            Start Free Trial
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-8 py-3.5 text-base transition-all hover:scale-[1.01] active:scale-[0.99] border-slate-200 text-indigo-600 hover:bg-slate-50"
            onClick={() => (window.location.href = "#contact")}
          >
            Book a demo
          </Button>
        </div>
      </div>

      {/* Live Lead Preview Card */}
      <div className="mt-16 w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] overflow-hidden">
          
          {/* Browser header bar */}
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-white select-none">
            <div className="flex gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#ff5f56]"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-[#27c93f]"></span>
            </div>
            <div className="text-[10px] font-semibold text-slate-400 tracking-[0.2em] uppercase font-mono">
              LIVE LEAD PREVIEW
            </div>
            <div className="flex gap-1">
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            </div>
          </div>
          
          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none bg-slate-50/20">
                  <th className="px-8 py-4.5 font-semibold">Store Name</th>
                  <th className="px-8 py-4.5 font-semibold">Platform</th>
                  <th className="px-8 py-4.5 font-semibold">Missing Tools</th>
                  <th className="px-8 py-4.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                {leads.map((lead, i) => (
                  <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-5 font-bold text-slate-900">{lead.name}</td>
                    <td className="px-8 py-5 text-slate-500">{lead.platform}</td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${lead.toolBg}`}>
                        {lead.tool}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <a
                        href="http://localhost:3001/login"
                        className="text-[#6366f1] hover:text-[#4f46e5] font-bold text-sm transition-colors"
                      >
                        Reveal
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
