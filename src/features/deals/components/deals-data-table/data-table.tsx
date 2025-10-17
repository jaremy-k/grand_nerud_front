"use client";

import { Pagination } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/lib/debouncer";
import { dealsService } from "@/services";
import { DealDto } from "@definitions/dto";
import { DealFilters } from "@features/deals/definitions";
import { delayedPromise } from "@features/deals/utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DealRow, DealsDataEmpty } from ".";
import {
  ManagerFilter,
  MaterialFilter,
  ServiceFilter,
  StageFilter,
} from "../filters";
import DealsDataLoading from "./data-loading";

export default function DealsDataTable() {
  const router = useRouter();
  const [deals, setDeals] = useState<DealDto[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [loading, setLoading] = useState(true);

  const handleFetchDeals = useCallback(
    (signal: AbortSignal, page: number, requsetFilters: DealFilters = {}) => {
      setLoading(true);
      delayedPromise(
        dealsService.getDeals(
          {
            pageSize: 15,
            page: page,
            includeRelations: true,
            includeDeleted: false,
            filters: { ...requsetFilters },
          },
          {
            signal: signal,
          }
        ),
        500
      )
        .then((data) => {
          setDeals(data.items);
          setTotalPages(data.totalPages);
        })
        .catch((err) => console.log(err))
        .finally(() => setLoading(false));
    },
    [setDeals, setTotalPages, setLoading]
  );

  // Filters
  const [stageFilter, setStageFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [materialFilter, setMaterialFilter] = useState("all");

  const filters = useMemo(
    () => ({
      stageId: stageFilter,
      serviceId: serviceFilter,
      userId: userFilter,
      materialId: materialFilter,
    }),
    [stageFilter, serviceFilter, userFilter, materialFilter]
  );
  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    const controller = new AbortController();
    handleFetchDeals(controller.signal, currentPage, debouncedFilters);
    return () => controller.abort("Called fetch with other params");
  }, [currentPage, debouncedFilters, handleFetchDeals]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  return (
    <>
      <div className="inline-flex justify-between w-full">
        <div className="inline-flex gap-2.5">
          <ServiceFilter value={serviceFilter} onChange={setServiceFilter} />
          <StageFilter value={stageFilter} onChange={setStageFilter} />
          <ManagerFilter
            deals={deals}
            value={userFilter}
            onChange={setUserFilter}
          />
          <MaterialFilter value={materialFilter} onChange={setMaterialFilter} />
        </div>
        <div className="inline-flex">
          <Button
            onClick={() => router.push("/deals/create")}
            variant="default"
          >
            Создать сделку
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Услуга</TableHead>
              <TableHead>Материал</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Менеджер</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Дата создания</TableHead>
              <TableHead>Дедлайн</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <DealsDataLoading />}
            {!loading && deals.length === 0 && <DealsDataEmpty />}
            {!loading &&
              deals.length > 0 &&
              deals.map((deal) => <DealRow key={deal._id} deal={deal} />)}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <Pagination
          total={totalPages}
          current={currentPage}
          onClick={setCurrentPage}
        />
      </div>
    </>
  );
}
