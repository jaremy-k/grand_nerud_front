import { useCallback, useEffect, useMemo, useState } from "react";
import { useLatestRequest } from "@/hooks/use-latest-request";
import { dealsService } from "@/services";
import type { DealFilters } from "@features/deals/definitions";
import type { DealDto } from "@definitions/dto";
import { getLastUsedFilters, saveLastUsedFilters } from "@features/deals/utils/filter-presets";

type Query = { page: number; pageSize: number; filters: DealFilters };
const EMPTY_DEALS: DealDto[] = [];
const loadDeals = (query: Query, signal: AbortSignal) => dealsService.getDeals({
  ...query, includeRelations: true, includeDeleted: false,
}, { signal });

export function useDealsQuery(pageSize: number) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<DealFilters>(() => {
    const last = getLastUsedFilters();
    return {
      stageId: last?.stageId ?? "all", serviceId: last?.serviceId ?? "all",
      userId: last?.userId ?? "all", materialId: last?.materialId ?? "all",
    };
  });
  const query = useMemo(() => ({ page: currentPage, pageSize, filters }), [currentPage, pageSize, filters]);
  const request = useLatestRequest(query, loadDeals, 300);
  const changeFilter = useCallback((key: keyof DealFilters, value: string) => {
    setCurrentPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  }, []);

  useEffect(() => { saveLastUsedFilters(filters); }, [filters]);

  return {
    ...request, currentPage, setCurrentPage, filters, changeFilter,
    deals: request.data?.items ?? EMPTY_DEALS, totalPages: request.data?.totalPages ?? 0,
  };
}
