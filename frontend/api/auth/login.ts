import api from "@/api/client";
import type { LoginRequest, LoginResponse } from "@/interfaces/auth";

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", data);
  return response.data;
}
