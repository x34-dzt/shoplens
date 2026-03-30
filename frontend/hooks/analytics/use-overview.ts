import { useQuery } from "@tanstack/react-query";
import { getOverview } from "@/api/analytics/get-overview";
import type { OverviewResponse } from "@/interfaces/analytics";

export function useOverview() {
  return useQuery<OverviewResponse>({
    queryKey: ["analytics", "overview"],
    queryFn: getOverview,
    refetchInterval: 15_000,
  });
}
