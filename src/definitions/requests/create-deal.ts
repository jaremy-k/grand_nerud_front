export default interface CreateDealRequest {
  serviceId: string;
  customerId: string;
  stageId: string;
  materialId: string;

  unitMeasurement: "тонна" | "куб.м" | "шт";

  quantity: number;
  amountPurchaseUnit: number;
  amountSalesUnit: number;
  amountDelivery: number;

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
  }>;
}
