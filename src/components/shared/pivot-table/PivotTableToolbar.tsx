"use client";

import { useState, useMemo } from "react";
import { SearchField, Label, Button, Popover, Checkbox } from "@heroui/react";
import type { PivotColumn } from "@/types";
import { formatOreName } from "@/lib/constants";
import { OreChip } from "@/components/shared/OreChip";

interface PivotTableToolbarProps {
  locationSearch: string;
  onLocationSearchChange: (value: string) => void;
  searchPlaceholder: string;
  columns: PivotColumn[];
  visibleColumns: Set<string>;
  onToggleColumn: (columnId: string) => void;
  onSelectAllColumns: () => void;
  onClearAllColumns: () => void;
  totalColumns: number;
  columnFilterLabel: string;
}

export function PivotTableToolbar({
  locationSearch,
  onLocationSearchChange,
  searchPlaceholder,
  columns,
  visibleColumns,
  onToggleColumn,
  onSelectAllColumns,
  onClearAllColumns,
  totalColumns,
  columnFilterLabel,
}: PivotTableToolbarProps) {
  const [columnSearch, setColumnSearch] = useState("");

  const filteredColumns = useMemo(() => {
    if (!columnSearch) return columns;
    const q = columnSearch.toLowerCase();
    return columns.filter((col) =>
      formatOreName(col.id).toLowerCase().includes(q),
    );
  }, [columns, columnSearch]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Location search */}
      <SearchField
        aria-label="Search locations"
        value={locationSearch}
        onChange={onLocationSearchChange}
        className="w-full sm:w-72"
      >
        <Label>Search Locations</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder={searchPlaceholder} />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      {/* Column filter popover */}
      <Popover>
        <Popover.Trigger>
          <Button variant="ghost" size="sm">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mr-1.5"
            >
              <path d="M2 4h12M4 8h8M6 12h4" strokeLinecap="round" />
            </svg>
            {columnFilterLabel} ({visibleColumns.size}/{totalColumns})
          </Button>
        </Popover.Trigger>
        <Popover.Content placement="bottom start" className="w-64">
          <Popover.Dialog className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                {columnFilterLabel}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={onSelectAllColumns}
                >
                  All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={onClearAllColumns}
                >
                  None
                </Button>
              </div>
            </div>
            {/* Search within column list */}
            <SearchField
              aria-label={`Search ${columnFilterLabel.toLowerCase()}`}
              value={columnSearch}
              onChange={setColumnSearch}
              className="mb-2"
            >
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input
                  placeholder={`Search ${columnFilterLabel.toLowerCase()}...`}
                />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {filteredColumns.length === 0 ? (
                <p className="py-2 text-center text-xs text-muted-deeper">
                  No matches
                </p>
              ) : (
                filteredColumns.map((col) => (
                  <label
                    key={col.id}
                    className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 hover:bg-surface-hover"
                  >
                    <Checkbox
                      isSelected={visibleColumns.has(col.id)}
                      onChange={() => onToggleColumn(col.id)}
                    />
                    <OreChip name={col.id} size="sm" />
                  </label>
                ))
              )}
            </div>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    </div>
  );
}
