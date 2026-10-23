"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export default function DealsDataLoading() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, rowIdx) => (
        <TableRow key={`loader-row-${rowIdx}`} className="hover:bg-transparent">
          {Array.from({ length: 10 }).map((_, colIdx) => (
            <TableCell key={`loader-${rowIdx}-${colIdx}`}>
              <Skeleton className="h-5 w-2/3 my-1.5" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
