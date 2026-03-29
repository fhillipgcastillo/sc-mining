import { useState, useMemo, useEffect, useCallback } from "react";
import type { PivotRow, PivotColumn, PivotSort } from "@/types";

interface UsePivotTableStateOptions<TEntry> {
  rows: PivotRow<TEntry>[];
  columns: PivotColumn[];
  getProbability: (entry: TEntry) => number;
}

export function usePivotTableState<TEntry>({
  rows,
  columns,
  getProbability,
}: UsePivotTableStateOptions<TEntry>) {
  const [locationSearch, setLocationSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    () => new Set(columns.map((c) => c.id)),
  );
  const [sort, setSort] = useState<PivotSort>({
    columnId: null,
    direction: "desc",
  });

  // Debounce location search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(locationSearch), 200);
    return () => clearTimeout(timer);
  }, [locationSearch]);

  // Reset visible columns when columns change
  useEffect(() => {
    setVisibleColumns(new Set(columns.map((c) => c.id)));
  }, [columns]);

  const filteredRows = useMemo(() => {
    if (!debouncedSearch) return rows;
    const q = debouncedSearch.toLowerCase();
    return rows.filter((row) => row.label.toLowerCase().includes(q));
  }, [rows, debouncedSearch]);

  const sortedRows = useMemo(() => {
    if (!sort.columnId) return filteredRows;
    const colId = sort.columnId;
    return [...filteredRows].sort((a, b) => {
      const aEntry = a.entries[colId];
      const bEntry = b.entries[colId];
      const aProb = aEntry ? getProbability(aEntry) : -1;
      const bProb = bEntry ? getProbability(bEntry) : -1;
      return sort.direction === "desc" ? bProb - aProb : aProb - bProb;
    });
  }, [filteredRows, sort, getProbability]);

  const displayColumns = useMemo(
    () => columns.filter((c) => visibleColumns.has(c.id)),
    [columns, visibleColumns],
  );

  const toggleColumn = useCallback((columnId: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  }, []);

  const selectAllColumns = useCallback(() => {
    setVisibleColumns(new Set(columns.map((c) => c.id)));
  }, [columns]);

  const clearAllColumns = useCallback(() => {
    setVisibleColumns(new Set());
  }, []);

  const toggleSort = useCallback((columnId: string) => {
    setSort((prev) => {
      if (prev.columnId === columnId) {
        if (prev.direction === "desc") {
          return { columnId, direction: "asc" };
        }
        // Clicking a third time clears the sort
        return { columnId: null, direction: "desc" };
      }
      return { columnId, direction: "desc" };
    });
  }, []);

  return {
    locationSearch,
    setLocationSearch,
    visibleColumns,
    toggleColumn,
    selectAllColumns,
    clearAllColumns,
    sort,
    toggleSort,
    sortedRows,
    displayColumns,
    totalColumns: columns.length,
  };
}
