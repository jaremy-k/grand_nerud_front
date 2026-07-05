"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DslDocs } from "@/services/calculation-rules";
import { getFunctionInsert } from "../lib/insert-at-cursor";
import { useMemo, useState } from "react";

type ReferenceTab = "variables" | "functions" | "syntax";

interface DslReferencePanelProps {
  docs: DslDocs;
  onInsert: (text: string, cursorOffset?: number) => void;
  activeFieldLabel?: string;
}

function filterByQuery<T extends { name?: string; description?: string }>(
  items: T[],
  query: string
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) =>
      item.name?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
  );
}

export function DslReferencePanel({
  docs,
  onInsert,
  activeFieldLabel,
}: DslReferencePanelProps) {
  const [tab, setTab] = useState<ReferenceTab>("variables");
  const [query, setQuery] = useState("");

  const filteredVariables = useMemo(
    () => filterByQuery(docs.variables, query),
    [docs.variables, query]
  );
  const filteredFunctions = useMemo(
    () => filterByQuery(docs.functions, query),
    [docs.functions, query]
  );

  const tabs: { key: ReferenceTab; label: string; count: number }[] = [
    { key: "variables", label: "Переменные", count: docs.variables.length },
    { key: "functions", label: "Функции", count: docs.functions.length },
    { key: "syntax", label: "Синтаксис", count: docs.syntax.length },
  ];

  return (
    <div className="sticky top-4 space-y-3 rounded-xl border bg-card p-4 shadow-sm">
      <div>
        <p className="font-semibold">Справочник DSL</p>
        {activeFieldLabel ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Вставка в:{" "}
            <span className="font-medium text-foreground">{activeFieldLabel}</span>
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Выберите поле — клик по элементу вставит его в формулу
          </p>
        )}
      </div>

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск…"
        className="h-8 text-sm"
      />

      <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              tab === t.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
            <span className="ml-1 tabular-nums text-muted-foreground">
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div className="max-h-[min(420px,50vh)] overflow-y-auto pr-1">
        {tab === "variables" && (
          <ul className="space-y-1">
            {filteredVariables.length === 0 && (
              <li className="py-4 text-center text-xs text-muted-foreground">
                Ничего не найдено
              </li>
            )}
            {filteredVariables.map((v) => (
              <li key={v.name}>
                <button
                  type="button"
                  disabled={!activeFieldLabel}
                  onClick={() => onInsert(v.name)}
                  className="group w-full rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors hover:border-border hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <code className="text-xs font-semibold text-primary group-hover:underline">
                    {v.name}
                  </code>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {v.description}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}

        {tab === "functions" && (
          <ul className="space-y-1">
            {filteredFunctions.length === 0 && (
              <li className="py-4 text-center text-xs text-muted-foreground">
                Ничего не найдено
              </li>
            )}
            {filteredFunctions.map((f) => (
              <li key={f.name}>
                <button
                  type="button"
                  disabled={!activeFieldLabel}
                  onClick={() => {
                    const insert = getFunctionInsert(f.name);
                    onInsert(insert, insert.length - 1);
                  }}
                  className="group w-full rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors hover:border-border hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <code className="text-xs font-semibold text-primary group-hover:underline">
                    {f.name}()
                  </code>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {f.description}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}

        {tab === "syntax" && (
          <ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">
            {docs.syntax.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
