import { useQuery } from "@tanstack/react-query";
import { getTopProducts } from "@/api/analytics/get-top-products";
import type { TopProduct } from "@/interfaces/analytics";

export function useTopProducts() {
  return useQuery<TopProduct[]>({
    queryKey: ["analytics", "top-products"],
    queryFn: getTopProducts,
    refetchInterval: 15_000,
  });
}
