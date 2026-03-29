import { type ReactNode } from "react";
import type { PivotRow, PivotColumn, PivotSort } from "@/types";
import { OreChip } from "@/components/shared/OreChip";
import { PivotTableCell } from "./PivotTableCell";

interface PivotTableGridProps<TEntry> {
  rows: PivotRow<TEntry>[];
  columns: PivotColumn[];
  sort: PivotSort;
  onToggleSort: (columnId: string) => void;
  getProbability: (entry: TEntry) => number;
  formatCellValue: (entry: TEntry) => string;
  renderTooltipContent: (
    rowId: string,
    rowLabel: string,
    colId: string,
    colLabel: string,
    entry: TEntry,
  ) => ReactNode;
  ariaLabel: string;
}

function SortIcon({ direction }: { direction: "asc" | "desc" }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="currentColor"
      className="ml-0.5 inline-block shrink-0"
    >
      {direction === "desc" ? (
        <path d="M6 8L2 4h8L6 8z" />
      ) : (
        <path d="M6 4L2 8h8L6 4z" />
      )}
    </svg>
  );
}

export function PivotTableGrid<TEntry>({
  rows,
  columns,
  sort,
  onToggleSort,
  getProbability,
  formatCellValue,
  renderTooltipContent,
  ariaLabel,
}: PivotTableGridProps<TEntry>) {
  const colCount = columns.length + 1; // +1 for location column

  return (
    <div
      className="overflow-auto rounded-lg border border-border-subtle"
      style={{ maxHeight: "80vh" }}
    >
      <div
        role="grid"
        aria-label={ariaLabel}
        className="grid"
        style={{
          gridTemplateColumns: `minmax(160px, 200px) repeat(${columns.length}, minmax(72px, 1fr))`,
          minWidth: `${160 + columns.length * 72}px`,
        }}
      >
        {/* Header row */}
        <div role="row" className="contents">
          {/* Corner cell */}
          <div
            role="columnheader"
            className="sticky left-0 top-0 z-30 flex items-center border-b border-r border-border-subtle bg-surface px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Location
          </div>

          {/* Column headers */}
          {columns.map((col) => {
            const isActive = sort.columnId === col.id;
            const ariaSortValue = isActive
              ? sort.direction === "asc"
                ? "ascending"
                : "descending"
              : "none";

            return (
              <div
                key={col.id}
                role="columnheader"
                aria-sort={ariaSortValue as React.AriaAttributes["aria-sort"]}
                className="sticky top-0 z-20 border-b border-border-subtle bg-surface"
              >
                <button
                  type="button"
                  onClick={() => onToggleSort(col.id)}
                  className={`flex w-full items-center justify-center gap-1 px-1 py-2 text-xs transition-colors hover:bg-surface-hover ${
                    isActive ? "text-accent font-semibold" : "text-muted"
                  }`}
                  title={`Sort by ${col.label}`}
                >
                  <OreChip name={col.id} size="sm" />
                  {isActive && <SortIcon direction={sort.direction} />}
                </button>
              </div>
            );
          })}
        </div>

        {/* Data rows */}
        {rows.length === 0 ? (
          <div
            role="row"
            className="contents"
          >
            <div
              role="gridcell"
              className="col-span-full py-12 text-center text-muted-deeper"
              style={{ gridColumn: `1 / ${colCount + 1}` }}
            >
              No locations match your filters.
            </div>
          </div>
        ) : (
          rows.map((row, rowIndex) => (
            <div key={row.id} role="row" className="contents">
              {/* Row header — location name */}
              <div
                role="rowheader"
                className={`sticky left-0 z-10 flex items-center border-b border-r border-border-subtle px-3 py-1.5 text-sm font-medium text-heading ${
                  rowIndex % 2 === 0 ? "bg-background" : "bg-row-bg"
                }`}
              >
                <span className="truncate" title={row.label}>
                  {row.label}
                </span>
              </div>

              {/* Data cells */}
              {columns.map((col) => {
                const entry = row.entries[col.id];
                return (
                  <PivotTableCell
                    key={col.id}
                    entry={entry}
                    probability={entry ? getProbability(entry) : 0}
                    formattedValue={entry ? formatCellValue(entry) : ""}
                    rowId={row.id}
                    rowLabel={row.label}
                    colId={col.id}
                    colLabel={col.label}
                    renderTooltipContent={renderTooltipContent}
                  />
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
