import { beforeEach, expect, it, vi } from "vitest";
import { cancelDealOperation, getDealOperations, saveDealPayment, saveDealShipment } from "@/services/deal-operations";
import { secureGetData, securePatchData, securePostData } from "@/lib/fetch";
import type { PaymentWrite, ShipmentWrite } from "@/definitions/dto/deal-operations";

vi.mock("@/lib/fetch", () => ({ secureGetData: vi.fn(), securePatchData: vi.fn(), securePostData: vi.fn() }));
beforeEach(() => vi.resetAllMocks());
const payment: PaymentWrite = { revision: "a".repeat(64), requestId: "request", kind: "customer", status: "planned", amount: "100.10", dueDate: "2026-10-28", actualDate: null, reference: "42", comment: "" };
const shipment: ShipmentWrite = { revision: "b".repeat(64), requestId: "shipment", status: "planned", quantity: "10.250", unit: "т", plannedDate: "2026-10-28", actualDate: null, amountPurchase: null, deliveryCost: "0", comment: "" };
it("передаёт пагинацию истории и сигнал отмены в GET", async () => {
  const controller = new AbortController();
  await getDealOperations("deal", 3, { signal: controller.signal });
  expect(secureGetData).toHaveBeenCalledWith(expect.stringContaining("/deals/deal/operations?historyPage=3"), { signal: controller.signal });
});
it("создаёт и редактирует платежи без преобразования точных сумм в float", async () => {
  await saveDealPayment("deal", payment);
  expect(securePostData).toHaveBeenCalledWith(expect.stringContaining("/deals/deal/payments"), payment);
  await saveDealPayment("deal", payment, "entry");
  expect(securePatchData).toHaveBeenCalledWith(expect.stringContaining("/deals/deal/payments/entry"), payment);
});
it("создаёт и редактирует поставку отдельными роутами", async () => {
  await saveDealShipment("deal", shipment);
  expect(securePostData).toHaveBeenCalledWith(expect.stringContaining("/deals/deal/shipments"), shipment);
  await saveDealShipment("deal", shipment, "entry");
  expect(securePatchData).toHaveBeenCalledWith(expect.stringContaining("/deals/deal/shipments/entry"), shipment);
});
it("отмена передаёт версию и причину, не вызывает DELETE", async () => {
  await cancelDealOperation("deal", "payments", "entry", payment.revision, "Ошибка");
  expect(securePostData).toHaveBeenCalledWith(expect.stringContaining("/deals/deal/payments/entry/cancel"), { revision: payment.revision, reason: "Ошибка" });
});
it("не подменяет ошибку загрузки нулевыми остатками", async () => {
  vi.mocked(secureGetData).mockRejectedValue(new Error("Операции недоступны"));
  await expect(getDealOperations("deal")).rejects.toThrow("Операции недоступны");
});
