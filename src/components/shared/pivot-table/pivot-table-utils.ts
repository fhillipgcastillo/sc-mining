/**
 * Returns a Tailwind background class based on probability intensity.
 * Uses opacity variants of the accent color to create a heat-map effect
 * that works in both light and dark themes.
 */
export function getHeatMapClass(probability: number): string {
  if (probability <= 0) return "";
  if (probability < 0.1) return "bg-accent/5";
  if (probability < 0.25) return "bg-accent/10";
  if (probability < 0.5) return "bg-accent/15";
  if (probability < 0.75) return "bg-accent/20";
  return "bg-accent/30";
}
