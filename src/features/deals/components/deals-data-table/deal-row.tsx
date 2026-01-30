"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { capitalizeFirstLetter } from "@/lib/typography";
import { DealDto } from "@definitions/dto";
import {
  getStageBadgeClass,
  getStageDotClass,
} from "@features/deals/utils/stage-colors";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DealRow({ deal }: { deal: DealDto }) {
  const router = useRouter();

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
        {deal.stage ? (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStageBadgeClass(deal.stage._id)}`}
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${getStageDotClass(deal.stage._id)}`}
            />
            {capitalizeFirstLetter(deal.stage.name)}
          </span>
        ) : (
          "Не указано"
        )}
      </TableCell>
      <TableCell>{deal.user?.name}</TableCell>
      <TableCell>{formatCurrency(deal.totalAmount)}</TableCell>
      <TableCell>{new Date(deal.createdAt).toLocaleDateString()}</TableCell>
      <TableCell>
        <div className="inline-flex w-full justify-between items-center">
          {deal.deliveredQuantity && deal.deliveredQuantity.length > 0
            ? `${deal.deliveredQuantity.length} доставок`
            : "Нет доставок"}
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
