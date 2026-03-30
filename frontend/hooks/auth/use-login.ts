import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login as loginApi } from "@/api/auth/login";
import { setToken, setStoreId } from "@/lib/auth";
import type { LoginRequest, LoginResponse } from "@/interfaces/auth";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setToken(data.token);
      setStoreId(data.storeId);
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
