"use client";

import React from "react";
import { Check } from "lucide-react";
import { Button } from "@leadflow/ui";

export function PricingGrid() {
  return (
    <section id="pricing" className="w-full py-24 md:py-32 flex flex-col items-center px-6 bg-white">
      <div className="max-w-4xl text-center mb-20 select-none">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Simple, transparent pricing.
        </h2>
        <p className="mt-3 text-slate-500 text-base md:text-lg">
          Start for free, upgrade when you need more.
        </p>
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        
        {/* Card 1: Starter */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100/80 shadow-[0_10px_35px_-12px_rgba(0,0,0,0.03)] flex flex-col hover:border-slate-200 transition-all duration-300">
          <h3 className="text-xl font-bold text-slate-900">Starter</h3>
          <p className="text-slate-400 text-xs mt-1">For individuals starting out.</p>
          <div className="my-8 flex items-baseline">
            <span className="text-4xl md:text-5xl font-extrabold text-slate-900">$0</span>
            <span className="text-slate-400 text-sm ml-2">/mo</span>
          </div>
          <ul className="space-y-4 text-sm text-slate-600 mb-8 flex-grow">
            <li className="flex items-center gap-3">
              <Check className="text-indigo-600 w-4 h-4 shrink-0" strokeWidth={2.5} />
              <span>100 Leads / month</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="text-indigo-600 w-4 h-4 shrink-0" strokeWidth={2.5} />
              <span>Basic Filtering</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="text-indigo-600 w-4 h-4 shrink-0" strokeWidth={2.5} />
              <span>CSV Export</span>
            </li>
          </ul>
          <Button
            variant="outline"
            className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 active:scale-[0.98]"
            onClick={() => (window.location.href = "http://localhost:3001/signup")}
          >
            Get Started
          </Button>
        </div>

        {/* Card 2: Pro */}
        <div className="bg-white p-8 rounded-2xl border-2 border-[#6366f1] relative flex flex-col shadow-[0_20px_50px_-12px_rgba(99,102,241,0.1)] hover:shadow-[0_20px_50px_-12px_rgba(99,102,241,0.15)] transition-all duration-300">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#6366f1] text-white text-[9px] font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-md select-none">
            MOST POPULAR
          </div>
          <h3 className="text-xl font-bold text-slate-900">Pro</h3>
          <p className="text-slate-400 text-xs mt-1">For growing agencies.</p>
          <div className="my-8 flex items-baseline">
            <span className="text-4xl md:text-5xl font-extrabold text-slate-900">$49</span>
            <span className="text-slate-400 text-sm ml-2">/mo</span>
          </div>
          <ul className="space-y-4 text-sm text-slate-600 mb-8 flex-grow">
            <li className="flex items-center gap-3">
              <Check className="text-indigo-600 w-4 h-4 shrink-0" strokeWidth={2.5} />
              <span>5,000 Leads / month</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="text-indigo-600 w-4 h-4 shrink-0" strokeWidth={2.5} />
              <span>Advanced Niche Filters</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="text-indigo-600 w-4 h-4 shrink-0" strokeWidth={2.5} />
              <span>CRM Integrations</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="text-indigo-600 w-4 h-4 shrink-0" strokeWidth={2.5} />
              <span>Priority Support</span>
            </li>
          </ul>
          <Button
            variant="primary"
            className="w-full bg-[#6366f1] hover:bg-[#4f46e5] shadow-lg shadow-indigo-500/10 transition-all duration-200 active:scale-[0.98]"
            onClick={() => (window.location.href = "http://localhost:3001/signup")}
          >
            Start Free Trial
          </Button>
        </div>

        {/* Card 3: Scale */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100/80 shadow-[0_10px_35px_-12px_rgba(0,0,0,0.03)] flex flex-col hover:border-slate-200 transition-all duration-300">
          <h3 className="text-xl font-bold text-slate-900">Scale</h3>
          <p className="text-slate-400 text-xs mt-1">For large sales teams.</p>
          <div className="my-8 flex items-baseline">
            <span className="text-4xl md:text-5xl font-extrabold text-slate-900">$199</span>
            <span className="text-slate-400 text-sm ml-2">/mo</span>
          </div>
          <ul className="space-y-4 text-sm text-slate-600 mb-8 flex-grow">
            <li className="flex items-center gap-3">
              <Check className="text-indigo-600 w-4 h-4 shrink-0" strokeWidth={2.5} />
              <span>Unlimited Leads</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="text-indigo-600 w-4 h-4 shrink-0" strokeWidth={2.5} />
              <span>API Access</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="text-indigo-600 w-4 h-4 shrink-0" strokeWidth={2.5} />
              <span>Custom Data Enrichment</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="text-indigo-600 w-4 h-4 shrink-0" strokeWidth={2.5} />
              <span>Dedicated Account Manager</span>
            </li>
          </ul>
          <Button
            variant="outline"
            className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 active:scale-[0.98]"
            onClick={() => (window.location.href = "#contact")}
          >
            Contact Sales
          </Button>
        </div>

      </div>
    </section>
  );
}
