"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Zap, Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card w-full max-w-md p-10 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#00adb5]/15 border border-[#00adb5]/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9 text-[#00adb5]" />
          </div>
          <h2 className="text-2xl font-bold text-[#eeeeee]">Check your email</h2>
          <p className="text-[#eeeeee]/50">
            We sent a confirmation link to{" "}
            <span className="text-[#eeeeee] font-semibold">{email}</span>.
            Click it to activate your account then{" "}
            <Link href="/login" className="text-[#00adb5] hover:underline">
              sign in
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-[#eeeeee]">Create your account</h1>
          <p className="text-[#eeeeee]/50 mt-2">Start finding high-value Shopify leads today</p>
        </div>

        <div className="glass-card p-8 space-y-5">
          {error && (
            <div className="flex items-start gap-2 bg-[#ffdcdc]/08 border border-[#ffdcdc]/25 text-[#ffdcdc] px-4 py-3 rounded-xl text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#eeeeee]/55">Email <span className="text-[#00adb5]">*</span></label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#eeeeee]/35" />
                <input
                  id="signup-email"
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
              <label className="text-sm font-semibold text-[#eeeeee]/55">Full Name <span className="text-[#00adb5]">*</span></label>
              <input
                id="signup-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-[#393e46]/50 border border-[#00adb5]/18 rounded-xl px-4 py-3 text-[#eeeeee] placeholder-[#eeeeee]/25 focus:outline-none focus:ring-2 focus:ring-[#00adb5] transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#eeeeee]/55">Organization</label>
                <input
                  id="signup-org"
                  type="text"
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-[#393e46]/50 border border-[#00adb5]/18 rounded-xl px-4 py-3 text-[#eeeeee] placeholder-[#eeeeee]/25 focus:outline-none focus:ring-2 focus:ring-[#00adb5] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#eeeeee]/55">Phone</label>
                <input
                  id="signup-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-[#393e46]/50 border border-[#00adb5]/18 rounded-xl px-4 py-3 text-[#eeeeee] placeholder-[#eeeeee]/25 focus:outline-none focus:ring-2 focus:ring-[#00adb5] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#eeeeee]/55">Purpose <span className="text-[#00adb5]">*</span></label>
              <select
                id="signup-purpose"
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-[#393e46]/50 border border-[#00adb5]/18 rounded-xl px-4 py-3 text-[#eeeeee] focus:outline-none focus:ring-2 focus:ring-[#00adb5] transition-all appearance-none"
              >
                <option value="" disabled>Select your purpose...</option>
                <option value="Marketing Agency">Marketing Agency</option>
                <option value="D2C Brand">D2C Brand</option>
                <option value="E-commerce Founder">E-commerce Founder</option>
                <option value="Sales/Lead Gen">Sales/Lead Gen</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#eeeeee]/55">Password <span className="text-[#00adb5]">*</span></label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#eeeeee]/35" />
                <input
                  id="signup-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full bg-[#393e46]/50 border border-[#00adb5]/18 rounded-xl pl-10 pr-4 py-3 text-[#eeeeee] placeholder-[#eeeeee]/25 focus:outline-none focus:ring-2 focus:ring-[#00adb5] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#eeeeee]/55">Confirm Password <span className="text-[#00adb5]">*</span></label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#eeeeee]/35" />
                <input
                  id="signup-confirm"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full bg-[#393e46]/50 border border-[#00adb5]/18 rounded-xl pl-10 pr-4 py-3 text-[#eeeeee] placeholder-[#eeeeee]/25 focus:outline-none focus:ring-2 focus:ring-[#00adb5] transition-all"
                />
              </div>
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 rounded-xl font-bold text-base flex justify-center items-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-[#eeeeee]/40">
            Already have an account?{" "}
            <Link href="/login" className="text-[#00adb5] hover:text-[#00c5ce] font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
