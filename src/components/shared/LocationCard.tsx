"use client";

import { Card, Chip } from "@heroui/react";
import type { ChipVariants } from "@heroui/react";
import { motion } from "framer-motion";
import { formatLocationName, LOCATION_TYPE_COLORS, LOCATION_TYPE_LABELS } from "@/lib/constants";
import type { LocationMeta } from "@/types";

const COLOR_MAP: Record<string, ChipVariants["color"]> = {
  warning: "warning",
  primary: "accent",
  secondary: "default",
  success: "success",
  danger: "danger",
  default: "default",
};

interface LocationCardProps {
  locationKey: string;
  subtitle: string;
  onSelect: (locationKey: string) => void;
  meta?: LocationMeta;
}

export function LocationCard({ locationKey, subtitle, onSelect, meta }: LocationCardProps) {
  const typeColor: ChipVariants["color"] = meta
    ? (COLOR_MAP[LOCATION_TYPE_COLORS[meta.type]] ?? "default")
    : "default";

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(locationKey)}
      aria-label={formatLocationName(locationKey)}
      className="text-left"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        variant="secondary"
        className="h-full ring-1 ring-transparent transition-shadow hover:ring-ring-default hover:shadow-lg hover:cursor-pointer"
      >
        <Card.Content className="px-3 py-3">
          <div className="flex items-start justify-between gap-1">
            <p className="text-sm font-medium text-heading truncate">
              {meta?.displayName ?? formatLocationName(locationKey)}
            </p>
            {meta && (
              <Chip color={typeColor} size="sm" variant="primary" className="shrink-0">
                {LOCATION_TYPE_LABELS[meta.type] ?? meta.type}
              </Chip>
            )}
          </div>
          <p className="mt-1 text-xs text-muted">{subtitle}</p>
          {meta?.parent && (
            <p className="mt-0.5 text-xs text-muted-deeper truncate">
              {meta.system.charAt(0) + meta.system.slice(1).toLowerCase()}
              {meta.parent && <> &rsaquo; {meta.displayName}</>}
            </p>
          )}
        </Card.Content>
      </Card>
    </motion.button>
  );
}
