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

// ── Helper to throw on non-OK responses ─────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "API error");
  }
  return res.json() as Promise<T>;
}

// ── API calls ───────────────────────────────────────────────────────────────

export interface LeadPreview {
  store_name: string;
  url: string;
  country: string;
  signal: string;
  niche?: string;
}

export interface PreviewResponse {
  dataset_id: string;
  items: LeadPreview[];
  total_count: number;
  price_inr?: number;
  price_usd?: number;
  niche?: string;
  country?: string;
  signal?: string;
  niches?: string[];
  countries?: string[];
  signal_ids?: string[];
  signal_names?: string[];
}

export interface CatalogResponse {
  niches: string[];
  countries: string[];
  signals: { id: string; name: string; description?: string | null }[];
}

export interface PurchaseItem {
  id: string;
  dataset_id: string;
  niche: string;
  country: string;
  signal: string;
  total_leads: number;
  price_inr?: number;
  price_usd?: number;
  payment_method?: string;
  purchase_date: string;
}

export async function getCatalog(): Promise<CatalogResponse> {
  const res = await fetch(`${API_URL}/api/catalog`, {
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse<CatalogResponse>(res);
}

export async function getLeadsPreview(params: {
  niches: string[];
  countries: string[];
  signal_ids: string[];
  /** When catalog UUIDs are unavailable, filter by signals.name / leads.signal text */
  signal_names?: string[];
  persist?: boolean;
}): Promise<PreviewResponse> {
  const res = await fetch(`${API_URL}/api/get-leads-preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      niches: params.niches,
      countries: params.countries,
      signal_ids: params.signal_ids,
      signal_names: params.signal_names ?? [],
      persist: params.persist ?? false,
    }),
  });
  return handleResponse<PreviewResponse>(res);
}

export async function createRazorpayOrder(
  datasetId: string,
  amountPaise: number
): Promise<{ order_id: string; amount: number; currency: string; key_id: string }> {
  const res = await fetch(`${API_URL}/api/create-razorpay-order`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ dataset_id: datasetId, amount: amountPaise }),
  });
  return handleResponse(res);
}

export async function verifyRazorpayPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  dataset_id: string
): Promise<{ success: boolean; dataset_id: string }> {
  const res = await fetch(`${API_URL}/api/verify-razorpay-payment`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dataset_id,
    }),
  });
  return handleResponse(res);
}

export async function createStripeIntent(
  datasetId: string,
  amountCents: number,
  currency = "usd"
): Promise<{
  client_secret: string;
  amount: number;
  currency: string;
  publishable_key: string;
}> {
  const res = await fetch(`${API_URL}/api/create-stripe-intent`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ dataset_id: datasetId, amount: amountCents, currency }),
  });
  return handleResponse(res);
}

export async function confirmStripePayment(
  payment_intent_id: string,
  dataset_id: string
): Promise<{ success: boolean; dataset_id: string }> {
  const res = await fetch(`${API_URL}/api/confirm-stripe-payment`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ payment_intent_id, dataset_id }),
  });
  return handleResponse(res);
}

export async function getPurchases(): Promise<PurchaseItem[]> {
  const res = await fetch(`${API_URL}/api/purchases`, {
    headers: await authHeaders(),
  });
  return handleResponse<PurchaseItem[]>(res);
}

export async function downloadLeads(datasetId: string): Promise<Blob> {
  const headers = await authHeaders();
  delete (headers as Record<string, string>)["Content-Type"];
  const res = await fetch(`${API_URL}/api/download-leads/${datasetId}`, {
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Download failed");
  }
  return res.blob();
}

// fetch signals 

export async function fetchSignals() {
  const res = await fetch(`${API_URL}/api/admin/signals`, {
    headers: await authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch signals");
  }

  return res.json();
}