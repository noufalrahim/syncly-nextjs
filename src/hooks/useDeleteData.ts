import { useMutation } from "@tanstack/react-query";
import { deleteData } from "@/apiServices/deleteData";

export const useDeleteData = <TResponse>(url: string) => {
  return useMutation<TResponse, Error, { id: string }>({
    mutationFn: (data: { id: string }) => deleteData<TResponse>(url, data),
  });
};
