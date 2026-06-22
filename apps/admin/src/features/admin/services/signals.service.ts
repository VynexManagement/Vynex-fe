import { apiClient } from "@/lib/api/axios";

export interface SignalRow {
  id: string;
  name: string;
  slug?: string;
  type?: string;
  category?: string;
  weight?: number;
  dependencies?: string[];
  description?: string;
  rule_definition?: string;
  active?: boolean;
  is_active?: boolean;
}

export const getSignals = async (): Promise<SignalRow[]> => {
  const res = await apiClient.get<SignalRow[]>("/api/admin/signals");
  return res.data;
};

export const createSignal = async (payload: {
  name: string;
  slug: string;
  type: string;
  description: string;
  rule_definition: string;
  is_active: boolean;
}): Promise<SignalRow> => {
  const res = await apiClient.post<SignalRow>("/api/admin/signals", payload);
  return res.data;
};

export const updateSignal = async (
  id: string,
  payload: Partial<SignalRow>
): Promise<SignalRow> => {
  const res = await apiClient.put<SignalRow>(`/api/admin/signals/${id}`, payload);
  return res.data;
};

export const refreshStaleStores = async (payload: {
  freshness_threshold: number;
  concurrency: number;
  retry_attempts: number;
}): Promise<{ message: string; task_id: string }> => {
  const res = await apiClient.post<{ message: string; task_id: string }>(
    "/api/admin/scraper/refresh-stale",
    payload
  );
  return res.data;
};

export const retryStore = async (payload: {
  url: string;
  niche: string;
  country: string;
}): Promise<{ message: string; task_id: string }> => {
  const res = await apiClient.post<{ message: string; task_id: string }>(
    "/api/admin/scraper/retry",
    payload
  );
  return res.data;
};
