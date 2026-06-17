"use client";

import React from "react";
import { Button } from "@leadflow/ui";

export function CTASection() {
  return (
    <section className="w-full py-24 bg-gradient-to-b from-white via-indigo-50/10 to-indigo-50/40 border-t border-slate-100 flex flex-col items-center text-center px-6">
      <div className="max-w-2xl select-none flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
          Ready to scale your outreach?
        </h2>
        <p className="mt-4 text-slate-500 text-base md:text-lg max-w-lg leading-relaxed">
          Join thousands of sales teams who are already closing more deals with LeadFlow.
        </p>
        <Button
          variant="primary"
          className="mt-8 px-8 py-3.5 bg-[#6366f1] hover:bg-[#4f46e5] shadow-lg shadow-indigo-500/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
          size="lg"
          onClick={() => (window.location.href = "http://localhost:3001/signup")}
        >
          Get Started Now
        </Button>
      </div>
    </section>
  );
}
