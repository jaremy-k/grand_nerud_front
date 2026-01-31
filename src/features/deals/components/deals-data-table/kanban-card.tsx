"use client";

import { useDraggable } from "@dnd-kit/core";
import { formatCurrency } from "@/lib/formatters";
import { capitalizeFirstLetter } from "@/lib/typography";
import { DealDto, StageDto } from "@definitions/dto";
import { getStageBadgeClass, getStageDotClass } from "@features/deals/utils/stage-colors";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckIcon } from "lucide-react";

export function getCustomerName(
  deal: DealDto,
  customerNames: Record<string, string>
): string {
  if (deal.customer?.name) return deal.customer.name;
  if (deal.customer?.abbreviatedName) return deal.customer.abbreviatedName;
  if (deal.customerId && customerNames[deal.customerId]) {
    return customerNames[deal.customerId];
  }
  return "Без заказчика";
}

export function KanbanCardOverlay({
  deal,
  customerNames,
}: {
  deal: DealDto;
  customerNames: Record<string, string>;
}) {
  const customerName = getCustomerName(deal, customerNames);
  return (
    <div className="rounded-lg border bg-card p-3 shadow-lg">
      <p className="truncate font-medium text-foreground">{customerName}</p>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">
        {deal.service ? capitalizeFirstLetter(deal.service.name) : ""}
        {deal.material && ` · ${capitalizeFirstLetter(deal.material.name)}`}
      </p>
      <p className="mt-1 text-sm font-semibold text-primary">
        {formatCurrency(deal.totalAmount)}
      </p>
    </div>
  );
}

export function KanbanCard({
  deal,
  stages,
  customerNames,
  onStageChange,
  isUpdating,
  onOpen,
  onEdit,
}: {
  deal: DealDto;
  stages: StageDto[];
  customerNames: Record<string, string>;
  onStageChange: (dealId: string, stageId: string) => Promise<void>;
  isUpdating: boolean;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: deal._id });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const customerName = getCustomerName(deal, customerNames);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab rounded-lg border bg-card p-3 shadow-sm transition-shadow active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      } hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 select-none">
          <p className="truncate font-medium text-foreground">{customerName}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {deal.service ? capitalizeFirstLetter(deal.service.name) : ""}
            {deal.material && ` · ${capitalizeFirstLetter(deal.material.name)}`}
          </p>
          <p className="mt-1 text-sm font-semibold text-primary">
            {formatCurrency(deal.totalAmount)}
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={isUpdating}
              onClick={(e) => e.stopPropagation()}
              className={`shrink-0 rounded px-2 py-1 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-50 ${getStageBadgeClass(deal.stageId)}`}
            >
              {isUpdating ? "…" : "▼"}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1" align="end">
            <p className="mb-2 px-2 py-1 text-xs font-medium text-muted-foreground">
              Переместить в этап
            </p>
            {stages.map((stage) => (
              <button
                key={stage._id}
                type="button"
                onClick={() => onStageChange(deal._id, stage._id)}
                disabled={isUpdating || deal.stageId === stage._id}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent disabled:opacity-50"
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${getStageDotClass(stage._id)}`}
                />
                {capitalizeFirstLetter(stage.name)}
                {deal.stageId === stage._id && (
                  <CheckIcon className="ml-auto h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>
      <div className="mt-2 flex gap-1 border-t pt-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(deal._id);
          }}
          className="flex-1 rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
        >
          Подробнее
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(deal._id);
          }}
          className="flex-1 rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
        >
          Редактировать
        </button>
      </div>
    </div>
  );
}
