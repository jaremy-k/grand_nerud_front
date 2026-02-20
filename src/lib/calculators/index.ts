import { ExtraExpenses } from "@features/deals/hooks/deal-form";

export function dealCalculator(
  quantity: number,
  amountPurchaseUnit: number,
  amountSalesUnit: number,
  managerShare: number,
  taxPercent: number,
  deliveryPrice: number,
  extraExpenses: ExtraExpenses[]
) {
  const amountSalesTotal = amountSalesUnit * quantity;
  const amountPurchaseTotal = amountPurchaseUnit * quantity;
  const taxAmount = (amountSalesTotal / (1 + taxPercent)) * taxPercent;
  const extraExpensesSum = extraExpenses.reduce(
    (pv, el) => pv + Number(el.amount),
    0
  );
  const companyProfit =
    amountSalesTotal -
    amountPurchaseTotal -
    deliveryPrice -
    extraExpensesSum;
  const managerProfit = companyProfit * managerShare;

  return {
    taxAmount,
    companyProfit,
    managerProfit,
    amountPurchaseTotal,
    amountSalesTotal,
  };
}

export type DeliveredItem = { quantity: number; amountPurchase?: number };

export function actualProfitCalculator(
  deliveredItems: DeliveredItem[],
  quantity: number,
  amountPurchaseUnit: number,
  amountSalesUnit: number,
  deliveryPrice: number,
  extraExpenses: ExtraExpenses[]
) {
  const totalDeliveredQuantity = deliveredItems.reduce(
    (s, d) => s + d.quantity,
    0
  );
  if (totalDeliveredQuantity <= 0 || quantity <= 0) {
    return {
      actualAmountSalesTotal: 0,
      actualAmountPurchaseTotal: 0,
      actualCompanyProfit: 0,
    };
  }
  const share = totalDeliveredQuantity / quantity;
  const actualAmountSalesTotal = amountSalesUnit * totalDeliveredQuantity;
  const actualAmountPurchaseTotal = deliveredItems.reduce((s, d) => {
    const cost =
      d.amountPurchase != null ? d.amountPurchase : amountPurchaseUnit * d.quantity;
    return s + cost;
  }, 0);
  const extraExpensesSum = extraExpenses.reduce(
    (pv, el) => pv + Number(el.amount),
    0
  );
  const actualCompanyProfit =
    actualAmountSalesTotal -
    actualAmountPurchaseTotal -
    deliveryPrice * share -
    extraExpensesSum * share;

  return {
    actualAmountSalesTotal,
    actualAmountPurchaseTotal,
    actualCompanyProfit,
  };
}
