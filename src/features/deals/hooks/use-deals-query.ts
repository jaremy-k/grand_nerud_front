import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useAuthContext from "@/contexts/auth-context";
import { useLatestRequest } from "@/hooks/use-latest-request";
import { dealsService } from "@/services";
import type { DealFilters } from "@features/deals/definitions";
import type { DealDto } from "@definitions/dto";
import { getLastUsedView, saveLastUsedView } from "@features/deals/utils/filter-presets";
import { dealListParams, normalizeDealListState, readDealListParams, type DealListState } from "@features/deals/utils/list-state";

type Query = { page: number; pageSize: number; filters: DealFilters; search: string; sortBy: string; sortOrder: string };
const EMPTY_DEALS: DealDto[] = [];
const loadDeals = (query: Query, signal: AbortSignal) => dealsService.getDeals({ ...query, includeRelations: true, includeDeleted: false }, { signal });

export function useDealsQuery(pageSizeOverride?: number) {
  const { user } = useAuthContext();
  const userKey = user?.id ?? user?._id;
  const [params, setParams] = useSearchParams();
  const [stored] = useState(() => getLastUsedView(userKey) ?? normalizeDealListState({}));
  const view = useMemo(() => params.size ? readDealListParams(params) : stored, [params, stored]);
  const rawPage = Number(params.get("page") || 1);
  const currentPage = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  useEffect(() => { if (!params.size) setParams(dealListParams(view), { replace: true }); }, [params, setParams, view]);
  const query = useMemo(() => ({ filters: view.filters, search: view.search, sortBy: view.sortBy, sortOrder: view.sortOrder,
    page: currentPage, pageSize: pageSizeOverride ?? (view.viewMode === "kanban" ? 50 : 15) }), [view, currentPage, pageSizeOverride]);
  const request = useLatestRequest(query, loadDeals, 300);
  const applyView = useCallback((next: DealListState) => setParams(dealListParams(normalizeDealListState(next))), [setParams]);
  const changeFilter = useCallback((name: keyof DealFilters, value: string) => applyView({ ...view, filters: { ...view.filters, [name]: value } }), [view, applyView]);
  const setCurrentPage = (page: number) => setParams(dealListParams(view, page));
  useEffect(() => { saveLastUsedView(view, userKey); }, [view, userKey]);
  useEffect(() => {
    if (request.data && currentPage > Math.max(1, request.data.totalPages)) setParams(dealListParams(view, Math.max(1, request.data.totalPages)), { replace: true });
  }, [request.data, currentPage, view, setParams]);
  return { ...request, currentPage, setCurrentPage, filters: view.filters, changeFilter, view, applyView, userKey,
    search: view.search, setSearch: (search: string) => setParams(dealListParams({ ...view, search }), { replace: true }),
    viewMode: view.viewMode, setViewMode: (viewMode: "table" | "kanban") => applyView({ ...view, viewMode }),
    setSort: (value: string) => { const [sortBy, sortOrder] = value.split(":"); applyView(normalizeDealListState({ ...view, sortBy, sortOrder })); },
    reset: () => applyView(normalizeDealListState({ viewMode: view.viewMode })),
    deals: request.data?.items ?? EMPTY_DEALS, total: request.data?.total, totalPages: request.data?.totalPages ?? 0,
  };
}
