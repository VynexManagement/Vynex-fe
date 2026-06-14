import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSignals, createSignal, updateSignal, SignalRow } from "../services/signals.service";
import { queryKeys } from "@/lib/api/query-keys";

export function useAdminSignalsQuery() {
  return useQuery({
    queryKey: queryKeys.signals.admin,
    queryFn: getSignals,
  });
}

export function useCreateSignalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSignal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.signals.admin });
      // Also invalidate main query feature signals list
      queryClient.invalidateQueries({ queryKey: queryKeys.signals.all });
    },
  });
}

export function useUpdateSignalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<SignalRow> }) => {
      return updateSignal(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.signals.admin });
      queryClient.invalidateQueries({ queryKey: queryKeys.signals.all });
    },
  });
}
