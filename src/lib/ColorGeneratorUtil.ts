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
