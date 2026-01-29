"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface FormSectionCardProps {
  step: number;
  title: string;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSectionCard({
  step,
  title,
  description,
  icon: Icon,
  iconClassName,
  children,
  className,
}: FormSectionCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-l-4 border-l-primary/40 bg-card shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <CardHeader className="pb-3 pt-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
              iconClassName
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                {step}
              </span>
              <CardTitle className="text-base">{title}</CardTitle>
            </div>
            {description && (
              <CardDescription className="mt-0.5 text-xs">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4">{children}</CardContent>
    </Card>
  );
}
