"use client";

import { useMemo, useCallback } from "react";
import type {
  RockTypeLocationRow,
  RockTypeEntry,
  PivotRow,
  PivotColumn,
} from "@/types";
import { formatLocationName, formatOreName, getOreColor } from "@/lib/constants";
import { formatProbability, formatNumber, formatStat } from "@/lib/formatting";
import { OreChip } from "@/components/shared/OreChip";
import { PivotTable } from "@/components/shared/pivot-table/PivotTable";

interface RockTypeLocationsPivotAdapterProps {
  allLocations: RockTypeLocationRow[];
  allRockTypes: string[];
}

const getProbability = (entry: RockTypeEntry) => entry.prob;
const formatCellValue = (entry: RockTypeEntry) => formatProbability(entry.prob);

export function RockTypeLocationsPivotAdapter({
  allLocations,
  allRockTypes,
}: RockTypeLocationsPivotAdapterProps) {
  const rows: PivotRow<RockTypeEntry>[] = useMemo(
    () =>
      allLocations.map((loc) => ({
        id: loc.location,
        label: formatLocationName(loc.location),
        entries: loc.rockTypes,
      })),
    [allLocations],
  );

  const columns: PivotColumn[] = useMemo(
    () =>
      allRockTypes.map((rt) => ({
        id: rt,
        label: formatOreName(rt),
        colorVariant: getOreColor(rt),
      })),
    [allRockTypes],
  );

  const locationMap = useMemo(() => {
    const map = new Map<string, RockTypeLocationRow>();
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
      entry: RockTypeEntry,
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
            <span className="text-muted">Scans</span>
            <span>{formatNumber(entry.scans)}</span>
            <span className="text-muted">Clusters</span>
            <span>{formatNumber(entry.clusters)}</span>
            <span className="text-muted">Mass (med)</span>
            <span>{formatStat(entry.mass.med)}</span>
            <span className="text-muted">Instability (med)</span>
            <span>{formatStat(entry.inst.med)}</span>
            <span className="text-muted">Resistance (med)</span>
            <span>{formatStat(entry.res.med)}</span>
          </div>
          {loc && (
            <div className="border-t border-border-subtle pt-1.5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                <span className="text-muted">Location Scans</span>
                <span>{formatNumber(loc.scans)}</span>
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
    <PivotTable<RockTypeEntry>
      ariaLabel="Rock type locations probability matrix"
      rows={rows}
      columns={columns}
      getProbability={getProbability}
      formatCellValue={formatCellValue}
      renderTooltipContent={renderTooltipContent}
      searchPlaceholder="Filter locations..."
      columnFilterLabel="Rock Types"
    />
  );
}
