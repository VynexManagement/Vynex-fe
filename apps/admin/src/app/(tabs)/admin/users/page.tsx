"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, UserX, UserCheck, SlidersHorizontal, Plus, Mail, ShoppingBag, CreditCard, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { API_URL } from "@/lib/api";

interface Profile {
  id: string;
  name: string;
  email: string;
  org: string;
  purpose: string;
  is_admin: boolean;
  created_at: string;
}

interface Purchase {
  id: string;
  user_id: string;
  niche?: string;
  country?: string;
  signal?: string;
  total_leads?: number;
  price_usd?: number;
  amount_usd?: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchUsersAndPurchases = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("You are not authenticated.");
        setLoading(false);
        return;
      }
      const headers = { Authorization: `Bearer ${session.access_token}` };

      // Load profiles and purchases concurrently to compile client metrics
      const [usersRes, purchasesRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/users`, { headers }),
        fetch(`${API_URL}/api/admin/orders`, { headers }) // retrieves purchases
      ]);

      if (!usersRes.ok || !purchasesRes.ok) throw new Error("Failed to load customer list.");

      const uData: Profile[] = await usersRes.json();
      const pData: Purchase[] = await purchasesRes.json();

      setUsers(uData);
      setPurchases(pData);
      
      if (uData.length > 0) {
        setSelectedUserId(uData[0].id);
      }
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to fetch customer data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndPurchases();
  }, []);

  const toggleAdmin = async (userId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    setUpdating(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ is_admin: !currentStatus })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update role");
      }
      
      setUsers(users.map(u => u.id === userId ? { ...u, is_admin: !currentStatus } : u));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#6366f1] w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="font-medium">{error}</span>
      </div>
    );
  }

  // Helper colors for customer avatar circles
  const colors = [
    "bg-indigo-50 border-indigo-100/50 text-indigo-500",
    "bg-amber-50 border-amber-100/50 text-amber-600",
    "bg-slate-50 border-slate-100 text-slate-500",
    "bg-emerald-50 border-emerald-100/50 text-emerald-600"
  ];

  // Resolve calculations for left panel list items
  const compileUserStats = (uid: string) => {
    const userPurchases = purchases.filter((p) => p.user_id === uid);
    const totalOrders = userPurchases.length;
    const totalSpend = userPurchases.reduce((sum, p) => sum + (p.price_usd ?? p.amount_usd ?? 0), 0);
    const avgOrderValue = totalOrders > 0 ? (totalSpend / totalOrders).toFixed(2) : "0.00";
    
    let lastPurchaseDate = "Never";
    if (totalOrders > 0) {
      const dates = userPurchases.map(p => new Date(p.created_at).getTime());
      lastPurchaseDate = new Date(Math.max(...dates)).toLocaleDateString();
    }

    return { totalOrders, totalSpend, avgOrderValue, lastPurchaseDate, userPurchases };
  };

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];
  const selectedStats = selectedUser ? compileUserStats(selectedUser.id) : null;
  const selectedInitials = selectedUser?.name
    ? selectedUser.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "AD";

  const triggerEmail = (email: string) => {
    window.location.href = `mailto:${email}?subject=LeadFlow%20Dataset%20Support`;
  };

  const triggerCustomOrder = (name: string) => {
    alert(`Creating custom dataset order proposal for ${name}.`);
  };

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-end border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Customer Accounts</h1>
          <p className="text-slate-500 text-sm font-medium mt-1 font-sans">Monitor and manage customer transactions, segments, and lifetime value.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-slate-50 border border-slate-100 hover:bg-slate-100/50 text-slate-700 font-bold text-xs py-2.5 px-5 rounded-xl transition-all cursor-pointer">
            <SlidersHorizontal size={14} />
            <span>Filter</span>
          </button>
          <button onClick={() => alert("Creating a new user account is handled via Supabase registration.")} className="btn-primary flex items-center gap-2 px-5 py-2.5 font-bold text-xs rounded-xl text-white cursor-pointer">
            <Plus size={14} />
            <span>New Account</span>
          </button>
        </div>
      </div>

      {/* Main Grid Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Scrollable Users List (col-span-1) */}
        <div className="lg:col-span-1 border border-slate-100 bg-white rounded-2xl shadow-sm overflow-hidden h-[650px] flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">All Accounts ({users.length})</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 scrollbar-none">
            {users.map((u, idx) => {
              const uStats = compileUserStats(u.id);
              const initials = u.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
              const isSelected = selectedUserId === u.id;

              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className={`w-full text-left p-4 flex justify-between items-center transition-colors cursor-pointer border-l-4 ${
                    isSelected ? "bg-indigo-50/25 border-l-indigo-500" : "hover:bg-slate-50/30 border-l-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 pr-2 min-w-0">
                    <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-extrabold text-xs shrink-0 select-none ${colors[idx % colors.length]}`}>
                      {initials}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="text-xs font-bold text-slate-800 truncate">{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-semibold truncate max-w-[150px]">{u.email}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize inline-block ${
                      u.purpose ? "bg-indigo-50 text-indigo-500 border-indigo-100/30" : "bg-slate-50 text-slate-400 border-slate-100"
                    }`}>
                      {u.purpose || "User"}
                    </span>
                    <div className="text-[10px] font-bold text-slate-700">
                      {uStats.totalOrders} Purchases • <span className="text-emerald-600">${uStats.totalSpend}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Detailed Customer Profile & Sales (col-span-2) */}
        {selectedUser ? (
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card 1: Customer Summary */}
            <div className="border border-slate-100 bg-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100/50 flex items-center justify-center font-black text-indigo-500 text-lg select-none">
                  {selectedInitials}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>{selectedUser.name}</span>
                    {selectedUser.is_admin && (
                      <span className="bg-indigo-50 text-indigo-500 border border-indigo-100/30 px-2.5 py-0.5 rounded-full text-[9px] font-bold">Admin Privileges</span>
                    )}
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5 font-medium">{selectedUser.email} • {selectedUser.org || "Individual Account"}</p>
                </div>
              </div>

              {/* Make Admin Action */}
              <button
                onClick={(e) => toggleAdmin(selectedUser.id, selectedUser.is_admin, e)}
                disabled={updating === selectedUser.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer border ${
                  selectedUser.is_admin
                    ? "bg-red-50 text-red-500 border-red-100/30 hover:bg-red-100/50"
                    : "bg-indigo-50 text-[#6366f1] border-indigo-100/30 hover:bg-indigo-100/50"
                }`}
              >
                {updating === selectedUser.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : selectedUser.is_admin ? (
                  <><UserX size={12} /> Revoke Admin</>
                ) : (
                  <><UserCheck size={12} /> Make Admin</>
                )}
              </button>
            </div>

            {/* Card 2: Customer Value Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-slate-100 bg-white rounded-xl p-4 shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Spend</span>
                <div className="text-lg font-extrabold text-emerald-600 mt-1 tracking-tight">
                  ${selectedStats?.totalSpend.toLocaleString()}
                </div>
              </div>
              <div className="border border-slate-100 bg-white rounded-xl p-4 shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Orders</span>
                <div className="text-lg font-extrabold text-slate-900 mt-1 tracking-tight">
                  {selectedStats?.totalOrders}
                </div>
              </div>
              <div className="border border-slate-100 bg-white rounded-xl p-4 shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Avg Order Value</span>
                <div className="text-lg font-extrabold text-slate-900 mt-1 tracking-tight">
                  ${selectedStats?.avgOrderValue}
                </div>
              </div>
              <div className="border border-slate-100 bg-white rounded-xl p-4 shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Last Purchase</span>
                <div className="text-sm font-bold text-slate-700 mt-1.5 tracking-tight truncate">
                  {selectedStats?.lastPurchaseDate}
                </div>
              </div>
            </div>

            {/* Card 3: Purchased Datasets List */}
            <div className="border border-slate-100 bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purchased Datasets</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/10 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                      <th className="p-3">Dataset Name</th>
                      <th className="p-3 text-center">Records</th>
                      <th className="p-3 text-center">Amount</th>
                      <th className="p-3 text-right">Unlock Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium">
                    {selectedStats?.userPurchases.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-3 font-bold text-slate-800 capitalize">
                          {p.niche || "Any"} | {p.country || "All"} | {p.signal || "Any"}
                        </td>
                        <td className="p-3 text-center text-slate-500">
                          {p.total_leads ? `${p.total_leads.toLocaleString()} records` : "-"}
                        </td>
                        <td className="p-3 text-center text-emerald-600 font-bold">
                          ${(p.price_usd ?? p.amount_usd ?? 0).toLocaleString()}
                        </td>
                        <td className="p-3 text-right text-slate-400">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {selectedStats?.userPurchases.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400 italic">
                          No datasets purchased yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card 4: Action Panel */}
            <div className="border border-slate-100 bg-white rounded-2xl p-6 shadow-sm flex flex-wrap gap-3">
              <button
                onClick={() => triggerCustomOrder(selectedUser.name)}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 font-bold text-xs rounded-xl text-white cursor-pointer"
              >
                <ShoppingBag size={13} />
                <span>Create Custom Order</span>
              </button>
              <button
                onClick={() => triggerEmail(selectedUser.email)}
                className="bg-white border border-slate-100 hover:bg-slate-50 text-slate-500 hover:text-slate-800 font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Mail size={13} />
                <span>Email Customer</span>
              </button>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-2 border border-slate-100 bg-white rounded-2xl p-8 shadow-sm text-center text-slate-400 italic">
            Select a customer profile from the list to inspect.
          </div>
        )}
      </div>
    </div>
  );
}
