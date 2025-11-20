/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApiClient } from "./apiClient";

export const readData = async <T>(
  url: string,
  customBaseUrl?: string,
  tokenRequired = true,
): Promise<T> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (tokenRequired && !token) throw new Error("Unauthorized");

  const client = createApiClient(customBaseUrl);

  const headers: Record<string, string> = {};
  if (tokenRequired && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await client.get<T>(url, { headers });
    return response.data;
  } catch (error) {
    const err = error as { message?: string };
    throw new Error(`An error occurred while fetching data: ${err.message || error}`);
  }
};
