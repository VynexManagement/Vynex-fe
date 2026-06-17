"use client";

import React from "react";
import { Target, Filter, Eye, Code, Globe, Download } from "lucide-react";

export function FeatureGrid() {
  const features = [
    {
      Icon: Target,
      title: "Signal-Based Targeting",
      desc: "Find stores actively installing or removing competitor apps. Timing is everything.",
    },
    {
      Icon: Filter,
      title: "Niche Filters",
      desc: "Filter by revenue estimates, traffic, tech stack, and industry to build hyper-targeted lists.",
    },
    {
      Icon: Eye,
      title: "Instant Preview",
      desc: "Get a deep dive into any store's anatomy before you even draft an email.",
    },
    {
      Icon: Code,
      title: "Structured Data",
      desc: "Clean, enriched data ready to feed directly into your sales workflows.",
    },
    {
      Icon: Globe,
      title: "Global Coverage",
      desc: "Track ecommerce stores across the globe, not just North America.",
    },
    {
      Icon: Download,
      title: "One-Click Export",
      desc: "Export to CSV or excel sheet conveniently",
    },
  ];

  return (
    <section id="features" className="w-full py-24 bg-slate-50/20 border-y border-slate-100 flex flex-col items-center px-6">
      <div className="max-w-4xl text-center mb-16 select-none">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Everything you need to close more deals.
        </h2>
        <p className="mt-3 text-slate-500 text-base md:text-lg">
          Built for speed, accuracy, and scale.
        </p>
      </div>

      <div className="max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {features.map(({ Icon, title, desc }, i) => (
          <div
            key={i}
            className="group bg-white border border-slate-100 p-8 rounded-2xl shadow-[0_10px_35px_-12px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_-12px_rgba(99,102,241,0.05)] hover:border-slate-200/80 transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-50/70 border border-indigo-100/50 flex items-center justify-center mb-6 group-hover:bg-indigo-100/60 transition-colors duration-300">
              <Icon className="w-5.5 h-5.5 text-indigo-600" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2.5">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
