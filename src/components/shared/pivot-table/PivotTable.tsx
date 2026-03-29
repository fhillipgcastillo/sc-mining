"use client";

import { type ReactNode, useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { PivotRow, PivotColumn } from "@/types";
import { usePivotTableState } from "./usePivotTableState";
import { PivotTableToolbar } from "./PivotTableToolbar";
import { PivotTableGrid } from "./PivotTableGrid";

interface PivotTableProps<TEntry> {
  ariaLabel: string;
  rows: PivotRow<TEntry>[];
  columns: PivotColumn[];
  getProbability: (entry: TEntry) => number;
  formatCellValue: (entry: TEntry) => string;
  renderTooltipContent: (
    rowId: string,
    rowLabel: string,
    colId: string,
    colLabel: string,
    entry: TEntry,
  ) => ReactNode;
  searchPlaceholder?: string;
  columnFilterLabel?: string;
}

export function PivotTable<TEntry>({
  ariaLabel,
  rows,
  columns,
  getProbability,
  formatCellValue,
  renderTooltipContent,
  searchPlaceholder = "Filter locations...",
  columnFilterLabel = "Columns",
}: PivotTableProps<TEntry>) {
  const state = usePivotTableState({ rows, columns, getProbability });

  // Defer heavy grid render to next frame so the loading indicator shows
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <PivotTableToolbar
        locationSearch={state.locationSearch}
        onLocationSearchChange={state.setLocationSearch}
        searchPlaceholder={searchPlaceholder}
        columns={columns}
        visibleColumns={state.visibleColumns}
        onToggleColumn={state.toggleColumn}
        onSelectAllColumns={state.selectAllColumns}
        onClearAllColumns={state.clearAllColumns}
        totalColumns={state.totalColumns}
        columnFilterLabel={columnFilterLabel}
      />

      {!ready ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-muted">
            <svg
              className="h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Building matrix view...</span>
          </div>
        </div>
      ) : (
        <PivotTableGrid
          rows={state.sortedRows}
          columns={state.displayColumns}
          sort={state.sort}
          onToggleSort={state.toggleSort}
          getProbability={getProbability}
          formatCellValue={formatCellValue}
          renderTooltipContent={renderTooltipContent}
          ariaLabel={ariaLabel}
        />
      )}
    </motion.div>
  );
}
