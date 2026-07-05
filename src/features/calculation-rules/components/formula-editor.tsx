"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Maximize2Icon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { insertAtCursor } from "../lib/insert-at-cursor";

const OPERATORS: { label: string; insert: string; title?: string }[] = [
  { label: "+", insert: " + " },
  { label: "−", insert: " - " },
  { label: "×", insert: " * " },
  { label: "÷", insert: " / " },
  { label: "**", insert: " ** ", title: "Степень" },
  { label: "(", insert: "(" },
  { label: ")", insert: ")" },
  { label: "==", insert: " == " },
  { label: "!=", insert: " != " },
  { label: "and", insert: " and " },
  { label: "or", insert: " or " },
  { label: "if", insert: "if  else ", title: "Условие if … else …" },
];

interface FormulaEditorProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  isActive?: boolean;
  onRegisterInsert?: (
    handler: ((text: string, cursorOffset?: number) => void) | null
  ) => void;
  siblingFields?: string[];
  className?: string;
  label?: string;
}

function FormulaTextarea({
  value,
  onChange,
  onFocus,
  textareaRef,
  minHeight = "min-h-[88px]",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  minHeight?: string;
  className?: string;
}) {
  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      spellCheck={false}
      placeholder="Например: amountSalesTotal * (1 + taxPercent / 100)"
      className={cn(
        "resize-y rounded-t-none border-t-0 bg-muted/30 font-mono text-sm leading-relaxed focus-visible:ring-1",
        minHeight,
        className
      )}
    />
  );
}

export function FormulaEditor({
  value,
  onChange,
  onFocus,
  isActive,
  onRegisterInsert,
  siblingFields = [],
  className,
  label = "Формула",
}: FormulaEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [focused, setFocused] = useState(false);

  const insert = useCallback(
    (text: string, cursorOffset?: number) => {
      const el = textareaRef.current;
      if (!el) {
        onChange(value + text);
        return;
      }
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const { newValue, newCursor } = insertAtCursor(
        value,
        text,
        start,
        end
      );
      onChange(newValue);
      requestAnimationFrame(() => {
        el.focus();
        const offset =
          cursorOffset !== undefined ? start + cursorOffset : newCursor;
        el.setSelectionRange(offset, offset);
      });
    },
    [onChange, value]
  );

  useEffect(() => {
    if (!onRegisterInsert || !isActive) return;
    onRegisterInsert(insert);
    return () => onRegisterInsert(null);
  }, [insert, isActive, onRegisterInsert]);

  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
  };

  const toolbar = (
    <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 bg-muted/50 px-2 py-1.5">
      {OPERATORS.map((op) => (
        <Tooltip key={op.label}>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 min-w-7 px-1.5 font-mono text-xs"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (op.label === "if") {
                  insert("if  else ", 3);
                } else {
                  insert(op.insert);
                }
              }}
            >
              {op.label}
            </Button>
          </TooltipTrigger>
          {op.title && <TooltipContent>{op.title}</TooltipContent>}
        </Tooltip>
      ))}
      {siblingFields.length > 0 && (
        <>
          <span className="mx-1 h-4 w-px bg-border" />
          {siblingFields.map((name) => (
            <Button
              key={name}
              type="button"
              variant="secondary"
              size="sm"
              className="h-7 px-2 font-mono text-xs"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insert(name)}
            >
              {name}
            </Button>
          ))}
        </>
      )}
    </div>
  );

  return (
    <div className={cn("space-y-0", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium leading-none">{label}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-muted-foreground"
          onClick={() => setExpanded(true)}
        >
          <Maximize2Icon className="h-3.5 w-3.5" />
          Развернуть
        </Button>
      </div>

      {!expanded && (
        <div
          className={cn(
            "mt-1.5 overflow-hidden rounded-md border transition-shadow",
            focused && "ring-2 ring-primary/20"
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          {toolbar}
          <FormulaTextarea
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            textareaRef={textareaRef}
          />
        </div>
      )}

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-h-[90vh] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактор формулы</DialogTitle>
          </DialogHeader>
          <div
            className={cn(
              "overflow-hidden rounded-md border transition-shadow",
              focused && "ring-2 ring-primary/20"
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            {toolbar}
            <FormulaTextarea
              value={value}
              onChange={onChange}
              onFocus={handleFocus}
              textareaRef={textareaRef}
              minHeight="min-h-[240px]"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
