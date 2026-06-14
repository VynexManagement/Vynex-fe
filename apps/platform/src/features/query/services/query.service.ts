import { apiClient } from "@/lib/api/axios";
import { CatalogResponse, PreviewResponse, SignalOption } from "../types/query.types";

export const getCatalog = async (): Promise<CatalogResponse> => {
  const res = await apiClient.get<CatalogResponse>("/api/catalog");
  return res.data;
};

export const fetchSignals = async (): Promise<SignalOption[]> => {
  const res = await apiClient.get<SignalOption[]>("/api/admin/signals");
  return res.data;
};

export const getLeadsPreview = async (params: {
  niches: string[];
  countries: string[];
  signal_ids: string[];
  signal_names?: string[];
  persist?: boolean;
}): Promise<PreviewResponse> => {
  const res = await apiClient.post<PreviewResponse>("/api/get-leads-preview", {
    niches: params.niches,
    countries: params.countries,
    signal_ids: params.signal_ids,
    signal_names: params.signal_names ?? [],
    persist: params.persist ?? false,
  });
  return res.data;
};
