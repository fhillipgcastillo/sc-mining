import manifest from "@/data/image-manifest.json";

type ImageSize = "full" | "thumb";

interface ImageEntry {
  full: string;
  thumb?: string;
}

const typedManifest = manifest as {
  ores: Record<string, ImageEntry>;
  locations: Record<string, ImageEntry>;
  rockTypes: Record<string, ImageEntry>;
};

function getPath(
  category: "ores" | "locations" | "rockTypes",
  key: string,
  size: ImageSize,
): string | null {
  const entry = typedManifest[category]?.[key.toUpperCase()];
  if (!entry) return null;
  return (size === "thumb" ? entry.thumb : entry.full) ?? entry.full;
}

export function getOreImagePath(
  oreName: string,
  size: ImageSize = "thumb",
): string | null {
  return getPath("ores", oreName, size);
}

export function getLocationImagePath(
  locationKey: string,
  size: ImageSize = "thumb",
): string | null {
  return getPath("locations", locationKey, size);
}

export function getRockTypeImagePath(
  rockTypeName: string,
  size: ImageSize = "thumb",
): string | null {
  return getPath("rockTypes", rockTypeName, size);
}
