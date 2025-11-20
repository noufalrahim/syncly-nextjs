import type { TUser } from "@/types";
import apiClient from "./apiClient";

export const createData = async <TRequest, TResponse>(
  url: string,
  data: TRequest,
): Promise<TResponse> => {
  try {
    const response = await apiClient.post<TResponse>(url, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    const message =
      err.response?.data?.message || err.message || "An error occurred while creating data.";
    throw new Error(message);
  }
};

export const authSignup = async <TResponse>(data: TUser): Promise<TResponse> => {
  try {
    const response = await apiClient.post<TResponse>("/api/users", data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    const message =
      err.response?.data?.message || err.message || "An error occurred while signing up.";
    throw new Error(message);
  }
};

type SignInResponse = {
  success: boolean;
  message?: string;
  data: {
    user: TUser | null;
    token: string;
  };
};

export const authSignIn = async (email: string, password: string): Promise<SignInResponse> => {
  try {
    const response = await apiClient.post<SignInResponse>(
      "/api/sign-in",
      { email, password },
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    const message =
      err.response?.data?.message || err.message || "An error occurred while signing in.";
    throw new Error(message);
  }
};
