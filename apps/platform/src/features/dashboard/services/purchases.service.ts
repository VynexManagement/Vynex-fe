import { apiClient } from "@/lib/api/axios";
import { PurchaseItem } from "../types/dashboard.types";

export const getPurchases = async (): Promise<PurchaseItem[]> => {
  const res = await apiClient.get<PurchaseItem[]>("/api/purchases");
  return res.data;
};

export const downloadLeads = async (datasetId: string): Promise<Blob> => {
  const res = await apiClient.get(`/api/download-leads/${datasetId}`, {
    responseType: "blob",
  });
  return res.data;
};
