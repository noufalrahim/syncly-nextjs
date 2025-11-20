import { useMutation } from "@tanstack/react-query";
import { editData } from "@/apiServices/updateData";

type Identifier<T> = {
  key: keyof T & string;
  value: T[keyof T];
};

export const useModifyData = <TData extends Record<string, unknown>, TResponse>(
  baseUrl: string,
) => {
  return useMutation<TResponse, Error, { identifier: Identifier<TData>; updates: Partial<TData> }>({
    mutationFn: ({ identifier, updates }) =>
      editData<TData, TResponse>(baseUrl, identifier, updates),
  });
};
