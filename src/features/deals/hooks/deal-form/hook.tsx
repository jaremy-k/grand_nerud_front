"use client";

import {
  isSalesService,
  isTransportService,
} from "@/config/services";
import { useDebounce } from "@/lib/debouncer";
import { dealsService, servicesService } from "@/services";
import { DealDto, ServiceDto } from "@definitions/dto";
import { PreviewDealResult } from "@definitions/requests";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DealDataFormHook,
  DealFormData,
  MeasurementUnit,
  PaymentMethod,
  ReceivingMethod,
} from "./types";

const EMPTY_CALC: PreviewDealResult = {
  taxAmount: 0,
  companyProfit: 0,
  managerProfit: 0,
  amountPurchaseTotal: 0,
  amountSalesTotal: 0,
  actualCompanyProfit: 0,
  actualAmountSalesTotal: 0,
  actualAmountPurchaseTotal: 0,
  totalDeliveredQuantity: 0,
  ndsPercent: 0,
  managerShare: 0,
  totalAmount: 0,
};

function dealToFormData(d: DealDto): DealFormData {
  return {
    serviceId: d.serviceId,
    customerId: d.customerId,
    stageId: d.stageId,
    materialId: d.materialId ?? undefined,
    unitMeasurement: (d.unitMeasurement as MeasurementUnit) || "тонна",
    quantity: String(d.quantity || "0"),
    amountPurchaseUnit: String(d.amountPurchaseUnit || "0"),
    amountSalesUnit: String(d.amountSalesUnit || "0"),
    amountDelivery: String(d.amountDelivery || "0"),
    paymentMethod: (d.paymentMethod as PaymentMethod) || "наличный расчет",
    methodReceiving: (d.methodReceiving as ReceivingMethod) || "самовывоз",
    deliveryAddress: d.deliveryAddress || "",
    shippingAddress: d.shippingAddress || "",
    ossig: d.OSSIG || false,
    notes: d.notes || "",
    extraExpenses:
      d.addExpenses?.map((el) => ({
        ...el,
        amount: el.amount.toString(),
      })) || [],
    deliveredQuantity:
      d.deliveredQuantity?.map((el) => ({
        quantity: String(el.quantity || ""),
        date: el.date ? new Date(el.date.split(" ")[0]) : undefined,
        amountPurchase: el.amountPurchase != null ? String(el.amountPurchase) : "",
      })) || [],
  };
}

function isFormDataEqual(a: DealFormData, b: DealFormData): boolean {
  if (
    a.serviceId !== b.serviceId ||
    a.customerId !== b.customerId ||
    a.stageId !== b.stageId ||
    a.materialId !== b.materialId ||
    a.unitMeasurement !== b.unitMeasurement ||
    a.quantity !== b.quantity ||
    a.amountPurchaseUnit !== b.amountPurchaseUnit ||
    a.amountSalesUnit !== b.amountSalesUnit ||
    a.amountDelivery !== b.amountDelivery ||
    a.paymentMethod !== b.paymentMethod ||
    a.methodReceiving !== b.methodReceiving ||
    a.deliveryAddress !== b.deliveryAddress ||
    a.shippingAddress !== b.shippingAddress ||
    a.ossig !== b.ossig ||
    a.notes !== b.notes
  ) {
    return false;
  }
  if (a.extraExpenses.length !== b.extraExpenses.length) return false;
  for (let i = 0; i < a.extraExpenses.length; i++) {
    if (
      a.extraExpenses[i].name !== b.extraExpenses[i].name ||
      a.extraExpenses[i].amount !== b.extraExpenses[i].amount
    ) {
      return false;
    }
  }
  if (a.deliveredQuantity.length !== b.deliveredQuantity.length) return false;
  for (let i = 0; i < a.deliveredQuantity.length; i++) {
    const da = a.deliveredQuantity[i];
    const db = b.deliveredQuantity[i];
    if (da.quantity !== db.quantity || da.amountPurchase !== db.amountPurchase)
      return false;
    const dateA = da.date ? da.date.toISOString().slice(0, 10) : "";
    const dateB = db.date ? db.date.toISOString().slice(0, 10) : "";
    if (dateA !== dateB) return false;
  }
  return true;
}

function formatDeliveredQuantity(
  items: DealFormData["deliveredQuantity"],
  unitMeasurement: MeasurementUnit
) {
  return items
    .filter((dq) => dq.date && dq.quantity)
    .map((dq) => {
      const amountPurchaseNum = dq.amountPurchase
        ? Number(dq.amountPurchase)
        : undefined;
      return {
        quantity: Number(dq.quantity),
        unit: unitMeasurement,
        date: `${dq.date!.getFullYear()}-${(dq.date!.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${dq.date!.getDate().toString().padStart(2, "0")} 00:00`,
        ...(amountPurchaseNum != null && !Number.isNaN(amountPurchaseNum)
          ? { amountPurchase: amountPurchaseNum }
          : {}),
      };
    });
}

export default function useDataFormHook(
  defaultDeal?: DealDto
): DealDataFormHook {
  const [dealFormData, setDealFormData] = useState<DealFormData>({
    serviceId: defaultDeal?.serviceId || undefined,
    customerId: defaultDeal?.customerId || undefined,
    stageId: defaultDeal?.stageId || undefined,
    materialId: defaultDeal?.materialId || undefined,
    unitMeasurement:
      (defaultDeal?.unitMeasurement as MeasurementUnit) || "тонна",
    quantity: String(defaultDeal?.quantity || "0"),
    amountPurchaseUnit: String(defaultDeal?.amountPurchaseUnit || "0"),
    amountSalesUnit: String(defaultDeal?.amountSalesUnit || "0"),
    amountDelivery: String(defaultDeal?.amountDelivery || "0"),
    paymentMethod:
      (defaultDeal?.paymentMethod as PaymentMethod) || "наличный расчет",
    methodReceiving:
      (defaultDeal?.methodReceiving as ReceivingMethod) || "самовывоз",
    deliveryAddress: defaultDeal?.deliveryAddress || "",
    shippingAddress: defaultDeal?.shippingAddress || "",
    ossig: defaultDeal?.OSSIG || false,
    notes: defaultDeal?.notes || "",
    extraExpenses:
      defaultDeal?.addExpenses?.map((el) => ({
        ...el,
        amount: el.amount.toString(),
      })) || [],
    deliveredQuantity:
      defaultDeal?.deliveredQuantity?.map((el) => ({
        quantity: String(el.quantity || ""),
        date: el.date ? new Date(el.date.split(" ")[0]) : undefined,
        amountPurchase: el.amountPurchase != null ? String(el.amountPurchase) : "",
      })) || [],
  });

  const [calculatedData, setCalculatedData] = useState(EMPTY_CALC);
  const [services, setServices] = useState<ServiceDto[]>([]);

  useEffect(() => {
    servicesService.getServices().then(setServices).catch(() => setServices([]));
  }, []);

  const updateField = useCallback(
    (key: keyof DealFormData, value: DealFormData[keyof DealFormData]) => {
      setDealFormData((c) => ({
        ...c,
        [key]: value,
      }));
    },
    [setDealFormData]
  );

  const previewPayload = useMemo(
    () => ({
      quantity: dealFormData.quantity,
      amountPurchaseUnit: dealFormData.amountPurchaseUnit,
      amountSalesUnit: dealFormData.amountSalesUnit,
      paymentMethod: dealFormData.paymentMethod,
      amountDelivery: dealFormData.amountDelivery,
      extraExpenses: dealFormData.extraExpenses,
      deliveredQuantity: dealFormData.deliveredQuantity,
      unitMeasurement: dealFormData.unitMeasurement,
    }),
    [
      dealFormData.quantity,
      dealFormData.amountPurchaseUnit,
      dealFormData.amountSalesUnit,
      dealFormData.paymentMethod,
      dealFormData.amountDelivery,
      dealFormData.extraExpenses,
      dealFormData.deliveredQuantity,
      dealFormData.unitMeasurement,
    ]
  );
  const debouncedPreview = useDebounce(previewPayload, 300);

  useEffect(() => {
    const controller = new AbortController();
    dealsService
      .previewDeal(
        {
          quantity: Number(debouncedPreview.quantity),
          amountPurchaseUnit: Number(debouncedPreview.amountPurchaseUnit),
          amountSalesUnit: Number(debouncedPreview.amountSalesUnit),
          amountDelivery: Number(debouncedPreview.amountDelivery),
          paymentMethod: debouncedPreview.paymentMethod,
          addExpenses: debouncedPreview.extraExpenses.map((v) => ({
            name: v.name,
            amount: Number(v.amount || 0),
          })),
          deliveredQuantity: formatDeliveredQuantity(
            debouncedPreview.deliveredQuantity,
            debouncedPreview.unitMeasurement
          ),
        },
        { signal: controller.signal }
      )
      .then(setCalculatedData)
      .catch(() => {});

    return () => controller.abort();
  }, [debouncedPreview]);

  const prevServiceIdRef = useRef<string | undefined>(defaultDeal?.serviceId);

  useEffect(() => {
    if (!dealFormData.serviceId) return;

    const prevServiceId = prevServiceIdRef.current;
    const currServiceId = dealFormData.serviceId;
    const prevWasSales = isSalesService(prevServiceId, services);
    const currIsSales = isSalesService(currServiceId, services);
    const currIsTransport = isTransportService(currServiceId, services);

    prevServiceIdRef.current = currServiceId;

    if (defaultDeal && defaultDeal.serviceId === currServiceId) {
      setDealFormData((c) => ({
        ...c,
        stageId: defaultDeal.stageId || undefined,
        materialId: defaultDeal.materialId || undefined,
        unitMeasurement:
          (defaultDeal.unitMeasurement as MeasurementUnit) || "тонна",
        quantity: String(defaultDeal.quantity || "0"),
        amountPurchaseUnit: String(defaultDeal.amountPurchaseUnit || "0"),
        amountSalesUnit: String(defaultDeal.amountSalesUnit || "0"),
        amountDelivery: String(defaultDeal.amountDelivery || "0"),
        paymentMethod:
          (defaultDeal.paymentMethod as PaymentMethod) || "наличный расчет",
        methodReceiving:
          (defaultDeal.methodReceiving as ReceivingMethod) ||
          (currIsTransport ? "доставка" : "самовывоз"),
        deliveryAddress: defaultDeal.deliveryAddress || "",
        shippingAddress: defaultDeal.shippingAddress || "",
        ossig: defaultDeal.OSSIG || false,
        deliveredQuantity:
          defaultDeal?.deliveredQuantity?.map((el) => ({
            quantity: String(el.quantity || ""),
            date: el.date ? new Date(el.date.split(" ")[0]) : undefined,
            amountPurchase: el.amountPurchase != null ? String(el.amountPurchase) : "",
          })) || [],
      }));
      return;
    }

    const switchedBetweenSalesAndTransport = prevWasSales !== currIsSales;

    if (switchedBetweenSalesAndTransport) {
      setDealFormData((c) => ({
        ...c,
        stageId: "",
        materialId: "",
        unitMeasurement: "тонна",
        quantity: "0",
        amountPurchaseUnit: "0",
        amountSalesUnit: "0",
        amountDelivery: "0",
        paymentMethod: "наличный расчет",
        methodReceiving: currIsTransport ? "доставка" : "самовывоз",
        deliveryAddress: "",
        shippingAddress: "",
        ossig: false,
      }));
    }
  }, [dealFormData.serviceId, defaultDeal, services]);

  useEffect(() => {
    if (
      dealFormData.serviceId &&
      isTransportService(dealFormData.serviceId, services) &&
      dealFormData.methodReceiving !== "доставка"
    ) {
      updateField("methodReceiving", "доставка");
    }
  }, [dealFormData.serviceId, dealFormData.methodReceiving, updateField, services]);

  useEffect(() => {
    if (
      defaultDeal &&
      defaultDeal.methodReceiving === dealFormData.methodReceiving
    ) {
      updateField("deliveryAddress", defaultDeal.deliveryAddress || "");
      updateField("amountDelivery", String(defaultDeal.amountDelivery || "0"));
      return;
    }
    updateField("deliveryAddress", "");
    updateField("amountDelivery", "0");
  }, [dealFormData.methodReceiving, defaultDeal, updateField]);

  const initialFormData = useMemo(
    () => (defaultDeal ? dealToFormData(defaultDeal) : null),
    [defaultDeal?._id]
  );

  const isDirty =
    !initialFormData || !isFormDataEqual(dealFormData, initialFormData);

  return {
    dealFormData,
    updateField,
    taxPercent: calculatedData.ndsPercent,
    managerShare: calculatedData.managerShare,
    calculatedData,
    isDirty,
    services,
  };
}

export { formatDeliveredQuantity };
