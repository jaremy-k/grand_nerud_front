import type { DealDto, ServiceDto } from "@definitions/dto";
import type { DealFormData, MeasurementUnit, PaymentMethod, ReceivingMethod } from "./types";
import { parseISO } from "date-fns";

export function createDealFormData(
  deal?: DealDto,
  providerId?: string,
  customerId?: string,
  initialData?: Partial<DealFormData>
): DealFormData {
  return {
    serviceId: deal?.serviceId,
    customerId: deal?.customerId || customerId,
    providerId: deal?.providerId || deal?.provider?._id || providerId,
    stageId: deal?.stageId,
    materialId: deal?.materialId || undefined,
    unitMeasurement: (deal?.unitMeasurement as MeasurementUnit) || "тонна",
    quantity: String(deal?.quantity ?? "0"),
    amountPurchaseUnit: String(deal?.amountPurchaseUnit ?? "0"),
    amountSalesUnit: String(deal?.amountSalesUnit ?? "0"),
    amountDelivery: String(deal?.amountDelivery ?? "0"),
    paymentMethod: (deal?.paymentMethod as PaymentMethod) || "наличный расчет",
    methodReceiving: (deal?.methodReceiving as ReceivingMethod) || "самовывоз",
    deliveryAddressId: deal?.deliveryAddressId || "",
    shippingAddressId: deal?.shippingAddressId || "",
    ossig: deal?.OSSIG || false,
    notes: deal?.notes || "",
    extraExpenses: deal?.addExpenses?.map((item) => ({ ...item, amount: String(item.amount) })) || [],
    deliveredQuantity: deal?.deliveredQuantity?.map((item) => ({
      quantity: String(item.quantity ?? ""),
      unit: item.unit || deal.unitMeasurement,
      date: item.date ? parseISO(item.date) : undefined,
      amountPurchase: item.amountPurchase != null ? String(item.amountPurchase) : "",
    })) || [],
    ...(!deal ? initialData : {}),
  };
}

export function hasActualDeliveries(data: DealFormData): boolean {
  return data.deliveredQuantity.some((item) => item.date && Number(item.quantity) > 0);
}

export function changeDealField<K extends keyof DealFormData>(
  current: DealFormData,
  key: K,
  value: DealFormData[K],
  services: ServiceDto[],
  unitLocked: boolean
): DealFormData {
  if (current[key] === value || (key === "unitMeasurement" && unitLocked)) return current;
  const next = { ...current, [key]: value };
  if (key === "customerId") next.deliveryAddressId = "";
  if (key === "providerId") next.shippingAddressId = "";
  if (key === "serviceId") {
    const kind = services.find((service) => service._id === value)?.kind;
    if (kind === "transport") {
      next.methodReceiving = "доставка";
      next.amountPurchaseUnit = "0";
      next.amountSalesUnit = "0";
    } else if (kind) {
      next.ossig = false;
    }
  }
  if (key === "methodReceiving" && value === "самовывоз") {
    next.deliveryAddressId = "";
    next.amountDelivery = "0";
  }
  if (key === "unitMeasurement") {
    next.deliveredQuantity = current.deliveredQuantity.map((item) => ({ ...item, unit: next.unitMeasurement }));
  }
  return next;
}

export function formatDeliveredQuantity(
  items: DealFormData["deliveredQuantity"],
  unitMeasurement: MeasurementUnit
) {
  return items.filter((item) => item.date && item.quantity).map((item) => {
    const date = item.date!;
    const amountPurchase = item.amountPurchase ? Number(item.amountPurchase) : undefined;
    return {
      quantity: Number(item.quantity),
      unit: item.unit || unitMeasurement,
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} 00:00`,
      ...(amountPurchase != null && Number.isFinite(amountPurchase) ? { amountPurchase } : {}),
    };
  });
}

export function isFormDataEqual(a: DealFormData, b: DealFormData): boolean {
  return (Object.keys(a) as (keyof DealFormData)[]).every((key) =>
    JSON.stringify(a[key]) === JSON.stringify(b[key])
  );
}
