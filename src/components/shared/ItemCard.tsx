"use client";

import { Card } from "@heroui/react";
import { motion } from "framer-motion";
import { formatOreName, getOreCardStyles } from "@/lib/constants";
import { OreChip } from "@/components/shared/OreChip";

interface ItemCardProps {
  name: string;
  onSelect: (name: string) => void;
}

export function ItemCard({ name, onSelect }: ItemCardProps) {
  const styles = getOreCardStyles(name);

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
          className={`flex aspect-[4/3] items-center justify-center rounded-t-lg ${styles.bg}`}
        >
          <OreChip name={name} size="md" />
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
