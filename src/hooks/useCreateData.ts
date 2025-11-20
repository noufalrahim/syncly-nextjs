import { useMutation } from "@tanstack/react-query";
import { authSignIn, authSignup, createData } from "@/apiServices/createData";
import type { TUser } from "@/types";

export const useCreateData = <TRequest, TResponse>(url: string) => {
  return useMutation<TResponse, Error, TRequest>({
    mutationFn: (data: TRequest) => createData<TRequest, TResponse>(url, data),
  });
};

export const useAuthSignup = <TResponse>() => {
  return useMutation<TResponse, Error, TUser>({
    mutationFn: (data) => authSignup<TResponse>(data),
  });
};

export const useAuthSignIn = () => {
  return useMutation<
    {
      success: boolean;
      message?: string;
      data: {
        user: TUser | null;
        token: string;
      };
    },
    Error,
    { email: string; password: string }
  >({
    mutationFn: ({ email, password }) => authSignIn(email, password),
  });
};
