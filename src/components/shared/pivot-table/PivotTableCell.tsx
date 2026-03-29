import { memo, type ReactNode } from "react";
import { Tooltip } from "@heroui/react";
import { getHeatMapClass } from "./pivot-table-utils";

interface PivotTableCellProps<TEntry> {
  entry: TEntry | undefined;
  probability: number;
  formattedValue: string;
  rowId: string;
  rowLabel: string;
  colId: string;
  colLabel: string;
  renderTooltipContent: (
    rowId: string,
    rowLabel: string,
    colId: string,
    colLabel: string,
    entry: TEntry,
  ) => ReactNode;
}

function PivotTableCellInner<TEntry>({
  entry,
  probability,
  formattedValue,
  rowId,
  rowLabel,
  colId,
  colLabel,
  renderTooltipContent,
}: PivotTableCellProps<TEntry>) {
  if (!entry) {
    return (
      <div
        role="gridcell"
        className="flex items-center justify-center border-b border-border-subtle px-2 py-1.5 text-center text-sm text-muted-deeper"
      >
        &mdash;
      </div>
    );
  }

  const heatMapClass = getHeatMapClass(probability);

  return (
    <div role="gridcell" className="border-b border-border-subtle">
      <Tooltip>
        <Tooltip.Trigger>
          <button
            type="button"
            className={`flex h-full w-full items-center justify-center px-2 py-1.5 text-center text-sm tabular-nums transition-colors hover:bg-accent/15 ${heatMapClass}`}
          >
            {formattedValue}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content
          placement="top"
          className="max-w-xs rounded-lg border border-border-subtle bg-background p-3 shadow-xl"
        >
          {renderTooltipContent(rowId, rowLabel, colId, colLabel, entry)}
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
}

export const PivotTableCell = memo(PivotTableCellInner) as typeof PivotTableCellInner;
