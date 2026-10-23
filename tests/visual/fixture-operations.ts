import type { DealDto } from "@definitions/dto";
import type { DealOperationsDto, DealPayment, DealShipment, OperationHistory, OperationResource } from "@/definitions/dto/deal-operations";
import { normalizeMaterialUnit } from "@/lib/company-materials";

const ledgers = new Map<string, DealOperationsDto>();
const revision = (version: number) => version.toString(16).padStart(64, "0");
const round = (value: number) => Math.round(value * 100) / 100;

// In-memory responses for the isolated visual fixture, never used by the application build.
export function fixtureOperations(deal: DealDto): DealOperationsDto {
  let data = ledgers.get(deal._id);
  if (!data) {
    data = { dealId: deal._id, revision: revision(0), version: 0,
      payments: [{ _id: "advance", kind: "customer", status: "paid", amount: 76000, dueDate: "2026-10-20", actualDate: "2026-10-20", reference: "ПП-128", comment: "Аванс за первую партию" },
        { _id: "purchase", kind: "provider", status: "paid", amount: 58000, dueDate: "2026-10-21", actualDate: "2026-10-21", reference: "ПП-132", comment: "Оплата исполнителю" },
        { _id: "balance", kind: "customer", status: "planned", amount: 114000, dueDate: "2026-10-28", actualDate: null, reference: "Счёт 42", comment: "Остаток по заказу" }],
      shipments: (deal.deliveredQuantity ?? []).map((row, index) => ({ _id: `legacy-${index}`, status: "delivered", quantity: row.quantity,
        unit: normalizeMaterialUnit(row.unit), plannedDate: row.date.slice(0, 10), actualDate: row.date.slice(0, 10), amountPurchase: row.amountPurchase ?? null, deliveryCost: null,
        providerId: deal.providerId, shippingAddressId: deal.shippingAddressId, deliveryAddressId: deal.deliveryAddressId,
        shippingAddressText: deal.shippingAddress?.adressDetail?.address, deliveryAddressText: deal.deliveryAddress?.adressDetail?.address, comment: "" })),
      history: { items: [], total: 0, page: 1, pageSize: 25, totalPages: 0 }, summary: {} as DealOperationsDto["summary"] };
    ledgers.set(deal._id, data);
  }
  const paid = (kind: string) => round(data.payments.filter((row) => row.status === "paid" && row.kind === kind).reduce((sum, row) => sum + row.amount, 0));
  const active = data.shipments.filter((row) => row.status !== "cancelled");
  const delivered = active.filter((row) => row.status === "delivered").reduce((sum, row) => sum + row.quantity, 0);
  const planned = active.filter((row) => row.status === "planned").reduce((sum, row) => sum + row.quantity, 0);
  const incoming = paid("customer");
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Moscow" }).format(new Date());
  data.summary = { currency: "RUB", customerAmount: deal.totalAmount, customerPaid: incoming, customerDebt: Math.max(0, round(deal.totalAmount - incoming)), customerOverpayment: Math.max(0, round(incoming - deal.totalAmount)),
    paymentStatus: incoming >= deal.totalAmount ? "paid" : incoming > 0 ? "partial" : "unpaid", executionStatus: delivered >= deal.quantity ? "completed" : delivered > 0 ? "partial" : planned > 0 ? "planned" : "unplanned",
    providerAmount: deal.amountPurchaseTotal, providerPaid: paid("provider"), providerDebt: Math.max(0, deal.amountPurchaseTotal - paid("provider")), providerOverpayment: Math.max(0, paid("provider") - deal.amountPurchaseTotal), deliveryPaid: paid("delivery"), otherPaid: paid("other"), cashBalance: round(incoming - paid("provider") - paid("delivery") - paid("other")),
    orderedQuantity: deal.quantity, unit: normalizeMaterialUnit(deal.unitMeasurement), deliveredQuantity: delivered, plannedQuantity: planned, remainingQuantity: Math.max(0, deal.quantity - delivered), unplannedQuantity: Math.max(0, deal.quantity - delivered - planned),
    overDeliveredQuantity: Math.max(0, delivered - deal.quantity), progress: Math.min(100, delivered * 100 / deal.quantity),
    overduePayments: data.payments.filter((row) => row.status === "planned" && row.dueDate && row.dueDate < today).length,
    overdueShipments: active.filter((row) => row.status === "planned" && row.plannedDate && row.plannedDate < today).length, warning: null };
  data.revision = revision(data.version);
  deal.operationsSummary = data.summary; deal.operationsRevision = data.revision; deal.operationsEnabled = true;
  deal.totalDeliveredQuantity = delivered;
  deal.deliveredQuantity = active.filter((row) => row.status === "delivered").map((row) => ({ quantity: row.quantity, unit: row.unit, date: `${row.actualDate} 00:00`, ...(row.amountPurchase == null ? {} : { amountPurchase: row.amountPurchase }) }));
  deal.actualAmountSalesTotal = delivered * deal.amountSalesUnit;
  deal.actualAmountPurchaseTotal = active.filter((row) => row.status === "delivered").reduce((sum, row) => sum + (row.amountPurchase ?? row.quantity * deal.amountPurchaseUnit), 0);
  deal.actualCompanyProfit = deal.actualAmountSalesTotal - deal.actualAmountPurchaseTotal - (deal.amountDelivery + deal.addExpenses.reduce((sum, row) => sum + row.amount, 0)) * Math.min(1, delivered / deal.quantity);
  return data;
}

export function writeFixtureOperation(deal: DealDto, resource: OperationResource, id: string | undefined, body: Record<string, unknown>, cancel = false) {
  const ledger = fixtureOperations(deal);
  if (!id && ledger[resource].some((row) => row.requestId === body.requestId)) return ledger;
  if (body.revision !== ledger.revision) throw new Error("Данные сделки изменились. Обновите данные перед сохранением");
  const before = id ? ledger[resource].find((row) => row._id === id) : undefined;
  if (id && !before) throw new Error("Операция не найдена");
  const common = { _id: id || crypto.randomUUID(), requestId: before?.requestId || String(body.requestId), comment: String(body.comment || ""), createdAt: before?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  let after: DealPayment | DealShipment;
  if (cancel) {
    if (String(body.reason || "").trim().length < 3) throw new Error("Укажите причину отмены");
    after = { ...before!, status: "cancelled", cancelReason: String(body.reason) };
  } else if (resource === "payments") {
    after = { ...common, kind: body.kind as DealPayment["kind"], status: body.status as DealPayment["status"], amount: Number(body.amount), dueDate: body.dueDate as string | null, actualDate: body.actualDate as string | null, reference: String(body.reference || "") };
  } else {
    const value = Number(body.quantity);
    const reserved = ledger.shipments.filter((row) => row._id !== id && row.status !== "cancelled").reduce((sum, row) => sum + row.quantity, 0);
    if (value <= 0 || value + reserved > deal.quantity) throw new Error("Сумма запланированных и подтверждённых поставок превышает объём сделки");
    after = { ...common, quantity: value, unit: String(body.unit), status: body.status as DealShipment["status"], plannedDate: body.plannedDate as string | null, actualDate: body.actualDate as string | null,
      amountPurchase: body.amountPurchase == null ? null : Number(body.amountPurchase), deliveryCost: body.deliveryCost == null ? null : Number(body.deliveryCost), providerId: deal.providerId,
      shippingAddressId: body.shippingAddressId as string | null, deliveryAddressId: body.deliveryAddressId as string | null,
      shippingAddressText: deal.shippingAddress?.adressDetail?.address, deliveryAddressText: deal.deliveryAddress?.adressDetail?.address };
  }
  if (resource === "payments") ledger.payments = [...ledger.payments.filter((row) => row._id !== id), after as DealPayment];
  else ledger.shipments = [...ledger.shipments.filter((row) => row._id !== id), after as DealShipment];
  const event: OperationHistory = { _id: crypto.randomUUID(), at: new Date().toISOString(), actorId: "me", actorName: "Мария Соколова", kind: resource, entryId: after._id,
    action: cancel ? "cancelled" : before ? "updated" : "created", before: before ? structuredClone(before) as unknown as Record<string, unknown> : null, after: structuredClone(after) as unknown as Record<string, unknown>, reason: String(body.reason || "") };
  ledger.history.items.unshift(event); ledger.history.total++; ledger.history.totalPages = Math.ceil(ledger.history.total / 25); ledger.version++;
  return fixtureOperations(deal);
}
