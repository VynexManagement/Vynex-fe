"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, Code, LogOut, Loader2, ShieldCheck, Zap, Database, CreditCard, LayoutDashboard } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login?redirect=/admin");
      return;
    }

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
      <div className="min-h-screen flex items-center justify-center bg-[#191919]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#191919] px-4">
        <div className="double-bezel-outer max-w-md w-full">
          <div className="double-bezel-inner p-8 text-center space-y-6">
            <ShieldCheck className="w-12 h-12 text-red-400 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#fafafa] tracking-tight">Access Denied</h2>
              <p className="text-xs text-[#eeeeee]/45 leading-relaxed">
                You do not have administration privileges to view this area.
              </p>
            </div>
            <Link href="/dashboard" className="btn-primary px-6 py-2.5 rounded inline-block font-bold text-xs">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#191919] flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#2f2f2f] bg-[#202020] flex flex-col shrink-0">
        <div className="p-6 border-b border-[#2f2f2f]">
          <Link href="/" className="inline-flex items-center gap-2">
            <Zap className="text-white w-5 h-5 shrink-0" />
            <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-[#a3a3a3] tracking-tight">
              LeadFlow Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {[
            { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={14} /> },
            { name: "Leads", path: "/admin/leads", icon: <Users size={14} /> },
            { name: "Dataset Builder", path: "/admin/dataset-builder", icon: <Database size={14} /> },
            { name: "Scraper Control", path: "/admin/scraper", icon: <Code size={14} /> },
            { name: "Signal Engine", path: "/admin/signals", icon: <Zap size={14} /> },
            { name: "Orders", path: "/admin/orders", icon: <CreditCard size={14} /> },
            { name: "Data Quality", path: "/admin/data-quality", icon: <ShieldCheck size={14} /> },
            { name: "Users", path: "/admin/users", icon: <Users size={14} /> },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3.5 rounded text-xs font-bold transition-premium hover:-translate-y-0.5 active:scale-[0.98] group border ${
                pathname.startsWith(item.path)
                  ? "bg-[#2f2f2f] border-[#3f3f3f] text-white"
                  : "text-[#a3a3a3] border-transparent hover:bg-[#191919] hover:text-white"
              }`}
            >
              <span className={`transition-all duration-300 shrink-0 ${
                pathname.startsWith(item.path) ? "text-white scale-105" : "text-[#a3a3a3] group-hover:text-white"
              }`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#2f2f2f]">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3.5 w-full rounded text-xs font-bold text-red-400/80 border border-transparent hover:bg-red-500/10 hover:border-red-500/20 transition-premium shrink-0 cursor-pointer"
          >
            <LogOut size={14} className="shrink-0 text-red-400/60" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
