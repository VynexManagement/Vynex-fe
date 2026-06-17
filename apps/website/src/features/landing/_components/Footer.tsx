"use client";

import React from "react";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full bg-white border-t border-slate-100 py-16 px-6 select-none">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
        
        {/* Left Column */}
        <div className="space-y-3">
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            LeadFlow
          </span>
          <p className="text-sm text-slate-400">
            © {year} LeadFlow Intelligence. All rights reserved.
          </p>
        </div>
        
        {/* Right Column */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-500 tracking-wider">
            Product
          </h4>
          <ul className="space-y-3 text-sm text-slate-400 font-medium">
            <li>
              <a href="/features" className="hover:text-[#6366f1] transition-colors duration-200">
                Features
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-[#6366f1] transition-colors duration-200">
                Contact Us
              </a>
            </li>
          </ul>
        </div>
        
      </div>
    </footer>
  );
}
