export type PaymentKind = "customer" | "provider" | "delivery" | "other";
export type PaymentStatus = "unpaid" | "partial" | "paid" | "not_required" | "unknown";
export type ExecutionStatus = "unplanned" | "planned" | "partial" | "completed" | "unknown";
export type OperationResource = "payments" | "shipments";

export interface OperationSummary {
  currency: "RUB"; paymentStatus: PaymentStatus; executionStatus: ExecutionStatus;
  customerAmount: number | null; customerPaid: number; customerDebt: number | null; customerOverpayment: number | null;
  providerAmount: number | null; providerPaid: number; providerDebt: number | null; deliveryPaid: number; otherPaid: number; cashBalance: number;
  orderedQuantity: number | null; unit: string; deliveredQuantity: number | null; plannedQuantity: number | null;
  remainingQuantity: number | null; unplannedQuantity: number | null; overDeliveredQuantity: number | null; progress: number | null;
  overduePayments: number; overdueShipments: number; warning: string | null;
}
interface OperationBase { _id: string; requestId?: string; comment: string; createdAt?: string; updatedAt?: string; cancelReason?: string; cancelledAt?: string }
export interface DealPayment extends OperationBase {
  kind: PaymentKind; status: "planned" | "paid" | "cancelled"; amount: number; dueDate: string | null; actualDate: string | null; reference: string;
}
export interface DealShipment extends OperationBase {
  status: "planned" | "delivered" | "cancelled"; quantity: number; unit: string; plannedDate: string | null; actualDate: string | null;
  amountPurchase: number | null; deliveryCost: number | null; providerId?: string | null; shippingAddressId?: string | null;
  deliveryAddressId?: string | null; shippingAddressText?: string; deliveryAddressText?: string; invalid?: boolean;
}
export interface OperationHistory {
  _id: string; at: string; actorId: string; actorName: string; kind: OperationResource | "deal"; entryId: string;
  action: "created" | "updated" | "cancelled"; reason: string; before: Record<string, unknown> | null; after: Record<string, unknown> | null;
}
export interface DealOperationsDto {
  dealId: string; revision: string; version: number; summary: OperationSummary; payments: DealPayment[]; shipments: DealShipment[];
  history: { items: OperationHistory[]; total: number; page: number; pageSize: number; totalPages: number };
}
export interface PaymentWrite {
  revision: string; requestId: string; kind: PaymentKind; status: "planned" | "paid"; amount: string; dueDate: string | null;
  actualDate: string | null; reference: string; comment: string;
}
export interface ShipmentWrite {
  revision: string; requestId: string; status: "planned" | "delivered"; quantity: string; unit: string; plannedDate: string | null;
  actualDate: string | null; amountPurchase: string | null; deliveryCost: string | null; comment: string;
  shippingAddressId?: string | null; deliveryAddressId?: string | null;
}
