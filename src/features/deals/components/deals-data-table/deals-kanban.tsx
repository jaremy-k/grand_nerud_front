"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { formatCurrency } from "@/lib/formatters";
import { capitalizeFirstLetter } from "@/lib/typography";
import { DealDto, StageDto } from "@definitions/dto";
import {
  getStageBadgeClass,
  getStageDotClass,
} from "@features/deals/utils/stage-colors";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { KanbanCard, KanbanCardOverlay } from "./kanban-card";
import { KanbanColumn } from "./kanban-column";

export default function DealsKanban({
  deals,
  stages,
  customerNames,
  onStageChange,
  updatingStageId,
}: {
  deals: DealDto[];
  stages: StageDto[];
  customerNames: Record<string, string>;
  onStageChange: (dealId: string, stageId: string) => Promise<void>;
  updatingStageId: string | null;
}) {
  const navigate = useNavigate();
  const [activeDealId, setActiveDealId] = useState<string | null>(null);

  const stageIds = new Set(stages.map((s) => s._id));
  const dealsByStage = [
    ...stages.map((stage) => ({
      stage,
      deals: deals.filter((d) => d.stageId === stage._id),
    })),
    ...(deals.some((d) => !d.stageId || !stageIds.has(d.stageId))
      ? [
          {
            stage: {
              _id: "_other",
              name: "Без этапа",
            } as StageDto,
            deals: deals.filter((d) => !d.stageId || !stageIds.has(d.stageId)),
          },
        ]
      : []),
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDealId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDealId(null);
      const { active, over } = event;
      if (!over) return;
      const dealId = active.id as string;
      const targetStageId = over.id as string;
      if (targetStageId === "_other" || !stageIds.has(targetStageId)) return;
      const deal = deals.find((d) => d._id === dealId);
      if (!deal || deal.stageId === targetStageId) return;
      onStageChange(dealId, targetStageId);
    },
    [deals, stageIds, onStageChange]
  );

  const activeDeal = activeDealId
    ? deals.find((d) => d._id === activeDealId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4">
        {dealsByStage.map(({ stage, deals: stageDeals }) => (
          <KanbanColumn
            key={stage._id}
            stage={stage}
            deals={stageDeals}
            stages={stages}
            customerNames={customerNames}
            onStageChange={onStageChange}
            updatingStageId={updatingStageId}
            onOpen={(id) => navigate(`/deals/${id}`)}
            onEdit={(id) => navigate(`/deals/${id}/edit`)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeDeal ? (
          <div className="rotate-2 opacity-95">
            <KanbanCardOverlay
              deal={activeDeal}
              customerNames={customerNames}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
