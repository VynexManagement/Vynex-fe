"use client";

import { useEffect, useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { API_URL } from "@/lib/api";

interface OrderRow {
  id: string;
  dataset_id?: string;
  total_leads?: number;
  user_id?: string;
  price_usd?: number;
  amount_usd?: number;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (res.ok) setOrders(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10"><Loader2 className="animate-spin text-[#00adb5]" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#eeeeee]">Orders</h1>
        <p className="text-[#eeeeee]/60">All successful lead dataset purchases.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left text-sm text-[#eeeeee]">
          <thead>
            <tr className="border-b border-[#00adb5]/20 bg-[#393e46]/30 text-[#eeeeee]/60">
              <th className="p-4 font-semibold uppercase">Plan/Dataset</th>
              <th className="p-4 font-semibold uppercase">User ID</th>
              <th className="p-4 font-semibold uppercase">Amount</th>
              <th className="p-4 font-semibold uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#00adb5]/10">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-[#393e46]/20">
                <td className="p-4 font-semibold flex items-center gap-2">
                  <CreditCard size={14} className="text-[#00adb5]"/>
                  {order.dataset_id ? `Dataset ${String(order.dataset_id).slice(0, 8)}` : "Dataset"}
                  {typeof order.total_leads === "number" && (
                    <span className="text-xs font-mono text-[#eeeeee]/40">({order.total_leads} leads)</span>
                  )}
                </td>
                <td className="p-4 text-xs font-mono text-[#eeeeee]/50">{order.user_id}</td>
                <td className="p-4 text-[#ffd6ba]">${order.price_usd ?? order.amount_usd ?? "-"}</td>
                <td className="p-4 text-xs text-[#eeeeee]/60">{new Date(order.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-[#eeeeee]/40">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
