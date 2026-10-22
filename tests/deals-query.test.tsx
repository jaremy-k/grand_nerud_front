import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dealsService } from "@/services";
import { useDealsQuery } from "@features/deals/hooks/use-deals-query";

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
    const { result } = renderHook(() => useDealsQuery(15));
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
    renderHook(() => useDealsQuery(50));
    await tick();
    expect(dealsService.getDeals).toHaveBeenCalledTimes(1);
    expect(vi.mocked(dealsService.getDeals).mock.calls[0][0]).toMatchObject({ page: 1, pageSize: 50, filters: { userId: "manager" } });
  });
  it("ошибка загрузки не маскируется старыми результатами", async () => {
    vi.mocked(dealsService.getDeals).mockRejectedValueOnce(new Error("Нет связи"));
    const { result } = renderHook(() => useDealsQuery(15));
    await tick();
    expect(result.current).toMatchObject({ error: "Нет связи", deals: [], totalPages: 0, loading: false });
    act(() => result.current.retry());
    await tick();
    expect(result.current.error).toBeNull();
    expect(result.current.totalPages).toBe(5);
  });
});
