"use client";

import { Card } from "@heroui/react";
import { motion } from "framer-motion";
import { formatLocationName } from "@/lib/constants";

interface LocationCardProps {
  locationKey: string;
  subtitle: string;
  onSelect: (locationKey: string) => void;
}

export function LocationCard({ locationKey, subtitle, onSelect }: LocationCardProps) {
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
          <p className="text-sm font-medium text-heading">
            {formatLocationName(locationKey)}
          </p>
          <p className="mt-1 text-xs text-muted">{subtitle}</p>
        </Card.Content>
      </Card>
    </motion.button>
  );
}
