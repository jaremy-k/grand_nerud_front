import type { DealDto, ServiceDto } from "@definitions/dto";

export const services: ServiceDto[] = [
  { _id: "sales", name: "Продажа", kind: "sales" },
  { _id: "transport", name: "Перевозка", kind: "transport" },
];

export const deal: DealDto = {
  _id: "deal", serviceId: "sales", customerId: "customer", providerId: "provider",
  stageId: "stage", materialId: "sand", quantity: 100, unitMeasurement: "тонна",
  methodReceiving: "доставка", shippingAddressId: "shipping", deliveryAddressId: "object",
  amountPurchaseUnit: 900, amountSalesUnit: 1500, amountDelivery: 200,
  paymentMethod: "наличный расчет", OSSIG: false, notes: "Комментарий", addExpenses: [],
  deliveredQuantity: [{ quantity: 20, unit: "т", date: "2026-10-20 00:00", amountPurchase: 18000 }],
  userId: "manager", amountPurchaseTotal: 90000, amountSalesTotal: 150000,
  companyProfit: 59800, ndsAmount: 0, ndsPercent: 0, totalAmount: 150000, managerProfit: 5980,
  shippingAddress: null, deliveryAddress: null, user: null, service: null, customer: null,
  provider: null, stage: null, material: null, createdAt: "2026-10-20", updatedAt: "2026-10-20", deletedAt: null,
};

export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}
