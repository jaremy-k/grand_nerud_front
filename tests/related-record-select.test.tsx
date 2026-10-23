import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import RelatedRecordSelect from "@/features/crm/related-record-select";
import { dealsService } from "@/services";
import { deal, deferred } from "./fixtures";

vi.mock("@/services", () => ({ dealsService: { getDeals: vi.fn(), getDeal: vi.fn() } }));
vi.mock("@/services/leads", () => ({ getLeads: vi.fn(), getLead: vi.fn() }));
const item = { ...deal, customer: { _id: "customer", name: "Дальняя компания" }, material: { _id: "sand", name: "Песок" } } as typeof deal;
const response = (page = 1, totalPages = 1, items = [item]) => ({ items, total: 45, page, pageSize: 20, totalPages });
const tick = () => act(async () => { await vi.advanceTimersByTimeAsync(350); });
beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(dealsService.getDeals).mockResolvedValue(response());
  vi.mocked(dealsService.getDeal).mockResolvedValue(item);
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

it("ищет на сервере по компании и владельцу, показывает совпадение по ИНН без клиентского отсева", async () => {
  const onChange = vi.fn();
  render(<RelatedRecordSelect kind="deal" value="" companyId="customer" ownerId="employee" onChange={onChange} />);
  await tick();
  const input = screen.getByRole("textbox", { name: "Поиск: сделка" });
  input.focus();
  fireEvent.change(input, { target: { value: "7707083893" } });
  expect(document.activeElement).toBe(input);
  await tick();
  expect(dealsService.getDeals).toHaveBeenLastCalledWith(expect.objectContaining({ search: "7707083893", page: 1,
    filters: { customerId: "customer", userId: "employee" }, includeDeleted: false }), expect.anything());
  fireEvent.click(screen.getByRole("button", { name: /Дальняя компания/ }));
  expect(onChange).toHaveBeenCalledWith("deal", "customer", "manager");
});

it("сбрасывает пагинацию до запроса при изменении поиска", async () => {
  vi.mocked(dealsService.getDeals).mockImplementation(async (query) => response(query?.page, 3));
  render(<RelatedRecordSelect kind="deal" value="" onChange={vi.fn()} />);
  await tick();
  fireEvent.click(screen.getByRole("button", { name: "Ещё" }));
  await tick();
  expect(dealsService.getDeals).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }), expect.anything());
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Песок" } });
  await tick();
  expect(dealsService.getDeals).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, search: "Песок" }), expect.anything());
  expect(screen.getAllByRole("button", { name: /Дальняя компания/ })).toHaveLength(1);
});

it("не добавляет поздний ответ старого поиска", async () => {
  const pending = deferred<ReturnType<typeof response>>();
  vi.mocked(dealsService.getDeals).mockReturnValueOnce(pending.promise).mockResolvedValueOnce(response(1, 1, []));
  render(<RelatedRecordSelect kind="deal" value="" onChange={vi.fn()} />);
  await tick();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Нет совпадений" } });
  await tick();
  await act(async () => pending.resolve(response()));
  expect(screen.queryByRole("button", { name: /Дальняя компания/ })).toBeNull();
  expect(screen.getByText("Не найдено")).toBeTruthy();
});

it("различает ошибку и пустую выдачу и позволяет повторить запрос", async () => {
  vi.mocked(dealsService.getDeals).mockRejectedValueOnce(new Error("Ошибка поиска")).mockResolvedValueOnce(response());
  render(<RelatedRecordSelect kind="deal" value="" onChange={vi.fn()} />);
  await tick();
  expect(screen.queryByText("Не найдено")).toBeNull();
  expect(screen.getByRole("alert").textContent).toContain("Ошибка поиска");
  fireEvent.click(screen.getByRole("button", { name: "Повторить загрузку" }));
  await tick();
  expect(screen.getByRole("button", { name: /Дальняя компания/ })).toBeTruthy();
});

it("сбрасывает страницы при смене компании и сохраняет текст поля", async () => {
  const { rerender } = render(<RelatedRecordSelect kind="deal" value="" companyId="first" onChange={vi.fn()} />);
  await tick();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "песок" } });
  await tick();
  rerender(<RelatedRecordSelect kind="deal" value="" companyId="second" onChange={vi.fn()} />);
  await tick();
  expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("песок");
  expect(dealsService.getDeals).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, filters: { customerId: "second", userId: undefined } }), expect.anything());
});

it("догружает выбранную сделку независимо от текущей страницы", async () => {
  render(<RelatedRecordSelect kind="deal" value="deal" disabled onChange={vi.fn()} />);
  await tick();
  expect(dealsService.getDeal).toHaveBeenCalledWith("deal", expect.objectContaining({ signal: expect.any(AbortSignal) }));
  expect((screen.getByRole("textbox") as HTMLInputElement).disabled).toBe(true);
  expect(screen.queryByRole("button", { name: "Убрать привязку" })).toBeNull();
});
