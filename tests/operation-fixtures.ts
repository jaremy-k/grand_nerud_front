import type { DealOperationsDto } from "@/definitions/dto/deal-operations";

export const operationFixture: DealOperationsDto = {
  dealId: "deal", revision: "a".repeat(64), version: 0, payments: [], shipments: [],
  history: { items: [], page: 1, pageSize: 25, total: 0, totalPages: 0 },
  summary: { currency: "RUB", paymentStatus: "unpaid", executionStatus: "partial", customerAmount: 150000, customerPaid: 0, customerDebt: 150000, customerOverpayment: 0,
    providerAmount: 90000, providerPaid: 0, providerDebt: 90000, providerOverpayment: 0, deliveryPaid: 0, otherPaid: 0, cashBalance: 0,
    orderedQuantity: 100, unit: "т", deliveredQuantity: 20, plannedQuantity: 0, remainingQuantity: 80, unplannedQuantity: 80, overDeliveredQuantity: 0, progress: 20,
    overduePayments: 0, overdueShipments: 0, warning: null },
};
