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
import { buildUpdateDealRequestFromDeal } from "@/lib/deals/build-update-request";
import { useDebounce } from "@/lib/debouncer";
import { companiesService, dealsService } from "@/services";
import { DealDto } from "@definitions/dto";
import { DealFilters } from "@features/deals/definitions";
import {
  getLastUsedFilters,
  saveLastUsedFilters,
} from "@features/deals/utils/filter-presets";
import { useStages } from "@features/deals/hooks/use-stages";
import { delayedPromise } from "@features/deals/utils";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DealRow, DealsDataEmpty, DealsDataKanban } from ".";
import {
  ManagerFilter,
  MaterialFilter,
  ServiceFilter,
  StageFilter,
} from "../filters";
import DealsDataLoading from "./data-loading";

export default function DealsDataTable({
  viewMode,
  setViewMode,
}: {
  viewMode: "table" | "kanban";
  setViewMode: (mode: "table" | "kanban") => void;
}) {
  const router = useRouter();
  const { stages } = useStages();
  const [deals, setDeals] = useState<DealDto[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [updatingStageId, setUpdatingStageId] = useState<string | null>(null);
  const [customerNames, setCustomerNames] = useState<Record<string, string>>(
    {}
  );

  const pageSize = viewMode === "kanban" ? 50 : 15;

  const handleFetchDeals = useCallback(
    (signal: AbortSignal, page: number, requsetFilters: DealFilters = {}) => {
      setLoading(true);
      delayedPromise(
        dealsService.getDeals(
          {
            pageSize,
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
    [pageSize, setDeals, setTotalPages, setLoading]
  );

  // Filters — применяем последние при монтировании
  const [stageFilter, setStageFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [materialFilter, setMaterialFilter] = useState("all");

  useEffect(() => {
    const last = getLastUsedFilters();
    if (last) {
      setStageFilter(last.stageId ?? "all");
      setServiceFilter(last.serviceId ?? "all");
      setUserFilter(last.userId ?? "all");
      setMaterialFilter(last.materialId ?? "all");
    }
    hasInitializedLastUsed.current = true;
  }, []);

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
  const hasInitializedLastUsed = useRef(false);

  useEffect(() => {
    if (!hasInitializedLastUsed.current) return;
    saveLastUsedFilters(filters);
  }, [filters]);

  useEffect(() => {
    const controller = new AbortController();
    handleFetchDeals(controller.signal, currentPage, debouncedFilters);
    return () => controller.abort("Called fetch with other params");
  }, [currentPage, debouncedFilters, handleFetchDeals]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    const ids = [...new Set(deals.map((d) => d.customerId).filter(Boolean))];
    if (ids.length === 0) return;
    let cancelled = false;
    Promise.all(ids.map((id) => companiesService.getCompany(id)))
      .then((companies) => {
        if (cancelled) return;
        const map: Record<string, string> = {};
        companies.forEach((c) => {
          map[c._id] = c.name || c.abbreviatedName || "";
        });
        setCustomerNames((prev) => ({ ...prev, ...map }));
      })
      .catch(() => {
        // не очищаем при ошибке — сохраняем предыдущие данные
      });
    return () => {
      cancelled = true;
    };
  }, [deals]);

  const topScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);
  const [kanbanScrollWidth, setKanbanScrollWidth] = useState(0);
  const isScrollingRef = useRef(false);

  useLayoutEffect(() => {
    if (viewMode !== "kanban" || !bottomScrollRef.current) return;
    const el = bottomScrollRef.current;
    const updateWidth = () =>
      setKanbanScrollWidth(el.scrollWidth);
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewMode, deals, stages]);

  const handleTopScroll = useCallback(() => {
    if (!topScrollRef.current || !bottomScrollRef.current || isScrollingRef.current)
      return;
    isScrollingRef.current = true;
    bottomScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    requestAnimationFrame(() => {
      isScrollingRef.current = false;
    });
  }, []);

  const handleBottomScroll = useCallback(() => {
    if (!topScrollRef.current || !bottomScrollRef.current || isScrollingRef.current)
      return;
    isScrollingRef.current = true;
    topScrollRef.current.scrollLeft = bottomScrollRef.current.scrollLeft;
    requestAnimationFrame(() => {
      isScrollingRef.current = false;
    });
  }, []);

  const handleStageChange = useCallback(
    async (dealId: string, stageId: string) => {
      setUpdatingStageId(dealId);
      try {
        const deal = await dealsService.getDeal(dealId);
        const body = buildUpdateDealRequestFromDeal(deal, { stageId });
        await dealsService.updateDeal(dealId, body);
        const data = await dealsService.getDeals({
          pageSize,
          page: currentPage,
          includeRelations: true,
          includeDeleted: false,
          filters: debouncedFilters,
        });
        setDeals(data.items);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error(err instanceof Error ? err.message : "Ошибка смены этапа");
      } finally {
        setUpdatingStageId(null);
      }
    },
    [currentPage, debouncedFilters, pageSize]
  );

  return (
    <div className="flex min-w-0 flex-col">
      <div className="sticky top-0 z-10 flex-shrink-0 space-y-3 border-b bg-background/95 pb-4 pt-1 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push("/deals/create")} variant="default">
            Создать сделку
          </Button>
        </div>
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
          <ServiceFilter value={serviceFilter} onChange={setServiceFilter} />
          <StageFilter value={stageFilter} onChange={setStageFilter} />
            <ManagerFilter
              deals={deals}
              value={userFilter}
              onChange={setUserFilter}
            />
          <MaterialFilter value={materialFilter} onChange={setMaterialFilter} />
        </div>
      </div>
      <div className="min-h-0 flex-1">
      {viewMode === "kanban" ? (
        <div className="flex min-w-0 flex-1 flex-col">
          <div
            ref={topScrollRef}
            className="flex shrink-0 overflow-x-auto overflow-y-hidden"
            style={{ height: 14 }}
            onScroll={handleTopScroll}
          >
            <div style={{ minWidth: kanbanScrollWidth || "100%", height: 1 }} />
          </div>
          <div
            ref={bottomScrollRef}
            className="min-w-0 flex-1 overflow-x-auto overflow-y-auto pt-2 pb-4"
            onScroll={handleBottomScroll}
          >
            <DealsDataKanban
            deals={deals}
            stages={stages}
            customerNames={customerNames}
            onStageChange={handleStageChange}
            updatingStageId={updatingStageId}
          />
          </div>
        </div>
      ) : (
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <DealsDataLoading />}
            {!loading && deals.length === 0 && <DealsDataEmpty />}
            {!loading &&
              deals.length > 0 &&
              deals.map((deal) => (
                <DealRow
                  key={deal._id}
                  deal={deal}
                  stages={stages}
                  onStageChange={handleStageChange}
                  isUpdatingStage={updatingStageId}
                />
              ))}
          </TableBody>
        </Table>
      </div>
      )}
      </div>
      <div className="mt-4 flex-shrink-0">
        <Pagination
          total={totalPages}
          current={currentPage}
          onClick={setCurrentPage}
        />
      </div>
    </div>
  );
}
