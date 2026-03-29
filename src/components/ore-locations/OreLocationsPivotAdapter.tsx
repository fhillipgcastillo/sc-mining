"use client";

import { useMemo, useCallback } from "react";
import type { OreLocationRow, OreEntry, PivotRow, PivotColumn, LocationHierarchyData } from "@/types";
import { formatLocationName, formatOreName, getOreColor, LOCATION_TYPE_LABELS, SPAWN_TYPE_LABELS } from "@/lib/constants";
import { formatProbability, formatPercent, formatNumber } from "@/lib/formatting";
import { OreChip } from "@/components/shared/OreChip";
import { PivotTable } from "@/components/shared/pivot-table/PivotTable";

interface OreLocationsPivotAdapterProps {
  allLocations: OreLocationRow[];
  allOreTypes: string[];
  locationHierarchy: LocationHierarchyData;
}

const getProbability = (entry: OreEntry) => entry.prob;
const formatCellValue = (entry: OreEntry) => formatProbability(entry.prob);

export function OreLocationsPivotAdapter({
  allLocations,
  allOreTypes,
  locationHierarchy,
}: OreLocationsPivotAdapterProps) {
  const rows: PivotRow<OreEntry>[] = useMemo(
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
      allOreTypes.map((ore) => ({
        id: ore,
        label: formatOreName(ore),
        colorVariant: getOreColor(ore),
      })),
    [allOreTypes],
  );

  // Build a lookup map for location-level stats in tooltips
  const locationMap = useMemo(() => {
    const map = new Map<string, OreLocationRow>();
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
      entry: OreEntry,
    ) => {
      const loc = locationMap.get(rowId);
      const meta = locationHierarchy[rowId];
      return (
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <OreChip name={colId} size="sm" />
            <span className="text-muted">at</span>
            <span className="font-medium text-heading">{rowLabel}</span>
          </div>
          {meta && (
            <div className="flex items-center gap-2 text-muted">
              <span>{LOCATION_TYPE_LABELS[meta.type] ?? meta.type}</span>
              <span>&middot;</span>
              <span>{SPAWN_TYPE_LABELS[meta.spawnType] ?? meta.spawnType}</span>
              <span>&middot;</span>
              <span>{meta.system.charAt(0) + meta.system.slice(1).toLowerCase()}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            <span className="text-muted">Probability</span>
            <span className="font-semibold text-accent">
              {formatProbability(entry.prob)}
            </span>
            <span className="text-muted">Min %</span>
            <span>{formatPercent(entry.minPct)}</span>
            <span className="text-muted">Max %</span>
            <span>{formatPercent(entry.maxPct)}</span>
            <span className="text-muted">Median %</span>
            <span>{formatPercent(entry.medPct)}</span>
          </div>
          {loc && (
            <div className="border-t border-border-subtle pt-1.5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                <span className="text-muted">Scans</span>
                <span>{formatNumber(loc.scans)}</span>
                <span className="text-muted">Users</span>
                <span>{formatNumber(loc.users)}</span>
              </div>
            </div>
          )}
        </div>
      );
    },
    [locationMap, locationHierarchy],
  );

  return (
    <PivotTable<OreEntry>
      ariaLabel="Ore locations probability matrix"
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
