"use client";

import { useDroppable } from "@dnd-kit/core";
import { DealDto, StageDto } from "@definitions/dto";
import { getStageBadgeClass, getStageDotClass } from "@features/deals/utils/stage-colors";
import { capitalizeFirstLetter } from "@/lib/typography";
import { KanbanCard } from "./kanban-card";

export function KanbanColumn({
  stage,
  deals,
  stages,
  customerNames,
  onStageChange,
  updatingStageId,
  onOpen,
  onEdit,
}: {
  stage: StageDto;
  deals: DealDto[];
  stages: StageDto[];
  customerNames: Record<string, string>;
  onStageChange: (dealId: string, stageId: string) => Promise<void>;
  updatingStageId: string | null;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage._id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-[280px] flex-1 flex-col rounded-lg border bg-muted/30 transition-colors ${
        isOver ? "ring-2 ring-primary/50" : ""
      }`}
    >
      <div
        className={`flex items-center gap-2 rounded-t-lg px-3 py-2 ${
          stage._id === "_other"
            ? "bg-muted text-muted-foreground"
            : getStageBadgeClass(stage._id)
        }`}
      >
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
            stage._id === "_other"
              ? "bg-muted-foreground"
              : getStageDotClass(stage._id)
          }`}
        />
        <span className="text-sm font-medium">
          {capitalizeFirstLetter(stage.name)}
        </span>
        <span className="ml-auto text-xs opacity-80">{deals.length}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
        {deals.map((deal) => (
          <KanbanCard
            key={deal._id}
            deal={deal}
            stages={stages}
            customerNames={customerNames}
            onStageChange={onStageChange}
            isUpdating={updatingStageId === deal._id}
            onOpen={onOpen}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}
