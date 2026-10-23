"use client";

import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { TableCell, TableRow } from "@/components/ui/table";
import { Handshake } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DealsDataEmpty({ filtered = false, onReset }: { filtered?: boolean; onReset?: () => void }) {
  const navigate = useNavigate();
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={8}>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Handshake />
            </EmptyMedia>
            <EmptyTitle>{filtered ? "Сделки не найдены" : "Сделок пока нет"}</EmptyTitle>
            <EmptyDescription>
              {filtered ? "Нет совпадений" : ""}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {filtered && onReset ? <Button type="button" variant="outline" onClick={onReset}>Сбросить фильтры</Button> :
            <Button
              onClick={() => navigate("/deals/create")}
              type="button"
              className="pointer-events-auto"
            >
              Создать сделку
            </Button>}
          </EmptyContent>
        </Empty>
      </TableCell>
    </TableRow>
  );
}
