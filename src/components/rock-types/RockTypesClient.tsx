"use client";

import { useState, useMemo } from "react";
import { Table, Tabs } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import type { RockTypeSystemRow, OreEntry } from "@/types";
import { formatOreName } from "@/lib/constants";
import { formatNumber, formatProbability, formatPercent } from "@/lib/formatting";
import { OreChip } from "@/components/shared/OreChip";

interface RockTypesClientProps {
  systems: string[];
  systemData: Record<string, RockTypeSystemRow[]>;
}

/** Title-case a system name: "STANTON" → "Stanton" */
function formatSystemName(system: string): string {
  return system.charAt(0).toUpperCase() + system.slice(1).toLowerCase();
}

export function RockTypesClient({ systems, systemData }: RockTypesClientProps) {
  const [activeTab, setActiveTab] = useState<string>(systems[0] ?? "");

  return (
    <Tabs
      selectedKey={activeTab}
      onSelectionChange={(key) => setActiveTab(String(key))}
      className="mt-6"
    >
      <Tabs.ListContainer>
        <Tabs.List aria-label="Select star system">
          {systems.map((system) => (
            <Tabs.Tab key={system} id={system}>
              {formatSystemName(system)}
              <Tabs.Indicator />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>

      {systems.map((system) => (
        <Tabs.Panel key={system} id={system}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <RockTypeSystemTable rows={systemData[system] ?? []} />
          </motion.div>
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}

// ---------------------------------------------------------------------------
// Rock types table for one system
// ---------------------------------------------------------------------------

function RockTypeSystemTable({ rows }: { rows: RockTypeSystemRow[] }) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  function toggleRow(rockType: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rockType)) {
        next.delete(rockType);
      } else {
        next.add(rockType);
      }
      return next;
    });
  }

  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-white/40">
        No rock type data available for this system.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-1 overflow-x-auto rounded-lg">
      {/* Column header row — mirrors the data rows below */}
      <div
        role="row"
        aria-label="Rock type columns"
        className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 rounded-t-lg bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/50"
      >
        <span role="columnheader">Rock Type</span>
        <span role="columnheader">Scans</span>
        <span role="columnheader">Users</span>
        <span role="columnheader">Clusters</span>
        <span role="columnheader">Mass (med)</span>
        <span role="columnheader">Instability (med)</span>
        <span role="columnheader">Resistance (med)</span>
        <span role="columnheader">Ores</span>
      </div>

      {rows.map((row) => {
        const isExpanded = expandedRows.has(row.rockType);
        const oreCount = Object.keys(row.ores).length;

        return (
          <div key={row.rockType} className="rounded-lg border border-white/5 bg-white/[0.03]">
            {/* Main data row */}
            <div
              role="row"
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-2 px-4 py-3 text-sm"
            >
              <span role="rowheader" className="font-medium text-white">
                {formatOreName(row.rockType)}
              </span>
              <span role="cell" className="text-white/80">{formatNumber(row.scans)}</span>
              <span role="cell" className="text-white/80">{formatNumber(row.users)}</span>
              <span role="cell" className="text-white/80">{formatNumber(row.clusters)}</span>
              <span role="cell" className="text-white/80">{formatNumber(row.mass.med)}</span>
              <span role="cell" className="text-white/80">{formatNumber(row.inst.med)}</span>
              <span role="cell" className="text-white/80">{formatNumber(row.res.med)}</span>
              <span role="cell">
                <button
                  type="button"
                  onClick={() => toggleRow(row.rockType)}
                  aria-expanded={isExpanded}
                  aria-controls={`ore-subtable-${row.rockType}`}
                  aria-label={`${isExpanded ? "Collapse" : "Expand"} ore composition for ${formatOreName(row.rockType)}`}
                  className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
                >
                  <span>
                    {oreCount} ore{oreCount !== 1 ? "s" : ""}
                  </span>
                  <svg
                    className={[
                      "h-3.5 w-3.5 transition-transform duration-200",
                      isExpanded ? "rotate-180" : "",
                    ].join(" ")}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </span>
            </div>

            {/* Expandable ore sub-table */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  id={`ore-subtable-${row.rockType}`}
                  key={`${row.rockType}-ores`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <OreSubTable ores={row.ores} rockType={row.rockType} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ore composition sub-table
// ---------------------------------------------------------------------------

interface OreSubTableProps {
  ores: Record<string, OreEntry>;
  rockType: string;
}

function OreSubTable({ ores, rockType }: OreSubTableProps) {
  const sortedOres = useMemo(
    () =>
      Object.entries(ores)
        .map(([name, entry]) => ({ name, ...entry }))
        .sort((a, b) => b.prob - a.prob),
    [ores]
  );

  return (
    <div className="border-t border-white/10 bg-white/5 px-4 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
        Ore Composition — {formatOreName(rockType)}
      </p>
      <div className="overflow-x-auto rounded-lg">
        <Table
          aria-label={`Ore composition for ${formatOreName(rockType)}`}
          className="text-sm"
        >
          <Table.Content>
            <Table.Header>
              <Table.Column isRowHeader>Ore</Table.Column>
              <Table.Column>Probability</Table.Column>
              <Table.Column>Min %</Table.Column>
              <Table.Column>Median %</Table.Column>
              <Table.Column>Max %</Table.Column>
            </Table.Header>
            <Table.Body items={sortedOres}>
              {(ore) => (
                <Table.Row key={ore.name} id={ore.name}>
                  <Table.Cell>
                    <OreChip name={ore.name} />
                  </Table.Cell>
                  <Table.Cell>
                    <span className="font-semibold text-amber-300">
                      {formatProbability(ore.prob)}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{formatPercent(ore.minPct)}</Table.Cell>
                  <Table.Cell>{formatPercent(ore.medPct)}</Table.Cell>
                  <Table.Cell>{formatPercent(ore.maxPct)}</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table>
      </div>
    </div>
  );
}
