import axios, { type AxiosInstance } from "axios";

export const createApiClient = (baseURL?: string): AxiosInstance => {
  return axios.create({
    baseURL: baseURL || process.env.NEXT_PUBLIC_BACKEND_API,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const apiClient = createApiClient();
export default apiClient;
