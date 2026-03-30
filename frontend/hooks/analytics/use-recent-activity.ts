import { useQuery } from "@tanstack/react-query";
import { getRecentActivity } from "@/api/analytics/get-recent-activity";
import type { RecentEvent } from "@/interfaces/analytics";

export function useRecentActivity() {
  return useQuery<RecentEvent[]>({
    queryKey: ["analytics", "recent-activity"],
    queryFn: getRecentActivity,
    refetchInterval: 5_000,
  });
}
