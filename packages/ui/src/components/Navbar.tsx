"use client";

import * as React from "react";
import { Zap, Menu, X, LogOut, LayoutDashboard, Search } from "lucide-react";
import { cn } from "./utils";
import { Container } from "./Container";

export interface NavbarProps {
  isMarketing?: boolean;
  user?: { email?: string; name?: string } | null;
  onLogout?: () => Promise<void> | void;
  activePath?: string;
  loginUrl?: string;
  signupUrl?: string;
  dashboardUrl?: string;
  queryUrl?: string;
  homeUrl?: string;
}

export function Navbar({
  isMarketing = false,
  user = null,
  onLogout,
  activePath = "",
  loginUrl = "/login",
  signupUrl = "/signup",
  dashboardUrl = "/dashboard",
  queryUrl = "/query",
  homeUrl = "/",
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isActive = (path: string) => activePath === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100/80 transition-premium">
       <Container className="h-16 flex items-center justify-between">
        {/* Logo */}
        <a href={homeUrl} className="flex items-center gap-2 text-slate-900 font-bold text-xl select-none">
          <span className="font-extrabold text-2xl tracking-tight bg-slate-900 text-transparent bg-clip-text">
            LeadFlow
          </span>
        </a>

        {/* Center Links (Marketing vs App) */}
        <div className="hidden md:flex items-center gap-8">
          {isMarketing ? (
            <>
              <a
                href="/features"
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Features
              </a>
              <a
                href="/pricing"
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Pricing
              </a>
              <a
                href="/contact"
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Contact Us
              </a>
            </>
          ) : (
            <>
              <a
                href={queryUrl}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium transition-colors",
                  isActive(queryUrl) ? "text-[#6366f1]" : "text-slate-500 hover:text-slate-900"
                )}
              >
                <Search size={15} /> Find Leads
              </a>
              {user && (
                <a
                  href={dashboardUrl}
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium transition-colors",
                    isActive(dashboardUrl) ? "text-[#6366f1]" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  <LayoutDashboard size={15} /> Dashboard
                </a>
              )}
            </>
          )}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isMarketing ? (
            <>
              <a
                href={loginUrl}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Login
              </a>
              <a
                href={signupUrl}
                className="bg-[#6366f1] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#4f46e5] shadow-sm hover:shadow-indigo-500/15 transition-premium"
              >
                Get Started
              </a>
            </>
          ) : (
            <>
              {user ? (
                <>
                  <span className="text-xs text-slate-500 font-medium max-w-[160px] truncate">
                    {user.name || user.email}
                  </span>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 transition-colors font-medium cursor-pointer"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <a
                    href={loginUrl}
                    className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Login
                  </a>
                  <a
                    href={signupUrl}
                    className="bg-[#6366f1] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#4f46e5] shadow-sm hover:shadow-indigo-500/15 transition-premium"
                  >
                    Get Started
                  </a>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-slate-500 hover:text-slate-900 p-1.5"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      
      
      </Container>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white p-4 space-y-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {isMarketing ? (
            <div className="flex flex-col gap-3.5">
              <a
                href="/features"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="/pricing"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="/contact"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                Contact Us
              </a>
              <hr className="border-slate-100" />
              <div className="flex items-center gap-4">
                <a
                  href={loginUrl}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </a>
                <a
                  href={signupUrl}
                  className="bg-[#6366f1] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#4f46e5] transition-premium"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              <a
                href={queryUrl}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium",
                  isActive(queryUrl) ? "text-[#6366f1]" : "text-slate-600"
                )}
                onClick={() => setMenuOpen(false)}
              >
                <Search size={15} /> Find Leads
              </a>
              {user && (
                <a
                  href={dashboardUrl}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium",
                    isActive(dashboardUrl) ? "text-[#6366f1]" : "text-slate-600"
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard size={15} /> Dashboard
                </a>
              )}
              <hr className="border-slate-100" />
              {user ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 truncate max-w-[150px]">
                    {user.name || user.email}
                  </span>
                  <button
                    onClick={() => {
                      onLogout?.();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-1.5 text-sm text-red-500 font-medium cursor-pointer"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <a
                    href={loginUrl}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </a>
                  <a
                    href={signupUrl}
                    className="bg-[#6366f1] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#4f46e5]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Get Started
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
