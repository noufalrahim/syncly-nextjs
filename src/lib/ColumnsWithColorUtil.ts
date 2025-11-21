import type { TColumn } from "@/types";

export function ColumnsWithColorUtil(
  columns: TColumn[] | undefined,
  colors: string[],
): TColumn[] | null {
  if (!columns) {
    return null;
  }
  return columns.map((cl, index) => ({
    ...cl,
    color: colors[index],
  }));
}
