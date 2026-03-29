import { Chip } from "@heroui/react";
import type { ChipVariants } from "@heroui/react";
import { getOreColor, formatOreName } from "@/lib/constants";

// HeroUI v3 Chip supports: accent | danger | default | success | warning
// The constants layer uses: warning | primary | default | secondary | success | danger
// Map the constants' values to valid v3 Chip colors.
const COLOR_MAP: Record<string, ChipVariants["color"]> = {
  warning: "warning",
  primary: "accent",
  secondary: "default",
  success: "success",
  danger: "danger",
  default: "default",
};

interface OreChipProps {
  name: string;
  size?: ChipVariants["size"];
}

export function OreChip({ name, size = "sm" }: OreChipProps) {
  const rawColor = getOreColor(name);
  const color: ChipVariants["color"] = COLOR_MAP[rawColor] ?? "default";

  return (
    <Chip color={color} size={size} variant="primary">
      {formatOreName(name)}
    </Chip>
  );
}
