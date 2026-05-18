// Static map for Tailwind JIT to detect classes.
// Each key matches `Label.color` in mock-data.ts.
export const LABEL_DOT: Record<string, string> = {
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
  red: "bg-red-500",
  amber: "bg-amber-500",
  cyan: "bg-cyan-500",
  zinc: "bg-zinc-500",
  orange: "bg-orange-500",
}

export function labelDotClass(color: string) {
  return LABEL_DOT[color] ?? "bg-zinc-500"
}

export const COLOR_MAP: Record<string, string> = {
  gray: "#9ca3af",
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#10b981",
  emerald: "#10b981",
  blue: "#3b82f6",
  purple: "#a855f7",
  pink: "#ec4899",
  rose: "#f43f5e",
  cyan: "#06b6d4",
  zinc: "#71717a",
  amber: "#f59e0b",
}

export function getHexColor(color: string | undefined): string {
  if (!color) return "#9ca3af"
  if (color.startsWith("#")) return color
  return COLOR_MAP[color] ?? "#9ca3af"
}
