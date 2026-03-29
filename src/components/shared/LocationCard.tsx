"use client";

import Image from "next/image";
import { Card } from "@heroui/react";
import { motion } from "framer-motion";
import { formatLocationName } from "@/lib/constants";
import { getLocationImagePath } from "@/lib/images";

interface LocationCardProps {
  locationKey: string;
  subtitle: string;
  onSelect: (locationKey: string) => void;
}

export function LocationCard({ locationKey, subtitle, onSelect }: LocationCardProps) {
  const imagePath = getLocationImagePath(locationKey);

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
        {imagePath && (
          <div className="relative aspect-[3/1] overflow-hidden rounded-t-lg">
            <Image
              src={imagePath}
              alt={formatLocationName(locationKey)}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
              className="object-cover"
            />
          </div>
        )}
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
