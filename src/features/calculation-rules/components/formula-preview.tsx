"use client";

import { cn } from "@/lib/utils";
import { EyeIcon } from "lucide-react";
import { humanizeFormula } from "../lib/formula-display";

export function FormulaPreview({
  expression,
  labelByName,
  className,
}: {
  expression: string;
  labelByName: Record<string, string>;
  className?: string;
}) {
  const readable = humanizeFormula(expression, labelByName);
  const hasSubstitutions = readable !== expression;

  if (!expression.trim()) return null;

  return (
    <div
      className={cn(
        "rounded-md border border-dashed border-border/70 bg-muted/20 px-3 py-2",
        className
      )}
    >
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <EyeIcon className="h-3 w-3" />
        Читаемый вид
      </div>
      <p
        className={cn(
          "text-sm leading-relaxed",
          hasSubstitutions ? "text-foreground" : "font-mono text-muted-foreground"
        )}
      >
        {hasSubstitutions ? readable : expression}
      </p>
      {hasSubstitutions && (
        <p className="mt-1.5 font-mono text-xs text-muted-foreground">
          {expression}
        </p>
      )}
    </div>
  );
}
