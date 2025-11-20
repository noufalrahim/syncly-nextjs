import { useQuery } from "@tanstack/react-query";
import { readData } from "@/apiServices/readData";

export const useReadData = <T>(
  key: string,
  url: string | null,
  fetchFn?: () => Promise<T>,
  enabled: boolean = true,
  customBaseUrl?: string,
  tokenRequired?: boolean,
) => {
  return useQuery<T>({
    queryKey: [key, url, customBaseUrl],
    queryFn: fetchFn ? fetchFn : () => readData<T>(url || "", customBaseUrl, tokenRequired),
    enabled,
  });
};
