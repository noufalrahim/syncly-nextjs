import apiClient from "./apiClient";

export const deleteData = async <TResponse>(url: string, data: { id: string }): Promise<TResponse> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Unauthorized");

  try {
    const response = await apiClient.delete<TResponse>(`${url}?id=${data.id}`, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(`An error occurred while deleting data: ${error}`);
  }
};
