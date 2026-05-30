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
      <div className="min-h-screen flex items-center justify-center bg-[#222831]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00adb5]" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#222831] px-4">
        <div className="glass-card max-w-md p-8 text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-[#ffdcdc] mx-auto" />
          <h2 className="text-2xl font-bold text-[#eeeeee]">Access Denied</h2>
          <p className="text-[#eeeeee]/60">You do not have administration privileges to view this area.</p>
          <Link href="/dashboard" className="btn-primary px-6 py-2 rounded-xl inline-block mt-4">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222831] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#00adb5]/20 bg-[#393e46]/40 flex flex-col">
        <div className="p-6 border-b border-[#00adb5]/20">
          <Link href="/" className="inline-flex items-center gap-2">
            <Zap className="text-[#00adb5] w-6 h-6" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00adb5] to-[#ffd6ba]">
              LeadFlow Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
            { name: "Leads", path: "/admin/leads", icon: <Code size={18} /> },
            { name: "Dataset Builder", path: "/admin/dataset-builder", icon: <Database size={18} /> },
            { name: "Scraper Control", path: "/admin/scraper", icon: <Code size={18} /> },
            { name: "Signal Engine", path: "/admin/signals", icon: <Zap size={18} /> },
            { name: "Orders", path: "/admin/orders", icon: <CreditCard size={18} /> },
            { name: "Data Quality", path: "/admin/data-quality", icon: <ShieldCheck size={18} /> },
            { name: "Users", path: "/admin/users", icon: <Users size={18} /> },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                pathname.startsWith(item.path)
                  ? "bg-[#00adb5]/20 text-[#00adb5] font-semibold" 
                  : "text-[#eeeeee]/60 hover:bg-[#393e46] hover:text-[#eeeeee]"
              }`}
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#00adb5]/20">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-[#ffdcdc]/80 hover:bg-[#ffdcdc]/10 transition-colors"
          >
            <LogOut size={18} /> Logout
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
