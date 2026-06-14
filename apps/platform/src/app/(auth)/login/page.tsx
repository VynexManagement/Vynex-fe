"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Zap, Mail, Lock, Loader2, AlertCircle } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          {/* <div className="inline-flex items-center gap-2 mb-4">
            <Zap className="text-[#00adb5] w-7 h-7" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00adb5] to-[#ffd6ba]">
              LeadFlow
            </span>
          </div> */}
          <h1 className="text-3xl font-bold text-[#eeeeee]">Welcome back</h1>
          <p className="text-[#eeeeee]/50 mt-2">Sign in to access your leads</p>
        </div>

        <div className="glass-card p-8 space-y-5">
          {error && (
            <div className="flex items-start gap-2 bg-[#ffdcdc]/08 border border-[#ffdcdc]/25 text-[#ffdcdc] px-4 py-3 rounded-xl text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#eeeeee]/55">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#eeeeee]/35" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#393e46]/50 border border-[#00adb5]/18 rounded-xl pl-10 pr-4 py-3 text-[#eeeeee] placeholder-[#eeeeee]/25 focus:outline-none focus:ring-2 focus:ring-[#00adb5] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-[#eeeeee]/55">Password</label>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#eeeeee]/35" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#393e46]/50 border border-[#00adb5]/18 rounded-xl pl-10 pr-4 py-3 text-[#eeeeee] placeholder-[#eeeeee]/25 focus:outline-none focus:ring-2 focus:ring-[#00adb5] transition-all"
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 rounded-xl font-bold text-base flex justify-center items-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-[#eeeeee]/40">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#00adb5] hover:text-[#00c5ce] font-semibold">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
