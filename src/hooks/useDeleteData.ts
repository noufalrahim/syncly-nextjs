import { useMutation } from "@tanstack/react-query";
import { deleteData } from "@/apiServices/deleteData";

export const useDeleteData = (url: string) => {
  return useMutation<void, Error, void>({
    mutationFn: () => deleteData(url),
  });
};
