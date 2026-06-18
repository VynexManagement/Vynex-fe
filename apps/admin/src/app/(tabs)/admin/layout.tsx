"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, LogOut, Loader2, ShieldCheck, Zap, CreditCard, LayoutDashboard, ChevronLeft, ChevronRight, BookOpen, Settings, Sliders } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<{ email?: string; name?: string; initials?: string }>({
    email: "",
    name: "Admin",
    initials: "AD"
  });
  
  const pathname = usePathname();
  const router = useRouter();

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login?redirect=/admin");
      return;
    }

    // Load admin email and details
    const email = session.user.email || "";
    const name = session.user.user_metadata?.name || email.split("@")[0] || "Admin";
    const initials = name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    setUser({ email, name, initials });

    // Check if user is admin in profiles
    const { data, error } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", session.user.id)
      .single();

    if (error || !data?.user_id) {
      setIsAdmin(false);
    } else {
      setIsAdmin(true);
    }
  };

  useEffect(() => {
    checkAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6366f1]" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
        <div className="max-w-md w-full border border-slate-100 bg-white rounded-2xl shadow-sm p-8 text-center space-y-6">
          <ShieldCheck className="w-12 h-12 text-red-500 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Access Denied</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              You do not have administration privileges to view this area.
            </p>
          </div>
          <Link href="/dashboard" className="btn-primary px-6 py-2.5 rounded-xl inline-block font-bold text-xs">
            Go to Client Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Lead Library", path: "/admin/leads", icon: BookOpen },
    { name: "Scraper Control", path: "/admin/scraper", icon: Sliders },
    { name: "Signal Engine", path: "/admin/signals", icon: Zap },
    { name: "Dataset Orders", path: "/admin/orders", icon: CreditCard },
    { name: "Data Quality", path: "/admin/data-quality", icon: ShieldCheck },
    { name: "Customers", path: "/admin/users", icon: Users },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex font-sans antialiased">
      {/* Sidebar */}
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
                  Admin Portal
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 space-y-1.5 py-6">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 border ${
                  isActive
                    ? "bg-indigo-50/45 text-[#6366f1] border-indigo-100/40 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-800 hover:bg-slate-50 border-transparent font-medium"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.25 : 1.75} />
                {!isCollapsed && <span className="text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer Profile & Logout */}
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
        <div className="w-full min-h-screen p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
