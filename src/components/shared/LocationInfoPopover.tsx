"use client";

import { Popover, Chip } from "@heroui/react";
import type { ChipVariants } from "@heroui/react";
import type { LocationHierarchyData } from "@/types";
import {
  LOCATION_TYPE_COLORS,
  LOCATION_TYPE_LABELS,
  SPAWN_TYPE_COLORS,
  SPAWN_TYPE_LABELS,
} from "@/lib/constants";

const COLOR_MAP: Record<string, ChipVariants["color"]> = {
  warning: "warning",
  primary: "accent",
  secondary: "default",
  success: "success",
  danger: "danger",
  default: "default",
};

interface LocationInfoPopoverProps {
  locationKey: string;
  hierarchy: LocationHierarchyData;
  children: React.ReactNode;
}

export function LocationInfoPopover({
  locationKey,
  hierarchy,
  children,
}: LocationInfoPopoverProps) {
  const meta = hierarchy[locationKey];
  if (!meta) return <>{children}</>;

  const parentMeta = meta.parent ? hierarchy[meta.parent] : null;

  // Siblings: other children of the same parent (capped for display)
  const siblings = meta.parent && parentMeta
    ? parentMeta.children.filter((k) => k !== locationKey)
    : [];
  const maxSiblings = 8;
  const shownSiblings = siblings.slice(0, maxSiblings);
  const hiddenCount = siblings.length - maxSiblings;

  // Own children (planets/belts that have children locations)
  const maxChildren = 8;
  const shownChildren = meta.children.slice(0, maxChildren);
  const hiddenChildCount = meta.children.length - maxChildren;

  const typeColor: ChipVariants["color"] =
    COLOR_MAP[LOCATION_TYPE_COLORS[meta.type]] ?? "default";
  const spawnColor: ChipVariants["color"] =
    COLOR_MAP[SPAWN_TYPE_COLORS[meta.spawnType]] ?? "default";

  return (
    <Popover>
      <Popover.Trigger>{children}</Popover.Trigger>
      <Popover.Content placement="bottom start" className="w-72">
        <Popover.Dialog className="p-3 space-y-2.5">
          {/* Header: name + type chip */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-heading truncate">
                {meta.displayName}
              </p>
              <p className="text-xs text-muted">
                {meta.system.charAt(0) + meta.system.slice(1).toLowerCase()}
                {parentMeta && (
                  <> &rsaquo; {parentMeta.displayName}</>
                )}
              </p>
            </div>
            <Chip color={typeColor} size="sm" variant="primary">
              {LOCATION_TYPE_LABELS[meta.type] ?? meta.type}
            </Chip>
          </div>

          {/* Mining type */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Mining:</span>
            <Chip color={spawnColor} size="sm" variant="primary">
              {SPAWN_TYPE_LABELS[meta.spawnType] ?? meta.spawnType}
            </Chip>
          </div>

          {/* Children (if this is a parent location) */}
          {shownChildren.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">
                Children
              </p>
              <div className="flex flex-wrap gap-1">
                {shownChildren.map((key) => {
                  const child = hierarchy[key];
                  return (
                    <span
                      key={key}
                      className="inline-block rounded bg-surface-hover px-1.5 py-0.5 text-xs text-heading"
                    >
                      {child?.displayName ?? key}
                    </span>
                  );
                })}
                {hiddenChildCount > 0 && (
                  <span className="inline-block rounded bg-surface-hover px-1.5 py-0.5 text-xs text-muted">
                    +{hiddenChildCount} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Siblings (nearby locations under the same parent) */}
          {shownSiblings.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">
                Nearby
              </p>
              <div className="flex flex-wrap gap-1">
                {shownSiblings.map((key) => {
                  const sib = hierarchy[key];
                  return (
                    <span
                      key={key}
                      className="inline-block rounded bg-surface-hover px-1.5 py-0.5 text-xs text-heading"
                    >
                      {sib?.displayName ?? key}
                    </span>
                  );
                })}
                {hiddenCount > 0 && (
                  <span className="inline-block rounded bg-surface-hover px-1.5 py-0.5 text-xs text-muted">
                    +{hiddenCount} more
                  </span>
                )}
              </div>
            </div>
          )}
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
