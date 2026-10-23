"use client";

import { useLatestRequest } from "@/hooks/use-latest-request";
import { dealsService, servicesService } from "@/services";
import type { DealDto, ServiceDto } from "@definitions/dto";
import type { PreviewDealRequest } from "@definitions/requests";
import { useCallback, useEffect, useMemo, useState } from "react";
import { changeDealField, createDealFormData, formatDeliveredQuantity, hasActualDeliveries, isFormDataEqual } from "./model";
import type { DealDataFormHook, DealFormData } from "./types";

const loadPreview = (payload: PreviewDealRequest, signal: AbortSignal) =>
  dealsService.previewDeal(payload, { signal });

export default function useDataFormHook(
  defaultDeal?: DealDto,
  initialProviderId?: string,
  initialCustomerId?: string,
  initialData?: Partial<DealFormData>
): DealDataFormHook {
  const [initialFormData] = useState(() => createDealFormData(defaultDeal, initialProviderId, initialCustomerId, initialData));
  const [dealFormData, setDealFormData] = useState(initialFormData);
  const [services, setServices] = useState<ServiceDto[]>([]);

  useEffect(() => {
    let active = true;
    servicesService.getServices().then((items) => {
      if (active) setServices(items);
    }).catch(() => { /* The service selector stays empty if unavailable. */ });
    return () => { active = false; };
  }, []);

  const operationsLocked = Boolean(defaultDeal?.operationsSummary && ((defaultDeal.operationsSummary.plannedQuantity ?? 0) > 0 || (defaultDeal.operationsSummary.deliveredQuantity ?? 0) > 0));
  const unitLocked = operationsLocked || initialFormData.deliveredQuantity.length > 0 || hasActualDeliveries(dealFormData);
  const editing = Boolean(defaultDeal);
  const updateField = useCallback(
    <K extends keyof DealFormData>(key: K, value: DealFormData[K]) => {
      if (editing && (key === "serviceId" || key === "customerId")) return;
      setDealFormData((current) => changeDealField(
        current, key, value, services,
        operationsLocked || initialFormData.deliveredQuantity.length > 0 || hasActualDeliveries(current)
      ));
    },
    [services, initialFormData, editing, operationsLocked]
  );

  const previewPayload = useMemo<PreviewDealRequest>(() => ({
    quantity: Number(dealFormData.quantity),
    amountPurchaseUnit: Number(dealFormData.amountPurchaseUnit),
    amountSalesUnit: Number(dealFormData.amountSalesUnit),
    amountDelivery: Number(dealFormData.amountDelivery),
    paymentMethod: dealFormData.paymentMethod,
    addExpenses: dealFormData.extraExpenses.map((item) => ({ name: item.name, amount: Number(item.amount || 0) })),
    deliveredQuantity: formatDeliveredQuantity(dealFormData.deliveredQuantity, dealFormData.unitMeasurement),
  }), [
    dealFormData.quantity, dealFormData.amountPurchaseUnit, dealFormData.amountSalesUnit,
    dealFormData.amountDelivery, dealFormData.paymentMethod, dealFormData.extraExpenses,
    dealFormData.deliveredQuantity, dealFormData.unitMeasurement,
  ]);
  const preview = useLatestRequest(previewPayload, loadPreview, 300);

  return {
    dealFormData,
    updateField,
    unitLocked,
    taxPercent: preview.data?.ndsPercent ?? 0,
    managerShare: preview.data?.managerShare ?? 0,
    calculatedData: preview.data,
    calculationLoading: preview.loading,
    calculationError: preview.error,
    retryCalculation: preview.retry,
    isDirty: !isFormDataEqual(dealFormData, initialFormData),
    services,
  };
}
