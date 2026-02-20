import { DealDto } from "@definitions/dto";
import { UpdateDealRequest } from "@definitions/requests";

/**
 * Собирает UpdateDealRequest из существующей сделки.
 * Позволяет переопределить любые поля (например, stageId для быстрой смены этапа).
 */
export function buildUpdateDealRequestFromDeal(
  deal: DealDto,
  overrides: Partial<UpdateDealRequest> = {}
): UpdateDealRequest {
  const base: UpdateDealRequest = {
    stageId: deal.stageId,
    materialId: deal.materialId ?? "",
    unitMeasurement: (deal.unitMeasurement || "тонна") as "тонна" | "куб.м" | "шт",
    quantity: deal.quantity,
    amountPurchaseUnit: deal.amountPurchaseUnit,
    amountPurchaseTotal: deal.amountPurchaseTotal,
    amountSalesUnit: deal.amountSalesUnit,
    amountSalesTotal: deal.amountSalesTotal,
    amountDelivery: deal.amountDelivery,
    companyProfit: deal.companyProfit,
    ndsAmount: deal.ndsAmount,
    ndsPercent: deal.ndsPercent,
    totalAmount: deal.totalAmount,
    managerProfit: deal.managerProfit,
    paymentMethod: deal.paymentMethod as "наличный расчет" | "безналичный расчет",
    shippingAddress: deal.shippingAddress ?? "",
    methodReceiving: deal.methodReceiving as "самовывоз" | "доставка",
    deliveryAddress: deal.deliveryAddress ?? "",
    notes: deal.notes ?? "",
    OSSIG: deal.OSSIG ?? false,
    addExpenses: (deal.addExpenses ?? []).map((e) => ({
      name: e.name,
      amount: e.amount,
    })),
    deliveredQuantity: (deal.deliveredQuantity ?? []).map((dq) => ({
      quantity: dq.quantity,
      unit: dq.unit,
      date: dq.date?.includes(" ") ? dq.date : `${dq.date} 00:00`,
      ...(dq.amountPurchase != null ? { amountPurchase: dq.amountPurchase } : {}),
    })),
  };
  return { ...base, ...overrides };
}
