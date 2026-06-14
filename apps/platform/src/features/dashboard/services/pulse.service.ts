import { supabase } from "@/lib/supabase";

export const getPulseMetrics = async () => {
  const [storesRes, leadsRes, distinctNiches] = await Promise.all([
    supabase.from("stores").select("id", { count: "exact", head: true }),
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("stores").select("niche"),
  ]);

  const uniqueNiches = new Set((distinctNiches.data || []).map((x) => x.niche)).size;

  return {
    totalStores: storesRes.count || 0,
    totalLeads: leadsRes.count || 0,
    activeNiches: uniqueNiches || 8,
  };
};
