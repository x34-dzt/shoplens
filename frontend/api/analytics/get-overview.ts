import api from "@/api/client";
import type { OverviewResponse } from "@/interfaces/analytics";

export async function getOverview(): Promise<OverviewResponse> {
  const response = await api.get<OverviewResponse>("/analytics/overview");
  return response.data;
}
