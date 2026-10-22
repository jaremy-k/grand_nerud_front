import { ServiceDto } from "@definitions/dto";
import type { PreviewDealResult } from "@definitions/requests";

export type MeasurementUnit = "тонна" | "куб.м" | "шт";
export type PaymentMethod = "наличный расчет" | "безналичный расчет";
export type ReceivingMethod = "самовывоз" | "доставка";

export type ExtraExpenses = { name: string; amount: string };
export type DeliveredQuantity = {
  quantity: string;
  unit: string;
  date: Date | undefined;
  amountPurchase: string;
};

export type DealDataFormHook = {
  dealFormData: DealFormData;
  updateField: <K extends keyof DealFormData>(
    key: K,
    value: DealFormData[K]
  ) => void;

  taxPercent: number;
  managerShare: number;
  isDirty: boolean;
  services: ServiceDto[];
  unitLocked: boolean;
  calculatedData: PreviewDealResult | null;
  calculationLoading: boolean;
  calculationError: string | null;
  retryCalculation: () => void;
};

export type DealFormData = {
  serviceId: string | undefined;
  customerId: string | undefined;
  providerId: string | undefined;
  stageId: string | undefined;
  materialId: string | undefined;
  unitMeasurement: MeasurementUnit;
  quantity: string;
  amountPurchaseUnit: string;
  amountSalesUnit: string;
  amountDelivery: string;
  paymentMethod: PaymentMethod;
  methodReceiving: ReceivingMethod;
  deliveryAddressId: string;
  shippingAddressId: string;
  ossig: boolean;
  notes: string;
  extraExpenses: Array<ExtraExpenses>;
  deliveredQuantity: Array<DeliveredQuantity>;
};
