import type { DealFilters } from "@features/deals/definitions";

export type DealListState = { filters: DealFilters; search: string; sortBy: "createdAt" | "numberSequence"; sortOrder: "asc" | "desc"; viewMode: "table" | "kanban" };
export const FILTER_KEYS = ["userId", "serviceId", "materialId", "stageId", "customerId", "providerId"] as const;
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

export function normalizeDealListState(raw: unknown): DealListState {
  const value = object(raw);
  const rawFilters = object(value.filters);
  const filters: DealFilters = { userId: "all", serviceId: "all", materialId: "all", stageId: "all" };
  FILTER_KEYS.forEach((key) => { if (typeof rawFilters[key] === "string" && rawFilters[key].trim() && rawFilters[key].length <= 100) filters[key] = rawFilters[key]; });
  return { filters, search: typeof value.search === "string" ? value.search.slice(0, 200) : "",
    sortBy: value.sortBy === "numberSequence" ? "numberSequence" : "createdAt",
    sortOrder: value.sortOrder === "asc" ? "asc" : "desc", viewMode: value.viewMode === "kanban" ? "kanban" : "table" };
}

export function readDealListParams(params: URLSearchParams): DealListState {
  return normalizeDealListState({ filters: Object.fromEntries(FILTER_KEYS.map((key) => [key, params.get(key)])),
    search: params.get("search"), sortBy: params.get("sortBy"), sortOrder: params.get("sortOrder"), viewMode: params.get("mode") });
}

export function dealListParams(state: DealListState, page = 1): URLSearchParams {
  const params = new URLSearchParams({ mode: state.viewMode });
  FILTER_KEYS.forEach((key) => { const value = state.filters[key]; if (value && value !== "all") params.set(key, value); });
  if (state.search) params.set("search", state.search);
  if (state.sortBy !== "createdAt") params.set("sortBy", state.sortBy);
  if (state.sortOrder !== "desc") params.set("sortOrder", state.sortOrder);
  if (page > 1) params.set("page", String(page));
  return params;
}
