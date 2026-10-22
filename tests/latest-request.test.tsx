import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLatestRequest } from "@/hooks/use-latest-request";
import { deferred } from "./fixtures";

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });
const tick = () => act(async () => { await vi.advanceTimersByTimeAsync(300); });

describe("Актуальность запросов", () => {
  it("скрывает старые суммы немедленно, в том числе на время debounce", async () => {
    const load = vi.fn(async (quantity: number) => quantity * 100);
    const { result, rerender } = renderHook(({ quantity }) => useLatestRequest(quantity, load, 300), { initialProps: { quantity: 1 } });
    await tick();
    expect(result.current.data).toBe(100);
    rerender({ quantity: 2 });
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
    await tick();
    expect(result.current.data).toBe(200);
  });
  it("отклоняет поздний ответ старого запроса даже без поддержки abort", async () => {
    const old = deferred<number>();
    const fresh = deferred<number>();
    const load = vi.fn<(key: number, signal: AbortSignal) => Promise<number>>((key) => key === 1 ? old.promise : fresh.promise);
    const { result, rerender } = renderHook(({ id }) => useLatestRequest(id, load, 300), { initialProps: { id: 1 } });
    await tick();
    rerender({ id: 2 });
    await tick();
    await act(async () => fresh.resolve(200));
    await act(async () => old.resolve(100));
    expect(result.current.data).toBe(200);
    expect(load.mock.calls[0][1].aborted).toBe(true);
  });
  it("показывает ошибку без старых данных и позволяет повторить запрос", async () => {
    const load = vi.fn().mockResolvedValueOnce(100).mockRejectedValueOnce(new Error("API недоступен")).mockResolvedValueOnce(200);
    const { result, rerender } = renderHook(({ id }) => useLatestRequest(id, load, 300), { initialProps: { id: 1 } });
    await tick();
    rerender({ id: 2 });
    await tick();
    expect(result.current).toMatchObject({ data: null, error: "API недоступен", loading: false });
    act(() => result.current.retry());
    expect(result.current.error).toBeNull();
    await tick();
    expect(result.current.data).toBe(200);
  });
  it("игнорирует старую ошибку и отменяет запрос при размонтировании", async () => {
    const old = deferred<number>();
    const load = vi.fn<(key: number, signal: AbortSignal) => Promise<number>>((key) => key === 1 ? old.promise : Promise.resolve(200));
    const { result, rerender, unmount } = renderHook(({ id }) => useLatestRequest(id, load, 300), { initialProps: { id: 1 } });
    await tick();
    rerender({ id: 2 });
    await tick();
    await act(async () => old.reject(new Error("Старая ошибка")));
    expect(result.current).toMatchObject({ data: 200, error: null });
    unmount();
    expect(load.mock.calls[1][1].aborted).toBe(true);
  });
});
