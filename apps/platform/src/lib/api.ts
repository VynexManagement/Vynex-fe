import { supabase } from "./supabase";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Auth header helper ──────────────────────────────────────────────────────

async function authHeaders(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  return headers;
}

// ── Fetch signals for legacy Admin layouts ──────────────────────────────────

export async function fetchSignals() {
  const res = await fetch(`${API_URL}/api/admin/signals`, {
    headers: await authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch signals");
  }

  return res.json();
}