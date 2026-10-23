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
import { dealsService } from "@/services";
import { Columns3Icon, FilePlus2Icon, ListIcon, RotateCwIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompanyCombobox } from "@/components/inputs/company-input/company-combobox";
import { useCompanyNames } from "@/features/crm/use-company-names";
import SavedViews from "./saved-views";
import { useStages } from "@features/deals/hooks/use-stages";
import { useDealsQuery } from "@features/deals/hooks/use-deals-query";
import { useNavigate } from "react-router-dom";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
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

export default function DealsDataTable() {
  const navigate = useNavigate();
  const { stages } = useStages();
  const { deals, total, totalPages, currentPage, setCurrentPage, loading, error, retry, filters, changeFilter,
    view, applyView, userKey, viewMode, setViewMode, search, setSearch, setSort, reset } = useDealsQuery();
  const filtered = Boolean(search || Object.values(filters).some((value) => value && value !== "all"));
  const [stageError, setStageError] = useState("");
  const [updatingStageId, setUpdatingStageId] = useState<string | null>(null);
  const names = useCompanyNames(deals.filter((deal) => !deal.customer?.name).map((deal) => deal.customerId));
  const customerNames = names.data ?? {};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

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
  }, [viewMode, deals, stages, loading, error]);

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
      setStageError("");
      try {
        await dealsService.updateDealStage(dealId, stageId);
        retry();
      } catch (err) {
        setStageError(err instanceof Error ? err.message : "Ошибка смены этапа");
      } finally {
        setUpdatingStageId(null);
      }
    },
    [retry]
  );

  const handleViewModeChange = (mode: "table" | "kanban") => {
    setViewMode(mode);
  };

  return (
    <div className="flex min-w-0 flex-col">
      <div className="relative top-0 z-10 flex-shrink-0 space-y-3 border-b bg-background/95 pb-4 pt-1 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:sticky">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button onClick={() => navigate("/deals/create")} variant="default">
            <FilePlus2Icon />
            Создать сделку
          </Button>
          <div
            className="flex items-center rounded-md border bg-muted/30 p-0.5"
            role="group"
            aria-label="Режим отображения сделок"
          >
            <Button
              type="button"
              size="sm"
              variant={viewMode === "table" ? "secondary" : "ghost"}
              className="shadow-none"
              aria-pressed={viewMode === "table"}
              onClick={() => handleViewModeChange("table")}
            >
              <ListIcon />
              Таблица
            </Button>
            <Button
              type="button"
              size="sm"
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              className="shadow-none"
              aria-pressed={viewMode === "kanban"}
              onClick={() => handleViewModeChange("kanban")}
            >
              <Columns3Icon />
              Канбан
            </Button>
          </div>
        </div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="grid gap-1.5 sm:col-span-2"><Label htmlFor="deals-search">Поиск</Label><Input id="deals-search" value={search} maxLength={200} placeholder="Номер, компания, ИНН или материал" onChange={(event) => setSearch(event.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="deals-customer">Заказчик</Label><CompanyCombobox id="deals-customer" value={filters.customerId === "all" ? "" : filters.customerId} role="customer" allowCreate={false} clearable placeholder="Все заказчики" onChange={(value) => changeFilter("customerId", value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="deals-sort">Сортировка</Label><Select value={`${view.sortBy}:${view.sortOrder}`} onValueChange={setSort}><SelectTrigger id="deals-sort"><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="createdAt:desc">Новые сначала</SelectItem><SelectItem value="createdAt:asc">Старые сначала</SelectItem><SelectItem value="numberSequence:desc">Номер по убыванию</SelectItem><SelectItem value="numberSequence:asc">Номер по возрастанию</SelectItem>
          </SelectContent></Select></div>
          <div className="[&>button]:w-full"><ServiceFilter value={filters.serviceId ?? "all"} onChange={(value) => changeFilter("serviceId", value)} /></div>
          <div className="[&>button]:w-full"><StageFilter value={filters.stageId ?? "all"} onChange={(value) => changeFilter("stageId", value)} /></div>
          <div className="[&>button]:w-full"><ManagerFilter
              value={filters.userId ?? "all"}
              onChange={(value) => changeFilter("userId", value)}
            /></div>
          <div className="[&>button]:w-full"><MaterialFilter value={filters.materialId ?? "all"} onChange={(value) => changeFilter("materialId", value)} /></div>
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Сделок: {total ?? "..."}{totalPages > 1 ? ` · Страница ${currentPage} из ${totalPages}` : ""}</p>
          <div className="flex min-w-0 flex-wrap items-center gap-2">{filtered && <Button type="button" size="sm" variant="ghost" onClick={reset}><XIcon />Сбросить фильтры</Button>}<SavedViews key={userKey || "anonymous"} view={view} userKey={userKey} onApply={applyView} /></div>
        </div>
      </div>
      {stageError && <p className="py-3 text-sm text-destructive" role="alert">{stageError}</p>}
      <div className="min-h-0 flex-1">
      {error ? (
        <div className="space-y-3 py-8 text-center" role="alert">
          <p className="text-sm text-destructive">{error}</p>
          <Button type="button" variant="outline" onClick={retry}><RotateCwIcon /> Повторить загрузку</Button>
        </div>
      ) : viewMode === "kanban" && loading ? (
        <p className="py-8 text-sm text-muted-foreground" role="status">Загрузка сделок...</p>
      ) : viewMode === "kanban" ? (
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
              <TableHead>Сделка / заказчик</TableHead>
              <TableHead>Материал / услуга</TableHead>
              <TableHead>Объём</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Ответственный</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Доход менеджера</TableHead>
              <TableHead>Дата создания</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <DealsDataLoading />}
            {!loading && deals.length === 0 && <DealsDataEmpty filtered={filtered} onReset={reset} />}
            {!loading &&
              deals.length > 0 &&
              deals.map((deal) => (
                <DealRow
                  key={deal._id}
                  deal={deal}
                  customerName={customerNames[deal.customerId]}
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
      {!loading && !error && <div className="mt-4 flex-shrink-0">
        <Pagination
          total={totalPages}
          current={currentPage}
          onClick={setCurrentPage}
        />
      </div>}
    </div>
  );
}
