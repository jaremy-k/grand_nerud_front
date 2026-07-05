import { ServiceDto } from "@definitions/dto";

export type MeasurementUnit = "тонна" | "куб.м" | "шт";
export type PaymentMethod = "наличный расчет" | "безналичный расчет";
export type ReceivingMethod = "самовывоз" | "доставка";

export type ExtraExpenses = { name: string; amount: string };
export type DeliveredQuantity = {
  quantity: string;
  date: Date | undefined;
  amountPurchase: string;
};

export type DealDataFormHook = {
  dealFormData: DealFormData;
  updateField: (
    key: keyof DealFormData,
    value: DealFormData[keyof DealFormData]
  ) => void;

  taxPercent: number;
  managerShare: number;
  isDirty: boolean;
  services: ServiceDto[];

  calculatedData: {
    taxAmount: number;
    companyProfit: number;
    managerProfit: number;
    amountPurchaseTotal: number;
    amountSalesTotal: number;
    actualCompanyProfit: number;
    actualAmountSalesTotal: number;
    totalDeliveredQuantity: number;
  };
};

export type DealFormData = {
  serviceId: string | undefined;
  customerId: string | undefined;
  stageId: string | undefined;
  materialId: string | undefined;
  unitMeasurement: MeasurementUnit;
  quantity: string;
  amountPurchaseUnit: string;
  amountSalesUnit: string;
  amountDelivery: string;
  paymentMethod: PaymentMethod;
  methodReceiving: ReceivingMethod;
  deliveryAddress: string;
  shippingAddress: string;
  ossig: boolean;
  notes: string;
  extraExpenses: Array<ExtraExpenses>;
  deliveredQuantity: Array<DeliveredQuantity>;
};
