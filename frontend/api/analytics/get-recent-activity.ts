import api from "@/api/client";
import type { RecentEvent } from "@/interfaces/analytics";

export async function getRecentActivity(): Promise<RecentEvent[]> {
  const response = await api.get<RecentEvent[]>("/analytics/recent-activity");
  return response.data;
}
