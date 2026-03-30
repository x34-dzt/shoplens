import { useMutation, useQueryClient } from "@tanstack/react-query";
import { register as registerApi } from "@/api/auth/register";
import { setToken, setStoreId } from "@/lib/auth";
import type { RegisterRequest, RegisterResponse } from "@/interfaces/auth";

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: registerApi,
    onSuccess: (data) => {
      setToken(data.token);
      setStoreId(data.storeId);
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
