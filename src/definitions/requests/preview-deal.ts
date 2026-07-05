export default interface PreviewDealRequest {
  quantity: number;
  amountPurchaseUnit: number;
  amountSalesUnit: number;
  amountDelivery: number;
  paymentMethod: "наличный расчет" | "безналичный расчет";
  addExpenses: Array<{ name: string; amount: number }>;
  deliveredQuantity: Array<{
    quantity: number;
    unit: string;
    date: string;
    amountPurchase?: number;
  }>;
}

export interface PreviewDealResult {
  taxAmount: number;
  companyProfit: number;
  managerProfit: number;
  amountPurchaseTotal: number;
  amountSalesTotal: number;
  actualCompanyProfit: number;
  actualAmountSalesTotal: number;
  actualAmountPurchaseTotal: number;
  totalDeliveredQuantity: number;
  ndsPercent: number;
  managerShare: number;
  totalAmount: number;
}
