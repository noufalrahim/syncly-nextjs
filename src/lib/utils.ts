import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TColumn } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ColorGeneratorUtil(k: number | undefined): string[] {
  if (!k || k <= 0) return [];

  const gradientStops = [
    { r: 255, g: 0, b: 0 },
    { r: 255, g: 85, b: 0 },
    { r: 255, g: 170, b: 0 },
    { r: 255, g: 255, b: 0 },
    { r: 127, g: 255, b: 0 },
    { r: 0, g: 255, b: 0 },
  ];

  const colors: string[] = [];

  for (let i = 0; i < k; i++) {
    const t = i / Math.max(k - 1, 1);
    const totalSegments = gradientStops.length - 1;
    const scaledT = t * totalSegments;
    const segment = Math.min(Math.floor(scaledT), totalSegments - 1);
    const localT = scaledT - segment;

    const start = gradientStops[segment];
    const end = gradientStops[segment + 1];

    const r = Math.round(start.r + (end.r - start.r) * localT);
    const g = Math.round(start.g + (end.g - start.g) * localT);
    const b = Math.round(start.b + (end.b - start.b) * localT);

    const hex = `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();

    colors.push(hex);
  }

  return colors;
}

export const colSpanMap: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
};


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

export const priorityFieldsGenerator = (
  value: string,
): {
  label: string;
  color: string;
  textColor: string;
} => {
  switch (value) {
    case "very_low":
      return {
        label: "Very Low",
        color: "bg-gray-100 cursor-pointer",
        textColor: "text-gray-700",
      };
    case "low":
      return {
        label: "Low",
        color: "bg-lime-100 cursor-pointer",
        textColor: "text-lime-700",
      };
    case "medium":
      return {
        label: "Medium",
        color: "bg-yellow-100 cursor-pointer",
        textColor: "text-yellow-700",
      };
    case "high":
      return {
        label: "High",
        color: "bg-orange-100 cursor-pointer",
        textColor: "text-orange-700",
      };
    case "very_high":
      return {
        label: "Very High",
        color: "bg-red-100 cursor-pointer",
        textColor: "text-red-700",
      };
    default:
      return {
        label: "Unknown",
        color: "bg-gray-100 cursor-pointer",
        textColor: "text-gray-700",
      };
  }
};

export const withNA = (value: string | number | undefined) => {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "string" && value.trim() === "") return "N/A";
  return value;
};
