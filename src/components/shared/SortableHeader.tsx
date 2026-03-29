import type { SortDescriptor } from "@heroui/react";
import { SortIndicator } from "./SortIndicator";

interface SortableHeaderProps {
  columnId: string;
  sortDescriptor: SortDescriptor | undefined;
  onSortChange: (descriptor: SortDescriptor) => void;
  children: React.ReactNode;
}

export function SortableHeader({
  columnId,
  sortDescriptor,
  onSortChange,
  children,
}: SortableHeaderProps) {
  const isActive = sortDescriptor?.column === columnId;
  const direction = isActive ? sortDescriptor.direction : undefined;

  function handleClick() {
    const nextDirection =
      isActive && sortDescriptor!.direction === "ascending"
        ? "descending"
        : "ascending";
    onSortChange({ column: columnId, direction: nextDirection });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-0.5 transition-colors hover:text-heading focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-subtle"
    >
      {children}
      <SortIndicator direction={direction} />
    </button>
  );
}
