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
  const companyProfit = amountSalesTotal - amountPurchaseTotal - deliveryPrice;
  const managerProfit =
    companyProfit * managerShare -
    extraExpenses.reduce((pv, el) => pv + Number(el.amount), 0);

  return {
    taxAmount,
    companyProfit,
    managerProfit,
    amountPurchaseTotal,
    amountSalesTotal,
  };
}
