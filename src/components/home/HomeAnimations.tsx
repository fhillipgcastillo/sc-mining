"use client";

import { motion } from "framer-motion";
import { DataCard } from "./DataCard";

interface CardData {
  title: string;
  description: string;
  href: string;
  count: number;
  countLabel: string;
  highlighted: boolean;
}

interface HomeAnimationsProps {
  cards: CardData[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export function HomeAnimations({ cards }: HomeAnimationsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12"
    >
      {/* Hero section */}
      <motion.section variants={itemVariants} className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Star Citizen{" "}
          <span className="text-amber-300">Mining Data</span> Archive
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60 sm:text-xl">
          Preserving mining intelligence from Regolith for the Star Citizen
          community
        </p>
      </motion.section>

      {/* About section */}
      <motion.section
        variants={itemVariants}
        className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-white/5 px-6 py-5 text-sm leading-relaxed text-white/70 sm:text-base"
        aria-label="About this project"
      >
        <p>
          <strong className="font-semibold text-white">Regolith</strong>, the
          beloved Star Citizen mining database, collected extensive scan data
          from thousands of community sessions across the verse. This archive
          preserves that dataset — ore locations, rock type distributions, and
          hand mining data — so the community can continue to reference it even
          after the service winds down.
        </p>
        <p className="mt-3 rounded-md bg-amber-950/50 px-4 py-3 text-amber-200">
          <strong className="text-amber-300">Data notice:</strong> All data
          reflects Star Citizen up to{" "}
          <strong className="text-amber-300">v4.6</strong>. The signature system
          changed significantly in v4.7+. Community collection of updated data
          is ongoing.
        </p>
      </motion.section>

      {/* Data cards grid */}
      <motion.section variants={itemVariants} aria-label="Data categories">
        <h2 className="sr-only">Data categories</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <DataCard key={card.href} {...card} />
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
