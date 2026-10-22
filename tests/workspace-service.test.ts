import { beforeEach, describe, expect, it, vi } from "vitest";
import { secureGetData } from "@/lib/fetch";
import { getWorkspaceLeads, getWorkspaceTasks } from "@/services/workspace";

vi.mock("@/lib/fetch", () => ({ secureGetData: vi.fn() }));
beforeEach(() => { vi.mocked(secureGetData).mockResolvedValue({}); });

describe("Клиент API рабочего стола", () => {
  it("использует новые роуты с общей временной зоной и лимитом", async () => {
    const controller = new AbortController();
    await getWorkspaceTasks({ ownerId: "employee" }, { signal: controller.signal });
    const [path, options] = vi.mocked(secureGetData).mock.calls[0];
    const url = new URL(path, "http://localhost");
    expect(url.pathname).toBe("/workspace/tasks");
    expect(Object.fromEntries(url.searchParams)).toEqual({ scope: "mine", timezone: "Europe/Moscow", limit: "6", ownerId: "employee" });
    expect(options?.signal).toBe(controller.signal);
  });
  it("командная выборка лидов не передаёт случайного ownerId", async () => {
    await getWorkspaceLeads({ scope: "team" });
    const url = new URL(vi.mocked(secureGetData).mock.calls[0][0], "http://localhost");
    expect(url.pathname).toBe("/workspace/leads");
    expect(url.searchParams.get("scope")).toBe("team");
    expect(url.searchParams.has("ownerId")).toBe(false);
  });
  it("не откатывается к прежним спискам, если новый API недоступен", async () => {
    vi.mocked(secureGetData).mockRejectedValue(new Error("HTTP 404"));
    await expect(getWorkspaceTasks()).rejects.toThrow("HTTP 404");
    expect(secureGetData).toHaveBeenCalledTimes(1);
  });
});
