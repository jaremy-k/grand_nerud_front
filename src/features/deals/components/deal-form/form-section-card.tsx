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
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
              iconClassName
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {step}
              </span>
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            {description && (
              <CardDescription className="text-sm">{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}
