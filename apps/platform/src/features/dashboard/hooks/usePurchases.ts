import { useQuery } from "@tanstack/react-query";
import { getPurchases } from "../services/purchases.service";
import { queryKeys } from "@/lib/api/query-keys";

export function usePurchases() {
  return useQuery({
    queryKey: queryKeys.purchases,
    queryFn: getPurchases,
  });
}
