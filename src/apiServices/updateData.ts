import apiClient from "./apiClient";

type Identifier<T> = {
  key: keyof T & string;
  value: T[keyof T];
};

export const editData = async <TData extends Record<string, unknown>, TResponse>(
  url: string,
  identifier: Identifier<TData>,
  data: Partial<TData>,
): Promise<TResponse> => {
  try {
    const response = await apiClient.patch<TResponse>(
      url,
      {
        identifier,
        updates: data,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    const err = error as { message?: string };
    throw new Error(`An error occurred while editing data: ${err.message || String(error)}`);
  }
};
