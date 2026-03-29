import { useState, useMemo, useCallback } from "react";
import type { SortDescriptor } from "@heroui/react";

export type { SortDescriptor };

export type SortAccessor<T> = keyof T | ((item: T) => string | number);

export type SortAccessorMap<T> = Record<string, SortAccessor<T>>;

export interface UseSortOptions<T> {
  data: T[];
  columns: SortAccessorMap<T>;
  defaultSort?: SortDescriptor;
}

export interface UseSortReturn<T> {
  sortedData: T[];
  sortDescriptor: SortDescriptor | undefined;
  onSortChange: (descriptor: SortDescriptor) => void;
}

export function useSort<T>({
  data,
  columns,
  defaultSort,
}: UseSortOptions<T>): UseSortReturn<T> {
  const [sortDescriptor, setSortDescriptor] = useState<
    SortDescriptor | undefined
  >(defaultSort);

  const onSortChange = useCallback((descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
  }, []);

  const sortedData = useMemo(() => {
    if (!sortDescriptor) return data;

    const columnId = String(sortDescriptor.column);
    const accessor = columns[columnId];
    if (!accessor) return data;

    const getValue = (item: T): string | number => {
      if (typeof accessor === "function") {
        return accessor(item);
      }
      return item[accessor] as string | number;
    };

    const direction = sortDescriptor.direction === "ascending" ? 1 : -1;

    return [...data].sort((a, b) => {
      const aVal = getValue(a);
      const bVal = getValue(b);

      if (typeof aVal === "string" && typeof bVal === "string") {
        return direction * aVal.localeCompare(bVal);
      }

      return direction * ((aVal as number) - (bVal as number));
    });
  }, [data, sortDescriptor, columns]);

  return { sortedData, sortDescriptor, onSortChange };
}
