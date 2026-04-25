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
