"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DslDocs } from "@/services/calculation-rules";
import { getFunctionInsert } from "../lib/insert-at-cursor";
import { NamedLabel } from "../lib/formula-display";
import { useMemo, useState } from "react";

type ReferenceTab = "fields" | "variables" | "functions" | "syntax";

interface DslReferencePanelProps {
  docs: DslDocs;
  ruleFields: NamedLabel[];
  activeFieldName?: string;
  onInsert: (text: string, cursorOffset?: number) => void;
  activeFieldLabel?: string;
}

function filterByQuery(
  items: Array<{ name: string; label: string; hint?: string }>,
  query: string
) {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.label.toLowerCase().includes(q) ||
      item.hint?.toLowerCase().includes(q)
  );
}

function ReferenceItem({
  label,
  name,
  hint,
  disabled,
  onClick,
}: {
  label: string;
  name: string;
  hint?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  const showCode = label !== name;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group w-full rounded-lg border border-transparent px-2 py-2 text-left transition-colors hover:border-border hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="block text-sm font-medium leading-snug group-hover:text-primary">
        {label}
      </span>
      {showCode && (
        <code className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
          {name}
        </code>
      )}
      {hint && (
        <p className="mt-1 text-xs leading-snug text-muted-foreground">{hint}</p>
      )}
    </button>
  );
}

export function DslReferencePanel({
  docs,
  ruleFields,
  activeFieldName,
  onInsert,
  activeFieldLabel,
}: DslReferencePanelProps) {
  const [tab, setTab] = useState<ReferenceTab>("fields");
  const [query, setQuery] = useState("");

  const availableRuleFields = useMemo(
    () => ruleFields.filter((f) => f.name !== activeFieldName),
    [ruleFields, activeFieldName]
  );

  const variableItems = useMemo(
    () =>
      docs.variables.map((v) => ({
        name: v.name,
        label: v.description?.trim() || v.name,
        hint: v.description?.trim() && v.description !== v.name ? undefined : v.name,
      })),
    [docs.variables]
  );

  const functionItems = useMemo(
    () =>
      docs.functions.map((f) => ({
        name: f.name,
        label: f.description?.trim() || f.name,
        hint: f.description?.trim() ? `${f.name}()` : undefined,
      })),
    [docs.functions]
  );

  const filteredFields = useMemo(
    () => filterByQuery(availableRuleFields, query),
    [availableRuleFields, query]
  );
  const filteredVariables = useMemo(
    () => filterByQuery(variableItems, query),
    [variableItems, query]
  );
  const filteredFunctions = useMemo(
    () => filterByQuery(functionItems, query),
    [functionItems, query]
  );

  const tabs: { key: ReferenceTab; label: string; count: number }[] = [
    { key: "fields", label: "Поля", count: availableRuleFields.length },
    { key: "variables", label: "Данные", count: docs.variables.length },
    { key: "functions", label: "Функции", count: docs.functions.length },
    { key: "syntax", label: "Синтаксис", count: docs.syntax.length },
  ];

  const canInsert = Boolean(activeFieldLabel);

  return (
    <div className="sticky top-4 space-y-3 rounded-xl border bg-card p-4 shadow-sm">
      <div>
        <p className="font-semibold">Справочник</p>
        {activeFieldLabel ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Вставка в{" "}
            <span className="font-medium text-foreground">{activeFieldLabel}</span>
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Выберите поле слева — затем кликните элемент для вставки
          </p>
        )}
      </div>

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск по подписи или имени…"
        className="h-8 text-sm"
      />

      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted/50 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
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
        {tab === "fields" && (
          <ul className="space-y-0.5">
            {filteredFields.length === 0 && (
              <li className="py-4 text-center text-xs text-muted-foreground">
                {availableRuleFields.length === 0
                  ? "Добавьте ещё поля в набор"
                  : "Ничего не найдено"}
              </li>
            )}
            {filteredFields.map((field) => (
              <li key={field.name}>
                <ReferenceItem
                  label={field.label}
                  name={field.name}
                  hint="Рассчитывается ранее в этом наборе"
                  disabled={!canInsert}
                  onClick={() => onInsert(field.name)}
                />
              </li>
            ))}
          </ul>
        )}

        {tab === "variables" && (
          <ul className="space-y-0.5">
            {filteredVariables.length === 0 && (
              <li className="py-4 text-center text-xs text-muted-foreground">
                Ничего не найдено
              </li>
            )}
            {filteredVariables.map((v) => (
              <li key={v.name}>
                <ReferenceItem
                  label={v.label}
                  name={v.name}
                  disabled={!canInsert}
                  onClick={() => onInsert(v.name)}
                />
              </li>
            ))}
          </ul>
        )}

        {tab === "functions" && (
          <ul className="space-y-0.5">
            {filteredFunctions.length === 0 && (
              <li className="py-4 text-center text-xs text-muted-foreground">
                Ничего не найдено
              </li>
            )}
            {filteredFunctions.map((f) => (
              <li key={f.name}>
                <ReferenceItem
                  label={f.label}
                  name={`${f.name}()`}
                  disabled={!canInsert}
                  onClick={() => {
                    const insert = getFunctionInsert(f.name);
                    onInsert(insert, insert.length - 1);
                  }}
                />
              </li>
            ))}
          </ul>
        )}

        {tab === "syntax" && (
          <ul className="list-disc space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
            {docs.syntax.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
