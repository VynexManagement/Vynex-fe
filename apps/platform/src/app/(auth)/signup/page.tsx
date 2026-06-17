"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Zap, Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@leadflow/ui";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [purpose, setPurpose] = useState("");
  const [phone, setPhone] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!purpose) {
      setError("Please select a purpose.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          name,
          org,
          purpose,
          phone
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center px-4 select-none">
        <div className="bg-white border border-slate-100 w-full max-w-md p-10 text-center space-y-5 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.03)]">
          <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100/50 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9 text-[#6366f1]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Check your email</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            We sent a confirmation link to{" "}
            <span className="text-slate-800 font-bold">{email}</span>.
            Click it to activate your account then{" "}
            <Link href="/login" className="text-[#6366f1] hover:underline font-bold">
              sign in
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center py-12 px-4 select-none">
      <div className="w-full max-w-md space-y-8">
        
        {/* Logo Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shadow-sm">
              <Zap className="text-[#6366f1] w-5 h-5" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              LeadFlow
            </span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Start finding high-value Shopify leads today</p>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.03)] space-y-5">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100/50 text-red-600 px-4 py-3 rounded-xl text-xs font-semibold">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Email Address <span className="text-[#6366f1]">*</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-[#6366f1] text-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-1.5">
              <label htmlFor="signup-name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Full Name <span className="text-[#6366f1]">*</span>
              </label>
              <input
                id="signup-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-[#6366f1] text-sm transition-all duration-200"
              />
            </div>

            {/* Org and Phone fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="signup-org" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Organization
                </label>
                <input
                  id="signup-org"
                  type="text"
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-[#6366f1] text-sm transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="signup-phone" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Phone
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-[#6366f1] text-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Purpose field */}
            <div className="space-y-1.5">
              <label htmlFor="signup-purpose" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Purpose <span className="text-[#6366f1]">*</span>
              </label>
              <div className="relative">
                <select
                  id="signup-purpose"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-[#6366f1] text-sm transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select your purpose...</option>
                  <option value="Marketing Agency">Marketing Agency</option>
                  <option value="D2C Brand">D2C Brand</option>
                  <option value="E-commerce Founder">E-commerce Founder</option>
                  <option value="Sales/Lead Gen">Sales/Lead Gen</option>
                  <option value="Other">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  ▼
                </div>
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label htmlFor="signup-password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Password <span className="text-[#6366f1]">*</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="signup-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-[#6366f1] text-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="space-y-1.5">
              <label htmlFor="signup-confirm" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Confirm Password <span className="text-[#6366f1]">*</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="signup-confirm"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-[#6366f1] text-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-indigo-500/10 flex justify-center items-center gap-2 mt-6 active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Create Account"}
            </button>
          </form>

          {/* Links */}
          <p className="text-center text-xs text-slate-400 font-semibold pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-[#6366f1] hover:text-[#4f46e5] hover:underline font-bold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
