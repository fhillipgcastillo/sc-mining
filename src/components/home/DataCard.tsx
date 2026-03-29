"use client";

import Link from "next/link";
import { Card } from "@heroui/react";
import { motion } from "framer-motion";

interface DataCardProps {
  title: string;
  description: string;
  href: string;
  count: number;
  countLabel: string;
  highlighted?: boolean;
}

export function DataCard({
  title,
  description,
  href,
  count,
  countLabel,
  highlighted = false,
}: DataCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link href={href} className="block focus-visible:outline-none">
        <Card
          variant="secondary"
          className={[
            "h-full cursor-pointer transition-shadow duration-200 hover:shadow-lg hover:shadow-black/40",
            highlighted
              ? "ring-1 ring-amber-400/40 hover:ring-amber-400/70"
              : "hover:ring-1 hover:ring-white/20",
          ].join(" ")}
        >
          <Card.Header>
            <div className="flex items-start justify-between gap-2">
              <Card.Title className="text-base font-semibold text-white">
                {title}
              </Card.Title>
              {highlighted && (
                <span className="shrink-0 rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                  Featured
                </span>
              )}
            </div>
          </Card.Header>
          <Card.Content>
            <p className="text-sm text-white/60">{description}</p>
          </Card.Content>
          <Card.Footer>
            <p className="text-sm">
              <span className="font-bold text-amber-300">
                {count.toLocaleString("en-US")}
              </span>{" "}
              <span className="text-white/50">{countLabel}</span>
            </p>
          </Card.Footer>
        </Card>
      </Link>
    </motion.div>
  );
}
