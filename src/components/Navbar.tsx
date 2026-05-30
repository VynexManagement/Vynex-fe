"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Database, Zap, LogOut, LayoutDashboard, Search, Menu, X } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ email?: string; user_metadata?: { name?: string } } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log(session?.user)
      setUser(session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
        background: "rgba(255, 255, 255, 0)",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-[#eeeeee] font-bold text-xl">
          <Zap className="text-[#00adb5] w-6 h-6" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00adb5] to-[#ffd6ba]">
            LeadFlow
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/query"
            className={`nav-link flex items-center gap-1.5 text-sm font-medium transition-colors ${isActive("/query") ? "text-[#00adb5]" : "text-[#eeeeee]/60 hover:text-[#eeeeee]"
              }`}
          >
            <Search size={15} /> Find Leads
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className={`nav-link flex items-center gap-1.5 text-sm font-medium transition-colors ${isActive("/dashboard") ? "text-[#00adb5]" : "text-[#eeeeee]/60 hover:text-[#eeeeee]"
                }`}
            >
              <LayoutDashboard size={15} /> Dashboard
            </Link>
          )}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-xs text-[#eeeeee]/80 truncate max-w-[160px]">
                {user.user_metadata?.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-[#eeeeee]/50 hover:text-[#ffdcdc] transition-colors"
              >
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-[#eeeeee]/60 hover:text-[#eeeeee] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="btn-primary text-sm px-4 py-2 rounded-full font-semibold"
              >
                Sign Up Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-[#eeeeee]/60 hover:text-[#eeeeee]"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass-card mx-4 mb-4 p-4 space-y-3">
          <Link
            href="/query"
            className="flex items-center gap-2 text-sm text-[#eeeeee]/70 hover:text-[#eeeeee]"
            onClick={() => setMenuOpen(false)}
          >
            <Search size={15} /> Find Leads
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-[#eeeeee]/70 hover:text-[#eeeeee]"
              onClick={() => setMenuOpen(false)}
            >
              <LayoutDashboard size={15} /> Dashboard
            </Link>
          )}
          <hr className="border-[#00adb5]/15" />
          {user ? (
            <button
              onClick={() => { handleLogout(); setMenuOpen(false); }}
              className="flex items-center gap-2 text-sm text-[#ffdcdc]/80"
            >
              <LogOut size={15} /> Logout
            </button>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/login"
                className="text-sm text-[#eeeeee]/60"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="btn-primary text-sm px-4 py-2 rounded-full font-semibold"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
