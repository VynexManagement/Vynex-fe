"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Zap, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@leadflow/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center px-4 select-none">
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Sign in to access your leads</p>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.03)] space-y-6">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100/50 text-red-600 px-4 py-3 rounded-xl text-xs font-semibold">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="login-email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-[#6366f1] text-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="login-password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-[#6366f1] text-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-indigo-500/10 flex justify-center items-center gap-2 mt-6 active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Sign In"}
            </button>
          </form>

          {/* Links */}
          <p className="text-center text-xs text-slate-400 font-semibold pt-2">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#6366f1] hover:text-[#4f46e5] hover:underline font-bold">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
