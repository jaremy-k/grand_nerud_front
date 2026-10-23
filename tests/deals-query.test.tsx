import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dealsService } from "@/services";
import { useDealsQuery } from "@features/deals/hooks/use-deals-query";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

vi.mock("@/services", () => ({ dealsService: { getDeals: vi.fn() } }));
const tick = () => act(async () => { await vi.advanceTimersByTimeAsync(300); });

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  vi.mocked(dealsService.getDeals).mockResolvedValue({ items: [], totalPages: 5, total: 75, page: 1, pageSize: 15 });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("Фильтры сделок", () => {
  it("смена фильтра с четвёртой страницы сразу запрашивает первую", async () => {
    const { result } = renderHook(() => useDealsQuery(15), { wrapper });
    await tick();
    act(() => result.current.setCurrentPage(4));
    await tick();
    vi.mocked(dealsService.getDeals).mockClear();
    act(() => result.current.changeFilter("materialId", "sand"));
    expect(result.current.currentPage).toBe(1);
    expect(result.current.loading).toBe(true);
    await tick();
    expect(dealsService.getDeals).toHaveBeenCalledTimes(1);
    expect(vi.mocked(dealsService.getDeals).mock.calls[0][0]).toMatchObject({ page: 1, filters: { materialId: "sand" }, includeDeleted: false, includeRelations: true });
  });
  it("применяет сохранённые фильтры до первого запроса", async () => {
    localStorage.setItem("deals-filter-last-used", JSON.stringify({ userId: "manager" }));
    renderHook(() => useDealsQuery(50), { wrapper });
    await tick();
    expect(dealsService.getDeals).toHaveBeenCalledTimes(1);
    expect(vi.mocked(dealsService.getDeals).mock.calls[0][0]).toMatchObject({ page: 1, pageSize: 50, filters: { userId: "manager" } });
  });
  it("ошибка загрузки не маскируется старыми результатами", async () => {
    vi.mocked(dealsService.getDeals).mockRejectedValueOnce(new Error("Нет связи"));
    const { result } = renderHook(() => useDealsQuery(15), { wrapper });
    await tick();
    expect(result.current).toMatchObject({ error: "Нет связи", deals: [], totalPages: 0, loading: false });
    act(() => result.current.retry());
    await tick();
    expect(result.current.error).toBeNull();
    expect(result.current.totalPages).toBe(5);
  });
  it("URL имеет приоритет над последними фильтрами и задаёт поиск и сортировку до запроса", async () => {
    localStorage.setItem("deals-filter-last-used", JSON.stringify({ userId: "old" }));
    const initial = ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={["/deals?mode=kanban&search=СД-000123&customerId=customer&sortBy=numberSequence&sortOrder=asc&page=2"]}>{children}</MemoryRouter>;
    const { result } = renderHook(() => useDealsQuery(), { wrapper: initial });
    await tick();
    expect(dealsService.getDeals).toHaveBeenLastCalledWith(expect.objectContaining({ search: "СД-000123", sortBy: "numberSequence", sortOrder: "asc", page: 2, pageSize: 50, filters: expect.objectContaining({ customerId: "customer", userId: "all" }) }), expect.anything());
    act(() => result.current.setSearch("Песок"));
    expect(result.current.currentPage).toBe(1);
    await tick();
    expect(dealsService.getDeals).toHaveBeenLastCalledWith(expect.objectContaining({ search: "Песок", page: 1 }), expect.anything());
  });
  it("применяет представление атомарно вместе с режимом и сортировкой", async () => {
    const { result } = renderHook(() => useDealsQuery(), { wrapper });
    await tick();
    act(() => result.current.setCurrentPage(4));
    await tick();
    vi.mocked(dealsService.getDeals).mockClear();
    act(() => result.current.applyView({ filters: { materialId: "sand" }, search: "Песок", sortBy: "numberSequence", sortOrder: "asc", viewMode: "kanban" }));
    await tick();
    expect(dealsService.getDeals).toHaveBeenCalledTimes(1);
    expect(dealsService.getDeals).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, pageSize: 50, sortBy: "numberSequence", sortOrder: "asc", search: "Песок", filters: expect.objectContaining({ materialId: "sand" }) }), expect.anything());
  });
  it("сброс не возвращает последние фильтры из хранилища", async () => {
    const { result } = renderHook(() => useDealsQuery(), { wrapper });
    await tick();
    act(() => result.current.changeFilter("customerId", "customer"));
    await tick();
    act(() => result.current.reset());
    await tick();
    expect(result.current.filters.customerId).toBeUndefined();
    expect(result.current.search).toBe("");
  });
});
