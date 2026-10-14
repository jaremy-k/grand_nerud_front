import type LeadDto from "@/definitions/dto/lead";
import type { DealFormData, MeasurementUnit } from "@/features/deals/hooks/deal-form/types";

export function leadToDealInitialData(lead: LeadDto): Partial<DealFormData> {
  const units: Record<string, MeasurementUnit> = { "т": "тонна", "тонна": "тонна", "м³": "куб.м", "м3": "куб.м", "куб.м": "куб.м", "шт": "шт" };
  return {
    customerId: lead.companyId || undefined,
    materialId: lead.materialIds?.length === 1 ? lead.materialIds[0] : undefined,
    quantity: lead.quantity != null ? String(lead.quantity) : "0",
    unitMeasurement: units[lead.unitMeasurement ?? ""] || "тонна",
    deliveryAddressId: lead.objectAddressId || "",
    methodReceiving: lead.objectAddressId || lead.objectAddress ? "доставка" : "самовывоз",
    notes: lead.notes || "",
  };
}
