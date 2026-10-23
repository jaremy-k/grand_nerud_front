import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import SavedViews from "@features/deals/components/deals-data-table/saved-views";
import { getFilterPresets, saveFilterPreset, deleteFilterPreset, getLastUsedView, saveLastUsedView } from "@features/deals/utils/filter-presets";
import { normalizeDealListState, readDealListParams, dealListParams } from "@features/deals/utils/list-state";

const view = normalizeDealListState({ search: "Песок", sortBy: "numberSequence", sortOrder: "asc", viewMode: "kanban", filters: { customerId: "company" } });
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("сохраняет весь вид отдельно для каждого пользователя и обновляет одноимённый", () => {
  const original = saveFilterPreset(" Поставки ", view, "one");
  const changed = { ...view, search: "Щебень" };
  const update = saveFilterPreset("поставки", changed, "one");
  expect(update.id).toBe(original.id);
  expect(getFilterPresets("one")).toHaveLength(1);
  expect(getFilterPresets("one")[0].view).toEqual(changed);
  expect(getFilterPresets("two")).toEqual([]);
  deleteFilterPreset(update.id, "one");
  expect(getFilterPresets("one")).toEqual([]);
});

it("переносит прежний формат фильтров, отбрасывает повреждённые записи и неизвестные поля", () => {
  localStorage.setItem("deals-filter-presets", JSON.stringify([null, { id: "old", name: "Старый", filters: { customerId: "company", dangerous: "$where" } }]));
  expect(getFilterPresets()).toHaveLength(1);
  expect(getFilterPresets()[0].view.filters).toMatchObject({ customerId: "company" });
  expect(getFilterPresets()[0].view.filters).not.toHaveProperty("dangerous");
  localStorage.setItem("deals-filter-presets", "broken");
  expect(getFilterPresets()).toEqual([]);
});

it("выдерживает повреждённое хранилище и явно сообщает об ошибке ручного сохранения", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
  expect(getLastUsedView("one")).toBeNull();
  expect(() => saveLastUsedView(view, "one")).not.toThrow();
  expect(() => saveFilterPreset("Работа", view, "one")).toThrow("quota");
});

it("кодирует и восстанавливает фильтры, поиск, сортировку и канбан в URL", () => {
  const query = dealListParams(view, 3);
  expect(readDealListParams(query)).toEqual(view);
  expect(query.get("page")).toBe("3");
  const invalid = readDealListParams(new URLSearchParams("sortBy=companyProfit&sortOrder=bad&mode=wrong"));
  expect(invalid).toMatchObject({ sortBy: "createdAt", sortOrder: "desc", viewMode: "table" });
});

it("сохраняет и удаляет представление через диалоги", () => {
  render(<SavedViews view={view} onApply={vi.fn()} userKey="one" />);
  fireEvent.click(screen.getByRole("button", { name: "Сохранить представление" }));
  fireEvent.change(screen.getByLabelText("Название"), { target: { value: "Рабочее" } });
  fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
  expect(getFilterPresets("one")[0].view).toEqual(view);
  fireEvent.click(screen.getByRole("button", { name: "Удалить представление" }));
  fireEvent.click(screen.getByRole("button", { name: "Удалить" }));
  expect(getFilterPresets("one")).toEqual([]);
});

it("оставляет диалог открытым и показывает ошибку, если сохранить не удалось", () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Недостаточно места"); });
  render(<SavedViews view={view} onApply={vi.fn()} userKey="one" />);
  fireEvent.click(screen.getByRole("button", { name: "Сохранить представление" }));
  fireEvent.change(screen.getByLabelText("Название"), { target: { value: "Рабочее" } });
  fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
  expect(screen.getByRole("alert").textContent).toBe("Недостаточно места");
  expect(screen.getByRole("dialog")).toBeTruthy();
});
