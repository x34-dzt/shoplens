import api from "@/api/client";
import type { TopProduct } from "@/interfaces/analytics";

export async function getTopProducts(): Promise<TopProduct[]> {
  const response = await api.get<TopProduct[]>("/analytics/top-products");
  return response.data;
}
