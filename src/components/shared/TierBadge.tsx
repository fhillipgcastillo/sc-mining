import { Chip } from "@heroui/react";
import type { ChipVariants } from "@heroui/react";
import { TIER_COLORS } from "@/lib/constants";
import type { RockTier } from "@/types";

const COLOR_MAP: Record<string, ChipVariants["color"]> = {
  warning: "warning",
  primary: "accent",
  secondary: "default",
  success: "success",
  danger: "danger",
  default: "default",
};

interface TierBadgeProps {
  tier: RockTier;
  size?: ChipVariants["size"];
}

export function TierBadge({ tier, size = "sm" }: TierBadgeProps) {
  const rawColor = TIER_COLORS[tier] ?? "default";
  const color: ChipVariants["color"] = COLOR_MAP[rawColor] ?? "default";

  return (
    <Chip color={color} size={size} variant="primary">
      {tier}-Tier
    </Chip>
  );
}
