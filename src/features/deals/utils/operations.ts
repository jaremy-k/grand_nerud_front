import type { DealPayment, DealShipment, ExecutionStatus, PaymentKind, PaymentStatus } from "@/definitions/dto/deal-operations";

export const PAYMENT_KINDS: Record<PaymentKind, string> = { customer: "От заказчика", provider: "Исполнителю за материал", delivery: "За доставку", other: "Прочий расход" };
export const PAYMENT_LABELS: Record<PaymentStatus, string> = { unpaid: "Не оплачено", partial: "Частично оплачено", paid: "Оплачено", not_required: "Оплата не требуется", unknown: "Нет данных об оплате" };
export const EXECUTION_LABELS: Record<ExecutionStatus, string> = { unplanned: "Не запланировано", planned: "К поставке", partial: "Частично поставлено", completed: "Выполнено", unknown: "Проверьте поставки" };
export const todayMoscow = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
export const operationDate = (value?: string | null) => value ? new Date(`${value.slice(0, 10)}T12:00:00Z`).toLocaleDateString("ru-RU", { timeZone: "Europe/Moscow" }) : "Не указана";
export const decimalString = (value: string) => value.trim().replace(/\s/g, "").replace(",", ".");
export const validDecimal = (value: string, places: number, allowZero = false) => {
  const normalized = decimalString(value);
  return new RegExp(`^\\d+(\\.\\d{1,${places}})?$`).test(normalized) && Number.isFinite(Number(normalized)) && (allowZero ? Number(normalized) >= 0 : Number(normalized) > 0);
};
export type OperationDraft = {
  kind: PaymentKind; status: "planned" | "paid" | "delivered"; amount: string; quantity: string; unit: string;
  plannedDate: string; actualDate: string; amountPurchase: string; deliveryCost: string; reference: string; comment: string;
  shippingAddressId: string; deliveryAddressId: string;
};
export function operationDraft(entry?: DealPayment | DealShipment, confirm = false): OperationDraft {
  const payment = entry && "amount" in entry ? entry : undefined;
  const shipment = entry && "quantity" in entry ? entry : undefined;
  return { kind: payment?.kind ?? "customer", status: confirm ? payment ? "paid" : "delivered" : entry?.status === "cancelled" ? "planned" : entry?.status ?? "planned",
    amount: payment ? String(payment.amount) : "", quantity: shipment ? String(shipment.quantity) : "", unit: shipment?.unit ?? "",
    plannedDate: payment?.dueDate ?? shipment?.plannedDate ?? todayMoscow(), actualDate: confirm ? todayMoscow() : entry?.actualDate ?? "",
    amountPurchase: shipment?.amountPurchase == null ? "" : String(shipment.amountPurchase), deliveryCost: shipment?.deliveryCost == null ? "" : String(shipment.deliveryCost),
    reference: payment?.reference ?? "", comment: entry?.comment ?? "", shippingAddressId: shipment?.shippingAddressId ?? "", deliveryAddressId: shipment?.deliveryAddressId ?? "" };
}
export function validateOperationDraft(draft: OperationDraft, payment: boolean): Record<string, string> {
  const errors: Record<string, string> = {};
  if (payment && !validDecimal(draft.amount, 2)) errors.amount = "Укажите положительную сумму, до двух знаков после запятой";
  if (!payment && !validDecimal(draft.quantity, 3)) errors.quantity = "Укажите положительный объём, до трёх знаков после запятой";
  if (!payment && !draft.unit.trim()) errors.unit = "Укажите единицу измерения";
  if (draft.status === "planned" && !/^\d{4}-\d{2}-\d{2}$/.test(draft.plannedDate)) errors.plannedDate = "Укажите плановую дату";
  if (draft.status !== "planned" && !/^\d{4}-\d{2}-\d{2}$/.test(draft.actualDate)) errors.actualDate = "Укажите фактическую дату";
  if (draft.status !== "planned" && draft.actualDate > todayMoscow()) errors.actualDate = "Фактическая дата не может быть в будущем";
  for (const field of ["amountPurchase", "deliveryCost"] as const) if (!payment && draft[field].trim() && !validDecimal(draft[field], 2, true)) errors[field] = "Укажите неотрицательную сумму, до двух знаков после запятой";
  return errors;
}
