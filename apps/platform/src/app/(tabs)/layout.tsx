"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Search, 
  BookOpen, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Zap 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<{ email?: string; name?: string; initials?: string }>({
    email: "",
    name: "User",
    initials: "US"
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const email = user.email || "";
        const name = user.user_metadata?.name || user.email?.split("@")[0] || "User";
        const initials = name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();
        setUser({ email, name, initials });
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      Icon: LayoutDashboard,
      isActive: pathname === "/dashboard"
    },
    {
      label: "Opportunity Finder",
      path: "/query",
      Icon: Search,
      // Opportunity Finder includes sub-routes /query, /preview, and /payment
      isActive: pathname === "/query" || pathname === "/preview" || pathname === "/payment"
    },
    {
      label: "Lead Library",
      path: "/lead-library",
      Icon: BookOpen,
      isActive: pathname === "/lead-library"
    },
    {
      label: "Settings",
      path: "/settings",
      Icon: Settings,
      isActive: pathname === "/settings"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex font-sans antialiased">
      {/* Sidebar Wrapper */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col justify-between bg-white border-r border-slate-100 transition-all duration-300 select-none ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-8 -right-3.5 w-7 h-7 rounded-full border border-slate-100 bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors z-40 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        {/* Top Branding Section */}
        <div className="p-6">
          {isCollapsed ? (
            <div className="flex justify-center items-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center">
                <Zap className="text-[#6366f1] w-5 h-5" strokeWidth={2.5} />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shrink-0">
                <Zap className="text-[#6366f1] w-5 h-5" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">
                  LeadFlow
                </span>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                  Lead Intelligence
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 space-y-1.5 py-6">
          {navItems.map(({ label, path, Icon, isActive }) => (
            <a
              key={path}
              href={path}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-indigo-50/45 text-[#6366f1] border border-indigo-100/40 font-semibold"
                  : "text-slate-400 hover:text-slate-800 hover:bg-slate-50 border border-transparent font-medium"
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.25 : 1.75} />
              {!isCollapsed && <span className="text-sm">{label}</span>}
            </a>
          ))}
        </nav>

        {/* User profile & Logout Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/30 space-y-4.5">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                {user.initials}
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                  {user.initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-slate-900 truncate leading-none mb-1">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 truncate">
                    {user.email}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100/30 transition-all text-sm font-semibold cursor-pointer"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-300 min-h-screen ${
          isCollapsed ? "pl-20" : "pl-64"
        }`}
      >
        <div className="w-full min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}