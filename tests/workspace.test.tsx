import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthContext, AuthContextType } from "@/contexts/auth-context";
import WorkspacePage from "@/features/workspace/workspace-page";
import LeadsPage from "@/app/leads/page";
import TasksPage from "@/app/tasks/page";
import { getLeads } from "@/services/leads";
import { getTasks, updateTask } from "@/services/tasks";
import { usersService } from "@/services";
import { getWorkspaceLeads, getWorkspaceTasks } from "@/services/workspace";
import type { WorkspaceLeadsDto, WorkspaceMeta, WorkspacePreview, WorkspaceTasksDto } from "@/definitions/dto/workspace";
import type { PaginatedResult } from "@/definitions/dto/lead";
import type LeadDto from "@/definitions/dto/lead";
import type TaskDto from "@/definitions/dto/task";
import type { UserDto } from "@definitions/dto";
import type { ReactNode } from "react";
import { deferred } from "./fixtures";

vi.mock("@/services/tasks", () => ({ getTasks: vi.fn(), updateTask: vi.fn(), deleteTask: vi.fn() }));
vi.mock("@/services/leads", () => ({ getLeads: vi.fn(), getLead: vi.fn() }));
vi.mock("@/services/workspace", () => ({ getWorkspaceTasks: vi.fn(), getWorkspaceLeads: vi.fn() }));
vi.mock("@/services", () => ({ usersService: { getUsers: vi.fn() }, dealsService: { getDeal: vi.fn() } }));
vi.mock("@/components/blocks", () => ({
  Page: ({ children }: { children: ReactNode }) => <main>{children}</main>,
  Pagination: () => null,
}));
vi.mock("@/features/crm/use-references", () => ({ useCrmReferences: () => ({
  companies: [], owners: [], materials: [], stages: [], elevated: true, error: "",
}) }));
vi.mock("@/features/leads/components/lead-form-dialog", () => ({ default: () => <div role="dialog">Новый лид</div> }));
vi.mock("@/features/tasks/components/task-form-dialog", () => ({ default: ({ initialOwnerId }: { initialOwnerId?: string }) => <div role="dialog">Новая задача {initialOwnerId}</div> }));

const user: UserDto = { id: "me", email: "me@example.com", name: "Мария", manager: true, admin: false };
const task: TaskDto = { _id: "task", title: "Связаться с заказчиком", ownerId: "me", dueAt: "2026-10-22T08:00:00Z", status: "open", type: "call", leadId: "lead" };
const lead: LeadDto = { _id: "lead", title: "Песок для нового объекта", ownerId: "me", materialIds: [], stageId: "new-stage", priority: "high", status: "new" };
function page<T>(items: T[], total: number): PaginatedResult<T> {
  return { items, total, page: 1, pageSize: 6, totalPages: Math.ceil(total / 6), hasNext: total > 6, hasPrev: false };
}
const meta: WorkspaceMeta = { generatedAt: "2026-10-22T09:00:00Z", timezone: "Europe/Moscow", localDate: "2026-10-22", scope: "mine", ownerId: "me", limit: 6 };
const preview = <T,>(items: T[], total: number): WorkspacePreview<T> => ({ items, total, hasMore: total > items.length });
const taskSummary = (): WorkspaceTasksDto => ({ ...meta, overdue: preview([task], 12), today: preview([task], 27), upcoming: preview([task], 9) });
const leadSummary = (): WorkspaceLeadsDto => ({ ...meta, newLeads: preview([lead], 18) });
function Location() { const location = useLocation(); return <output data-testid="location">{location.pathname}{location.search}</output>; }
function renderWorkspace(params = "", currentUser: UserDto = user) {
  const auth: AuthContextType = { user: currentUser, loading: false, error: null, login: vi.fn(), logout: vi.fn() };
  return render(<AuthContext.Provider value={auth}><MemoryRouter initialEntries={[`/${params}`]}>
    <Location /><Routes><Route path="/" element={<WorkspacePage />} /><Route path="/leads" element={<LeadsPage />} /><Route path="/tasks" element={<TasksPage />} /></Routes>
  </MemoryRouter></AuthContext.Provider>);
}
const tick = () => act(async () => { await vi.advanceTimersByTimeAsync(350); });

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(usersService.getUsers).mockResolvedValue([user, { ...user, id: "employee", name: "Алексей" }]);
  vi.mocked(getTasks).mockImplementation(async (filters) => page([task], filters?.bucket === "overdue" ? 12 : filters?.bucket === "today" ? 27 : 9));
  vi.mocked(getLeads).mockResolvedValue(page([lead], 18));
  vi.mocked(getWorkspaceTasks).mockResolvedValue(taskSummary());
  vi.mocked(getWorkspaceLeads).mockResolvedValue(leadSummary());
  vi.mocked(updateTask).mockResolvedValue({ ...task, status: "completed" });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

describe("Рабочий стол CRM", () => {
  it("показывает серверный total, а не число строк, и передаёт ownerId в каждый запрос", async () => {
    renderWorkspace();
    expect(screen.queryByRole("link", { name: "Новые лиды: 0" })).toBeNull();
    await tick();
    expect(screen.getByRole("link", { name: "Просроченные: 12" }).getAttribute("href")).toBe("/tasks?bucket=overdue&ownerId=me");
    expect(screen.getByRole("link", { name: "Сегодня: 27" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Новые лиды: 18" })).toBeTruthy();
    expect(getWorkspaceTasks).toHaveBeenCalledTimes(1);
    expect(getWorkspaceTasks).toHaveBeenCalledWith(expect.objectContaining({ ownerId: "me", scope: "mine" }), expect.anything());
    expect(getWorkspaceLeads).toHaveBeenCalledWith(expect.objectContaining({ ownerId: "me", scope: "mine" }), expect.anything());
    expect(getTasks).not.toHaveBeenCalled();
    expect(getLeads).not.toHaveBeenCalled();
  });
  it("обычный сотрудник игнорирует чужой ownerId и не запрашивает список пользователей", async () => {
    renderWorkspace("?ownerId=another&scope=team", { ...user, manager: false });
    await tick();
    expect(usersService.getUsers).not.toHaveBeenCalled();
    expect(getWorkspaceLeads).toHaveBeenCalledWith(expect.objectContaining({ ownerId: "me", scope: "mine" }), expect.anything());
    expect(screen.getByRole("combobox", { name: "Ответственный" }).hasAttribute("disabled")).toBe(true);
  });
  it("руководитель явно выбирает команду и отдельного сотрудника через URL", async () => {
    const { unmount } = renderWorkspace("?scope=team");
    await tick();
    expect(vi.mocked(getWorkspaceTasks).mock.calls[0][0]).toMatchObject({ scope: "team", ownerId: undefined });
    expect(screen.getByRole("link", { name: "Новые лиды: 18" }).getAttribute("href")).toContain("scope=team");
    unmount();
    vi.mocked(getWorkspaceTasks).mockClear();
    renderWorkspace("?ownerId=employee");
    await tick();
    expect(vi.mocked(getWorkspaceTasks).mock.calls[0][0]?.ownerId).toBe("employee");
    fireEvent.click(screen.getByRole("button", { name: "Новая задача" }));
    expect(screen.getByRole("dialog").textContent).toContain("employee");
  });
  it("сбой одного блока не превращается в ноль и не скрывает остальные данные", async () => {
    vi.mocked(getWorkspaceTasks).mockRejectedValue(new Error("Задачи недоступны"));
    renderWorkspace();
    await tick();
    expect(screen.getByRole("link", { name: "Просроченные: нет данных" })).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toContain("Задачи недоступны");
    expect(screen.getByRole("link", { name: "Сегодня: нет данных" })).toBeTruthy();
    expect(screen.getByText(lead.title)).toBeTruthy();
    vi.mocked(getWorkspaceTasks).mockResolvedValue({ ...meta, overdue: preview([], 0), today: preview([], 0), upcoming: preview([], 0) });
    fireEvent.click(screen.getByRole("button", { name: "Повторить загрузку" }));
    await tick();
    expect(screen.queryByRole("alert")).toBeNull();
  });
  it("завершает задачу с результатом и обновляет счётчики", async () => {
    renderWorkspace();
    await tick();
    fireEvent.click(screen.getByRole("button", { name: `Завершить задачу: ${task.title}` }));
    fireEvent.change(screen.getByLabelText("Результат"), { target: { value: "Договорились о поставке" } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Подтвердить" })));
    await tick();
    expect(updateTask).toHaveBeenCalledWith("task", { status: "completed", result: "Договорились о поставке" });
    expect(getWorkspaceTasks).toHaveBeenCalledTimes(2);
    expect(getWorkspaceLeads).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("ошибка завершения остаётся в диалоге и не маскируется успешным обновлением", async () => {
    vi.mocked(updateTask).mockRejectedValueOnce(new Error("Не удалось завершить"));
    renderWorkspace();
    await tick();
    fireEvent.click(screen.getByRole("button", { name: `Завершить задачу: ${task.title}` }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Подтвердить" })));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toBe("Не удалось завершить");
    expect(getWorkspaceTasks).toHaveBeenCalledTimes(1);
  });
  it("ссылка новых лидов открывает реальный список с тем же состоянием и сотрудником", async () => {
    renderWorkspace("?ownerId=employee");
    await tick();
    fireEvent.click(screen.getByRole("link", { name: "Новые лиды: 18" }));
    await tick();
    expect(screen.getByTestId("location").textContent).toBe("/leads?status=new&ownerId=employee");
    expect(vi.mocked(getLeads).mock.lastCall?.[0]).toMatchObject({ status: "new", ownerId: "employee", pageSize: 50 });
    expect(screen.getByText(/Лидов: 18/)).toBeTruthy();
  });
  it("ссылка просроченных открывает задачи с той же корзиной и областью команды", async () => {
    renderWorkspace("?scope=team");
    await tick();
    fireEvent.click(screen.getByRole("link", { name: "Просроченные: 12" }));
    await tick();
    expect(screen.getByTestId("location").textContent).toBe("/tasks?bucket=overdue&scope=team");
    expect(vi.mocked(getTasks).mock.lastCall?.[0]).toMatchObject({ bucket: "overdue", ownerId: undefined, pageSize: 25 });
  });
  it("поздний ответ после смены сотрудника не подменяет данные нового", async () => {
    const old = deferred<WorkspaceLeadsDto>();
    vi.mocked(getWorkspaceLeads).mockReturnValueOnce(old.promise);
    const { unmount } = renderWorkspace();
    await tick();
    unmount();
    renderWorkspace("?ownerId=employee");
    await tick();
    await act(async () => old.resolve({ ...meta, newLeads: preview([{ ...lead, title: "Старый ответ" }], 999) }));
    expect(screen.queryByText("Старый ответ")).toBeNull();
    expect(screen.getByRole("link", { name: "Новые лиды: 18" })).toBeTruthy();
  });
  it("вкладки задач поддерживают клавиатуру", async () => {
    renderWorkspace();
    await tick();
    fireEvent.keyDown(screen.getByRole("tab", { name: "Просроченные" }), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Сегодня" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").getAttribute("aria-labelledby")).toBe("workspace-today");
  });
});
