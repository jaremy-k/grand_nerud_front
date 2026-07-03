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

export default function DealsDataEmpty() {
  const navigate = useNavigate();
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={7}>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Handshake />
            </EmptyMedia>
            <EmptyTitle>Нет данных</EmptyTitle>
            <EmptyDescription>
              Похоже, что у вас нет сделок с такими фильтрами
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              onClick={() => navigate("/deals/create")}
              type="button"
              className="pointer-events-auto"
            >
              Создать сделку
            </Button>
          </EmptyContent>
        </Empty>
      </TableCell>
    </TableRow>
  );
}
