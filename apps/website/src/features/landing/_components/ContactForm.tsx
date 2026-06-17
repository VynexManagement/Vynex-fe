"use client";

import React, { useState } from "react";
import { Mail, Calendar } from "lucide-react";
import { Button } from "@leadflow/ui";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="w-full py-24 bg-white flex flex-col items-center px-6">
      <div className="max-w-xl w-full text-center mb-10 select-none">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          Get in Touch
        </h2>
        <p className="mt-3 text-slate-500 text-base">
          Have questions? We're here to help you scale your Shopify agency.
        </p>
      </div>

      <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-100/80 p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.03)]">
        {submitted ? (
          <div className="text-center py-12 select-none">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-500 border border-green-100/50 mb-4 font-bold">
              ✓
            </div>
            <h3 className="text-lg font-bold text-slate-900">Message Received!</h3>
            <p className="text-slate-500 mt-2 text-sm">We'll get back to you within 24 hours.</p>
            <Button
              variant="outline"
              className="mt-6 text-sm border-slate-200"
              onClick={() => setSubmitted(false)}
            >
              Send another message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  placeholder="Jane Doe"
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-[#6366f1] text-sm transition-all duration-200"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="jane@agency.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-[#6366f1] text-sm transition-all duration-200"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                required
                placeholder="How can we help?"
                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-[#6366f1] text-sm transition-all duration-200 resize-none"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3.5 text-sm bg-[#6366f1] hover:bg-[#4f46e5] shadow-lg shadow-indigo-500/10 transition-all duration-200 active:scale-[0.98]"
            >
              Send Message
            </Button>
          </form>
        )}

        {/* Form Bottom Contacts Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 mt-8 border-t border-slate-100 gap-4">
          <a
            href="mailto:hello@leadflow.io"
            className="flex items-center gap-2 text-slate-500 hover:text-[#6366f1] transition-colors text-sm font-medium"
          >
            <Mail className="w-4 h-4 text-indigo-500" strokeWidth={2} />
            <span>hello@leadflow.io</span>
          </a>
          <a
            href="https://calendly.com/leadflow"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-500 hover:text-[#6366f1] transition-colors text-sm font-medium"
          >
            <Calendar className="w-4 h-4 text-indigo-500" strokeWidth={2} />
            <span>Book a Strategy Call</span>
          </a>
        </div>
      </div>
    </section>
  );
}
