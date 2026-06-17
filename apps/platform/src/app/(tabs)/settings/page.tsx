"use client";

import React, { useEffect, useState } from "react";
import { 
  User, 
  Loader2, 
  ShieldCheck, 
  Lock
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { useProfile } from "@/features/dashboard/hooks/useProfile";
import { supabase } from "@/lib/supabase";

function SettingsContent() {
  const {
    profile,
    setProfile,
    loading: loadingProfile,
    saving: savingProfile,
    error: profileError,
    success: profileSuccess,
    saveProfile,
  } = useProfile();

  const [email, setEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email || "");
      }
    });
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile(profile);
  };

  const handleResetPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard`,
      });
      if (error) throw error;
      setResetSent(true);
      setTimeout(() => setResetSent(false), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to trigger password reset.");
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 max-w-6xl mx-auto space-y-8 select-none">
      
      {/* Top Header Row */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          System Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your lead intelligence engine and account preferences.
        </p>
      </div>

      {loadingProfile ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
          <Loader2 className="animate-spin w-6 h-6 text-indigo-600" />
          <span className="text-xs font-semibold">Loading settings...</span>
        </div>
      ) : (
        <div className="max-w-2xl bg-white border border-slate-100 rounded-2xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.02)] p-8">
          
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
            <User className="text-indigo-600 w-5 h-5" />
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-none">Account Settings</h2>
              <p className="text-slate-400 text-[11px] mt-1 font-semibold uppercase tracking-wider">Manage your personal information and security.</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* Full Name field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profile.name || ""}
                onChange={(e) => setProfile((prev: any) => ({ ...prev, name: e.target.value }))}
                placeholder="Alex Rivera"
                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-[#6366f1] text-sm transition-all duration-200"
              />
            </div>

            {/* Email Address field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-100/50 text-slate-400 text-sm focus:outline-none select-none"
              />
            </div>

            {/* Password Reset Section */}
            <div className="pt-6 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block">Password</span>
                <p className="text-slate-400 text-xs font-semibold">
                  Update your account password regularly for security.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetPassword}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-[0.98] select-none"
              >
                Reset Password
              </button>
            </div>

            {resetSent && (
              <div className="bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl text-xs font-semibold select-none">
                Password reset instruction link has been sent to your email.
              </div>
            )}

            {/* Form Footer Save Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                {profileSuccess && (
                  <span className="text-xs font-semibold text-emerald-600">Settings saved successfully!</span>
                )}
                {profileError && (
                  <span className="text-xs font-semibold text-red-500">{profileError}</span>
                )}
              </div>
              <button
                type="submit"
                disabled={savingProfile}
                className="bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-500/10 flex items-center gap-2 cursor-pointer active:scale-[0.98] select-none"
              >
                {savingProfile ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>

          </form>

        </div>
      )}

    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}
