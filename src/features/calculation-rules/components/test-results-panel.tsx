"use client";

import { formatCurrency } from "@/lib/formatters";
import { resolveLabel } from "../lib/formula-display";

function formatTestValue(value: number): string {
  if (Math.abs(value) > 1000) return formatCurrency(value);
  return value.toLocaleString("ru-RU", { maximumFractionDigits: 4 });
}

export function TestResultsPanel({
  results,
  labelByName,
}: {
  results: Record<string, number>;
  labelByName: Record<string, string>;
}) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <p className="mb-3 text-sm font-semibold">Результат теста</p>
      <dl className="space-y-2.5">
        {Object.entries(results).map(([key, value]) => {
          const label = resolveLabel(key, labelByName);
          const showCode = label !== key;

          return (
            <div
              key={key}
              className="flex items-start justify-between gap-3 border-b border-primary/10 pb-2 last:border-0 last:pb-0"
            >
              <dt className="min-w-0">
                <span className="block text-sm font-medium">{label}</span>
                {showCode && (
                  <code className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
                    {key}
                  </code>
                )}
              </dt>
              <dd className="shrink-0 text-sm font-semibold tabular-nums">
                {formatTestValue(value)}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
