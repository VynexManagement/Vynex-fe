import { useMutation } from "@tanstack/react-query";
import { downloadLeads } from "../services/purchases.service";

export function useDownloadLeads() {
  return useMutation({
    mutationFn: async ({ datasetId, niche }: { datasetId: string; niche: string }) => {
      const blob = await downloadLeads(datasetId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${niche.toLowerCase()}_leads.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      return datasetId;
    },
  });
}
