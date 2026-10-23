import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import DealOperations from "@features/deals/components/deal-operations";
import { cancelDealOperation, getDealOperations, saveDealPayment, saveDealShipment } from "@/services/deal-operations";
import { operationDraft, validDecimal, validateOperationDraft } from "@features/deals/utils/operations";
import { deal } from "./fixtures";
import { operationFixture } from "./operation-fixtures";
import type { DealPayment, DealShipment } from "@/definitions/dto/deal-operations";

vi.mock("@/services/deal-operations", () => ({ getDealOperations: vi.fn(), saveDealPayment: vi.fn(), saveDealShipment: vi.fn(), cancelDealOperation: vi.fn() }));
vi.mock("@/components/inputs/company-input/address-select", () => ({ default: () => null }));
const changed = vi.fn();
const payment: DealPayment = { _id: "payment", requestId: "request", status: "planned", kind: "customer", amount: 1000, dueDate: "2026-01-01", actualDate: null, reference: "Счёт 1", comment: "Аванс" };
const shipment: DealShipment = { _id: "shipment", requestId: "request", status: "planned", quantity: 20, unit: "т", plannedDate: "2026-01-01", actualDate: null, amountPurchase: null, deliveryCost: null, comment: "Первая партия" };
const open = (resource: "payments" | "shipments" | "history" = "payments") => render(<RouterProvider router={createMemoryRouter([{ path: "/", element: <DealOperations deal={deal} resource={resource} onChanged={changed} /> }])} />);
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getDealOperations).mockResolvedValue(structuredClone(operationFixture));
  vi.mocked(saveDealPayment).mockResolvedValue(operationFixture);
  vi.mocked(saveDealShipment).mockResolvedValue(operationFixture);
  vi.mocked(cancelDealOperation).mockResolvedValue(operationFixture);
});
afterEach(cleanup);

it("показывает серверные остатки и не загружает список всех сделок", async () => {
  open();
  await screen.findByText("Платежей пока нет");
  expect(screen.getByText("Осталось получить")).toBeTruthy();
  expect(getDealOperations).toHaveBeenCalledWith("deal", 1, expect.objectContaining({ signal: expect.any(AbortSignal) }));
});
it("ошибка запроса не выглядит как отсутствие платежей", async () => {
  vi.mocked(getDealOperations).mockRejectedValueOnce(new Error("Ошибка API"));
  open();
  await screen.findByText("Ошибка API");
  expect(screen.queryByText("Платежей пока нет")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Повторить загрузку" }));
  await screen.findByText("Платежей пока нет");
});
it("валидирует сумму и сохраняет оплату с версией и ключом повторного запроса", async () => {
  open();
  fireEvent.click(await screen.findByRole("button", { name: "Добавить платёж" }));
  fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
  expect(await screen.findByText(/Укажите положительную сумму/)).toBeTruthy();
  expect(saveDealPayment).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Сумма, руб."), { target: { value: "1 234,50" } });
  fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
  await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
  expect(saveDealPayment).toHaveBeenCalledWith("deal", expect.objectContaining({ revision: "a".repeat(64), amount: "1234.50", status: "planned", actualDate: null, requestId: expect.any(String) }), undefined);
});
it("при конфликте сохраняет введённую сумму, обновляет версию и повторяет с тем же requestId", async () => {
  vi.mocked(saveDealPayment).mockRejectedValueOnce(new Error("Данные сделки изменились"));
  open();
  fireEvent.click(await screen.findByRole("button", { name: "Добавить платёж" }));
  fireEvent.change(screen.getByLabelText("Сумма, руб."), { target: { value: "450" } });
  fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
  await screen.findByText("Данные сделки изменились");
  vi.mocked(getDealOperations).mockResolvedValue({ ...operationFixture, revision: "b".repeat(64) });
  fireEvent.click(screen.getByRole("button", { name: "Обновить данные" }));
  await waitFor(() => expect(getDealOperations).toHaveBeenCalledTimes(2));
  await waitFor(() => expect(screen.getByRole("button", { name: "Сохранить" }).hasAttribute("disabled")).toBe(false));
  expect(screen.getByDisplayValue("450")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
  await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
  const calls = vi.mocked(saveDealPayment).mock.calls;
  expect(calls[1][1].revision).toBe("b".repeat(64));
  expect(calls[1][1].requestId).toBe(calls[0][1].requestId);
});
it("подтверждает плановую поставку и позволяет указать меньшую фактическую партию", async () => {
  vi.mocked(getDealOperations).mockResolvedValue({ ...operationFixture, shipments: [shipment] });
  open("shipments");
  fireEvent.click(await screen.findByRole("button", { name: "Подтвердить поставку" }));
  fireEvent.change(screen.getByLabelText("Объём"), { target: { value: "12,5" } });
  fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
  await waitFor(() => expect(changed).toHaveBeenCalled());
  expect(saveDealShipment).toHaveBeenCalledWith("deal", expect.objectContaining({ status: "delivered", quantity: "12.5", unit: "т", actualDate: expect.any(String), amountPurchase: null }), "shipment");
});
it("отмена требует причины и не удаляет запись локально до ответа API", async () => {
  vi.mocked(getDealOperations).mockResolvedValue({ ...operationFixture, payments: [payment] });
  open();
  fireEvent.click(await screen.findByRole("button", { name: "Отменить запись" }));
  const dialog = screen.getByRole("dialog");
  await act(async () => fireEvent.click(within(dialog).getByRole("button", { name: "Отменить запись" })));
  expect(await screen.findByText(/Укажите причину отмены/)).toBeTruthy();
  expect(cancelDealOperation).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Причина отмены"), { target: { value: "Ошибочная запись" } });
  fireEvent.click(screen.getAllByRole("button", { name: "Отменить запись" }).at(-1)!);
  await waitFor(() => expect(changed).toHaveBeenCalled());
  expect(cancelDealOperation).toHaveBeenCalledWith("deal", "payments", "payment", "a".repeat(64), "Ошибочная запись");
});
it("не даёт незаметно закрыть форму с изменениями", async () => {
  open();
  fireEvent.click(await screen.findByRole("button", { name: "Добавить платёж" }));
  fireEvent.change(screen.getByLabelText("Сумма, руб."), { target: { value: "400" } });
  fireEvent.click(screen.getByRole("button", { name: "Отмена" }));
  expect(screen.getByRole("alertdialog", { name: "Закрыть без сохранения?" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Продолжить редактирование" }));
  expect(screen.getByDisplayValue("400")).toBeTruthy();
});
it("отменённые записи не предлагают редактировать или подтверждать", async () => {
  vi.mocked(getDealOperations).mockResolvedValue({ ...operationFixture, payments: [{ ...payment, status: "cancelled" }] });
  open();
  await screen.findByText("По выбранным условиям записей нет");
  expect(screen.queryByRole("button", { name: "Изменить операцию" })).toBeNull();
});
it("валидация не принимает отрицательные, бесконечные и избыточно точные числа", () => {
  for (const value of ["-1", "NaN", "Infinity", "0", "1.234"]) expect(validDecimal(value, 2)).toBe(false);
  expect(validDecimal("0", 2, true)).toBe(true);
  expect(validateOperationDraft({ ...operationDraft(), quantity: "1.0001", unit: "т" }, false)).toHaveProperty("quantity");
});
