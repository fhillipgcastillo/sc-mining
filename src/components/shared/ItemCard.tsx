"use client";

import Image from "next/image";
import { Card } from "@heroui/react";
import { motion } from "framer-motion";
import { formatOreName, getOreCardStyles } from "@/lib/constants";
import { OreChip } from "@/components/shared/OreChip";
import { getOreImagePath, getRockTypeImagePath } from "@/lib/images";

interface ItemCardProps {
  name: string;
  category?: "ores" | "rockTypes";
  onSelect: (name: string) => void;
}

export function ItemCard({ name, category = "ores", onSelect }: ItemCardProps) {
  const styles = getOreCardStyles(name);
  const imagePath =
    category === "rockTypes"
      ? getRockTypeImagePath(name)
      : getOreImagePath(name);

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(name)}
      aria-label={formatOreName(name)}
      className="text-left"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        variant="secondary"
        className={`ring-1 ring-transparent transition-shadow hover:${styles.ring} hover:shadow-lg hover:cursor-pointer`}
      >
        <div
          className={`relative aspect-[4/3] overflow-hidden rounded-t-lg ${!imagePath ? styles.bg : ""}`}
        >
          {imagePath ? (
            <>
              <Image
                src={imagePath}
                alt={formatOreName(name)}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                className="object-cover"
              />
              <div className="absolute bottom-2 left-2 z-10">
                <OreChip name={name} size="sm" />
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <OreChip name={name} size="md" />
            </div>
          )}
        </div>
        <Card.Content className="px-3 py-2">
          <p className={`text-sm font-medium ${styles.text}`}>
            {formatOreName(name)}
          </p>
        </Card.Content>
      </Card>
    </motion.button>
  );
}
