export default interface CreateDealRequest {
  serviceId: string;
  customerId: string;
  stageId: string;
  materialId: string;

  unitMeasurement: "тонна" | "куб.м" | "шт";

  quantity: number;

  amountPurchaseUnit: number;
  amountPurchaseTotal: number;

  amountSalesUnit: number;
  amountSalesTotal: number;

  amountDelivery: number;
  companyProfit: number;

  ndsAmount: number;
  ndsPercent: number;

  totalAmount: number;
  managerProfit: number;

  paymentMethod: "наличный расчет" | "безналичный расчет";

  shippingAddress: string;
  methodReceiving: "самовывоз" | "доставка";
  deliveryAddress: string;

  notes: string;
  OSSIG: boolean;

  addExpenses: Array<{ name: string; amount: number }>;
  deliveredQuantity: Array<{
    quantity: number;
    unit: string;
    date: string;
    amountPurchase?: number;
  }>; // date format: "YYYY-MM-DD 00:00"
}
