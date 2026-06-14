import { useMutation, useQuery } from "@tanstack/react-query";
import { getCatalog, fetchSignals, getLeadsPreview } from "../services/query.service";
import { queryKeys } from "@/lib/api/query-keys";

export function useCatalogQuery() {
  return useQuery({
    queryKey: queryKeys.catalog,
    queryFn: getCatalog,
  });
}

export function useSignalsQuery() {
  return useQuery({
    queryKey: queryKeys.signals.all,
    queryFn: fetchSignals,
  });
}

export function useCreatePreviewMutation() {
  return useMutation({
    mutationFn: getLeadsPreview,
  });
}
