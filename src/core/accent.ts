function getContrastColor(hexColor: string): string {
  let hex = hexColor.replace("#", "")
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("")
  }
  if (hex.length !== 6) return "#ffffff"
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 150 ? "#09090b" : "#ffffff"
}

export function applyAccentColor(accentValue: string) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("syncly-accent", accentValue)
  } catch {}

  const presets = ["orange", "blue", "violet", "emerald", "rose", "cyan"]

  if (presets.includes(accentValue)) {
    document.documentElement.style.removeProperty("--primary")
    document.documentElement.style.removeProperty("--ring")
    document.documentElement.style.removeProperty("--sidebar-primary")
    document.documentElement.style.removeProperty("--sidebar-ring")
    document.documentElement.style.removeProperty("--chart-1")
    document.documentElement.style.removeProperty("--primary-foreground")

    if (accentValue === "orange") {
      document.documentElement.removeAttribute("data-accent")
    } else {
      document.documentElement.setAttribute("data-accent", accentValue)
    }
    return
  }

  if (accentValue.startsWith("#")) {
    const fg = getContrastColor(accentValue)
    document.documentElement.setAttribute("data-accent", "custom")
    document.documentElement.style.setProperty("--primary", accentValue)
    document.documentElement.style.setProperty("--ring", accentValue)
    document.documentElement.style.setProperty("--sidebar-primary", accentValue)
    document.documentElement.style.setProperty("--sidebar-ring", accentValue)
    document.documentElement.style.setProperty("--chart-1", accentValue)
    document.documentElement.style.setProperty("--primary-foreground", fg)
  }
}
