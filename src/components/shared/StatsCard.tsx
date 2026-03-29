import { Card } from "@heroui/react";
import type { StatRange } from "@/types";
import { formatStat } from "@/lib/formatting";

interface StatsCardProps {
  label: string;
  range: StatRange;
  unit?: string;
}

export function StatsCard({ label, range, unit }: StatsCardProps) {
  return (
    <Card variant="secondary" className="min-w-0">
      <Card.Header className="pb-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          {label}
        </p>
      </Card.Header>
      <Card.Content>
        <dl className="grid grid-cols-3 gap-2 text-center">
          <div>
            <dt className="text-xs text-muted-deeper">Min</dt>
            <dd className="text-sm font-semibold text-heading">
              {formatStat(range.min, unit)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-deeper">Median</dt>
            <dd className="text-sm font-semibold text-accent">
              {formatStat(range.med, unit)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-deeper">Max</dt>
            <dd className="text-sm font-semibold text-heading">
              {formatStat(range.max, unit)}
            </dd>
          </div>
        </dl>
      </Card.Content>
    </Card>
  );
}
