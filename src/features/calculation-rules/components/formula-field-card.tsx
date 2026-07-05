"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { FormulaField } from "@/services/calculation-rules";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DatabaseIcon,
  GripVerticalIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { FormulaEditor } from "./formula-editor";

interface FormulaFieldCardProps {
  field: FormulaField;
  index: number;
  total: number;
  siblingFields: string[];
  testValue?: number;
  isActive: boolean;
  onFocus: () => void;
  onRegisterInsert?: (
    handler: ((text: string, cursorOffset?: number) => void) | null
  ) => void;
  onChange: (patch: Partial<FormulaField>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function formatTestValue(value: number): string {
  if (Math.abs(value) > 1000) return formatCurrency(value);
  return value.toLocaleString("ru-RU", { maximumFractionDigits: 4 });
}

export function FormulaFieldCard({
  field,
  index,
  total,
  siblingFields,
  testValue,
  isActive,
  onFocus,
  onRegisterInsert,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: FormulaFieldCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  const displayTitle = field.label?.trim() || field.name || `Поле ${index + 1}`;

  return (
    <div
      className={cn(
        "rounded-xl border bg-card shadow-sm transition-colors",
        isActive && "border-primary/40 ring-1 ring-primary/20"
      )}
    >
      <div className="flex items-start gap-2 p-4 pb-0">
        <GripVerticalIcon className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/50" />
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={() => setCollapsed((c) => !c)}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{displayTitle}</span>
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              {field.name}
            </code>
            {field.store && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                <DatabaseIcon className="h-3 w-3" />
                В сделке
              </span>
            )}
            {testValue !== undefined && (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-xs tabular-nums text-emerald-700 dark:text-emerald-400">
                = {formatTestValue(testValue)}
              </span>
            )}
          </div>
          {collapsed && field.expression && (
            <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
              {field.expression}
            </p>
          )}
        </button>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={index === 0}
            onClick={onMoveUp}
            aria-label="Переместить выше"
          >
            <ChevronUpIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={index >= total - 1}
            onClick={onMoveDown}
            aria-label="Переместить ниже"
          >
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Развернуть" : "Свернуть"}
          >
            <ChevronDownIcon
              className={cn(
                "h-4 w-4 transition-transform",
                !collapsed && "rotate-180"
              )}
            />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onRemove}
            aria-label="Удалить поле"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!collapsed && (
        <div className="space-y-4 p-4 pt-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Имя поля (camelCase)</Label>
              <Input
                value={field.name}
                onChange={(e) => onChange({ name: e.target.value })}
                onFocus={onFocus}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label>Подпись</Label>
              <Input
                value={field.label || ""}
                onChange={(e) => onChange({ label: e.target.value })}
                onFocus={onFocus}
                className="mt-1"
              />
            </div>
          </div>

          <FormulaEditor
            value={field.expression}
            onChange={(expression) => onChange({ expression })}
            onFocus={onFocus}
            isActive={isActive}
            onRegisterInsert={onRegisterInsert}
            siblingFields={siblingFields}
          />

          <div className="flex items-center gap-2">
            <Switch
              checked={field.store}
              onCheckedChange={(store) => onChange({ store })}
            />
            <Label className="text-sm font-normal">Сохранять в сделке</Label>
          </div>
        </div>
      )}
    </div>
  );
}
