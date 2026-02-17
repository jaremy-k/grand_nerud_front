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

export function actualProfitCalculator(
  totalDeliveredQuantity: number,
  quantity: number,
  amountPurchaseUnit: number,
  amountSalesUnit: number,
  deliveryPrice: number,
  extraExpenses: ExtraExpenses[]
) {
  if (totalDeliveredQuantity <= 0 || quantity <= 0) {
    return {
      actualAmountSalesTotal: 0,
      actualAmountPurchaseTotal: 0,
      actualCompanyProfit: 0,
    };
  }
  const share = totalDeliveredQuantity / quantity;
  const actualAmountSalesTotal = amountSalesUnit * totalDeliveredQuantity;
  const actualAmountPurchaseTotal = amountPurchaseUnit * totalDeliveredQuantity;
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
