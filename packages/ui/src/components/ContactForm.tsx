"use client";

import * as React from "react";
import { Button } from "./Button";

export function ContactForm() {
  const [submitted, setSubmitted] = React.useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="w-full py-24 bg-white flex flex-col items-center px-6 transition-premium">
      <div className="max-w-xl w-full text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          Get in Touch
        </h2>
        <p className="mt-3 text-slate-500">
          Have questions? We're here to help you scale your Shopify agency.
        </p>
      </div>

      <div className="max-w-xl w-full premium-shadow-card p-8 bg-white border border-slate-100/80">
        {submitted ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-500 mb-4">
              ✓
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Message Sent!</h3>
            <p className="text-slate-500 mt-2 text-sm">We'll get back to you within 24 hours.</p>
            <Button variant="outline" className="mt-6 text-sm" onClick={() => setSubmitted(false)}>
              Send another message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  placeholder="Jane Doe"
                  className="w-full px-4 py-3 rounded-lg border border-slate-100 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] text-sm transition-all"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="jane@agency.com"
                  className="w-full px-4 py-3 rounded-lg border border-slate-100 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] text-sm transition-all"
                />
              </div>
            </div>
            <div>
              <label htmlFor="message" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Message (Optional)
              </label>
              <textarea
                id="message"
                rows={4}
                placeholder="How can we help you?"
                className="w-full px-4 py-3 rounded-lg border border-slate-100 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] text-sm transition-all resize-none"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full py-3 text-sm">
              Send Message
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
