"use client";

import { useMemo, useCallback } from "react";
import type {
  HandMiningLocationRow,
  HandMiningOre,
  PivotRow,
  PivotColumn,
} from "@/types";
import { formatLocationName, formatOreName, getOreColor } from "@/lib/constants";
import { formatProbability, formatNumber } from "@/lib/formatting";
import { OreChip } from "@/components/shared/OreChip";
import { PivotTable } from "@/components/shared/pivot-table/PivotTable";

interface HandMiningPivotAdapterProps {
  allLocations: HandMiningLocationRow[];
  allOres: string[];
}

const getProbability = (entry: HandMiningOre) => entry.prob;
const formatCellValue = (entry: HandMiningOre) => formatProbability(entry.prob);

export function HandMiningPivotAdapter({
  allLocations,
  allOres,
}: HandMiningPivotAdapterProps) {
  const rows: PivotRow<HandMiningOre>[] = useMemo(
    () =>
      allLocations.map((loc) => ({
        id: loc.location,
        label: formatLocationName(loc.location),
        entries: loc.ores,
      })),
    [allLocations],
  );

  const columns: PivotColumn[] = useMemo(
    () =>
      allOres.map((ore) => ({
        id: ore,
        label: formatOreName(ore),
        colorVariant: getOreColor(ore),
      })),
    [allOres],
  );

  const locationMap = useMemo(() => {
    const map = new Map<string, HandMiningLocationRow>();
    for (const loc of allLocations) {
      map.set(loc.location, loc);
    }
    return map;
  }, [allLocations]);

  const renderTooltipContent = useCallback(
    (
      rowId: string,
      rowLabel: string,
      colId: string,
      _colLabel: string,
      entry: HandMiningOre,
    ) => {
      const loc = locationMap.get(rowId);
      return (
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <OreChip name={colId} size="sm" />
            <span className="text-muted">at</span>
            <span className="font-medium text-heading">{rowLabel}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            <span className="text-muted">Probability</span>
            <span className="font-semibold text-accent">
              {formatProbability(entry.prob)}
            </span>
            <span className="text-muted">Finds</span>
            <span>{formatNumber(entry.finds)}</span>
            <span className="text-muted">Min Rocks</span>
            <span>{formatNumber(entry.minRocks)}</span>
            <span className="text-muted">Median Rocks</span>
            <span>{formatNumber(entry.medianRocks)}</span>
            <span className="text-muted">Max Rocks</span>
            <span>{formatNumber(entry.maxRocks)}</span>
          </div>
          {loc && (
            <div className="border-t border-border-subtle pt-1.5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                <span className="text-muted">Total Finds</span>
                <span>{formatNumber(loc.finds)}</span>
                <span className="text-muted">Users</span>
                <span>{formatNumber(loc.users)}</span>
              </div>
            </div>
          )}
        </div>
      );
    },
    [locationMap],
  );

  return (
    <PivotTable<HandMiningOre>
      ariaLabel="Hand mining probability matrix"
      rows={rows}
      columns={columns}
      getProbability={getProbability}
      formatCellValue={formatCellValue}
      renderTooltipContent={renderTooltipContent}
      searchPlaceholder="Filter locations..."
      columnFilterLabel="Ore Types"
    />
  );
}
