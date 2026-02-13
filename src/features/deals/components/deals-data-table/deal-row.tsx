"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { capitalizeFirstLetter } from "@/lib/typography";
import { DealDto, StageDto } from "@definitions/dto";
import {
  getStageBadgeClass,
  getStageDotClass,
} from "@features/deals/utils/stage-colors";
import { CheckIcon, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DealRow({
  deal,
  stages,
  onStageChange,
  isUpdatingStage,
}: {
  deal: DealDto;
  stages: StageDto[];
  onStageChange: (dealId: string, stageId: string) => Promise<void>;
  isUpdatingStage: string | null;
}) {
  const router = useRouter();
  const isUpdating = isUpdatingStage === deal._id;
  const [stagePopoverOpen, setStagePopoverOpen] = useState(false);

  const handleStageSelect = (stageId: string) => {
    if (deal.stageId === stageId) return;
    setStagePopoverOpen(false);
    onStageChange(deal._id, stageId);
  };

  return (
    <TableRow key={deal._id}>
      <TableCell>
        {deal.service ? capitalizeFirstLetter(deal.service.name) : "Не указано"}
      </TableCell>
      <TableCell>
        {deal.material
          ? capitalizeFirstLetter(deal.material.name)
          : "Не указано"}
      </TableCell>
      <TableCell>
        <Popover open={stagePopoverOpen} onOpenChange={setStagePopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={isUpdating}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-50 ${deal.stage ? getStageBadgeClass(deal.stage._id) : "bg-muted text-muted-foreground"}`}
            >
              {isUpdating ? (
                <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-current" />
              ) : deal.stage ? (
                <>
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${getStageDotClass(deal.stage._id)}`}
                  />
                  {capitalizeFirstLetter(deal.stage.name)}
                </>
              ) : (
                "Не указано"
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-1" align="start">
            <p className="mb-2 px-2 py-1 text-xs font-medium text-muted-foreground">
              Быстрая смена этапа
            </p>
            {stages.map((stage) => (
              <button
                key={stage._id}
                type="button"
                onClick={() => handleStageSelect(stage._id)}
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
      </TableCell>
      <TableCell>{deal.user?.name}</TableCell>
      <TableCell>{formatCurrency(deal.totalAmount)}</TableCell>
      <TableCell>{formatCurrency(deal.managerProfit ?? 0)}</TableCell>
      <TableCell>
        <div className="inline-flex w-full justify-between items-center gap-2">
          {new Date(deal.createdAt).toLocaleDateString()}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Действия</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push(`/deals/${deal._id}`)}
              >
                Подробнее
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/deals/${deal._id}/edit`)}
              >
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Изменить этап</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {stages.map((stage) => (
                    <DropdownMenuItem
                      key={stage._id}
                      onClick={() => onStageChange(deal._id, stage._id)}
                      disabled={isUpdating || deal.stageId === stage._id}
                    >
                      <span
                        className={`mr-2 h-2 w-2 rounded-full ${getStageDotClass(stage._id)}`}
                      />
                      {capitalizeFirstLetter(stage.name)}
                      {deal.stageId === stage._id && (
                        <CheckIcon className="ml-auto h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
