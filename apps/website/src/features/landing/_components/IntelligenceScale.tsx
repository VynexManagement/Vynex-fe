"use client";

import React from "react";

export function IntelligenceScale() {
  return (
    <section className="w-full py-24 md:py-32 relative overflow-hidden flex flex-col items-center px-6 bg-white z-0">
      {/* Centered Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full bg-gradient-to-r from-amber-100/35 via-rose-100/40 to-indigo-100/35 opacity-80 blur-[90px] pointer-events-none -z-10 select-none"></div>
      
      {/* Content */}
      <div className="max-w-3xl text-center relative z-10 select-none">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
          Intelligence at Scale
        </h2>
        <p className="mt-6 text-slate-500 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
          Stop guessing. Start knowing. Our platform processes millions of data points to deliver actionable insights directly to your CRM.
        </p>
      </div>
    </section>
  );
}
