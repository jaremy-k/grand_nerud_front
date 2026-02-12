"use client";

import useAuthContext from "@/contexts/auth-context";
import {
  isSalesService,
  isTransportService,
} from "@/config/services";
import { dealCalculator } from "@/lib/calculators";
import { useDebounce } from "@/lib/debouncer";
import { DealDto } from "@definitions/dto";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DealDataFormHook,
  DealFormData,
  MeasurementUnit,
  PaymentMethod,
  ReceivingMethod,
} from "./types";

const NDS_PERCENT = 0.2;

function dealToFormData(d: DealDto): DealFormData {
  return {
    serviceId: d.serviceId,
    customerId: d.customerId,
    stageId: d.stageId,
    materialId: d.materialId ?? undefined,
    unitMeasurement: (d.unitMeasurement as MeasurementUnit) || "тонна",
    quantity: String(d.quantity || "0"),
    managerShare: "0",
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
    if (da.quantity !== db.quantity) return false;
    const dateA = da.date ? da.date.toISOString().slice(0, 10) : "";
    const dateB = db.date ? db.date.toISOString().slice(0, 10) : "";
    if (dateA !== dateB) return false;
  }
  return true;
}

export default function useDataFormHook(
  defaultDeal?: DealDto
): DealDataFormHook {
  const { user } = useAuthContext();

  const [dealFormData, setDealFormData] = useState<DealFormData>({
    serviceId: defaultDeal?.serviceId || undefined,
    customerId: defaultDeal?.customerId || undefined,
    stageId: defaultDeal?.stageId || undefined,
    materialId: defaultDeal?.materialId || undefined,
    unitMeasurement:
      (defaultDeal?.unitMeasurement as MeasurementUnit) || "тонна",
    quantity: String(defaultDeal?.quantity || "0"),
    managerShare: "0",
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
      })) || [],
  });

  const updateField = useCallback(
    (key: keyof DealFormData, value: DealFormData[keyof DealFormData]) => {
      setDealFormData((c) => ({
        ...c,
        [key]: value,
      }));
    },
    [setDealFormData]
  );

  // Calculate totals with debounce
  const debounced = useDebounce(
    useMemo(
      () => ({
        quantity: dealFormData.quantity,
        amountPurchaseUnit: dealFormData.amountPurchaseUnit,
        amountSalesUnit: dealFormData.amountSalesUnit,
        paymentMethod: dealFormData.paymentMethod,
        amountDelivery: dealFormData.amountDelivery,
        managerShare: dealFormData.managerShare,
        extraExpenses: dealFormData.extraExpenses,
      }),
      [
        dealFormData.quantity,
        dealFormData.amountPurchaseUnit,
        dealFormData.amountSalesUnit,
        dealFormData.paymentMethod,
        dealFormData.amountDelivery,
        dealFormData.managerShare,
        dealFormData.extraExpenses,
      ]
    ),
    300
  );
  const calculatedData = useMemo(() => {
    return dealCalculator(
      Number(debounced.quantity),
      Number(debounced.amountPurchaseUnit),
      Number(debounced.amountSalesUnit),
      Number(debounced.managerShare),
      dealFormData.paymentMethod === "безналичный расчет" ? NDS_PERCENT : 0,
      Number(debounced.amountDelivery),
      debounced.extraExpenses
    );
  }, [debounced, dealFormData.paymentMethod]);

  const prevServiceIdRef = useRef<string | undefined>(defaultDeal?.serviceId);

  // При смене услуги: сбрасываем поля только при переходе между разными типами
  // (продажа ↔ доставка). При переключении Продажа ↔ Продажа с доставкой — сохраняем данные.
  useEffect(() => {
    if (!dealFormData.serviceId) return;

    const prevServiceId = prevServiceIdRef.current;
    const currServiceId = dealFormData.serviceId;
    const prevWasSales = isSalesService(prevServiceId);
    const currIsSales = isSalesService(currServiceId);
    const currIsTransport = isTransportService(currServiceId);

    prevServiceIdRef.current = currServiceId;

    // Редактирование: если услуга не менялась — синхронизируем с defaultDeal
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
          })) || [],
      }));
      return;
    }

    // Смена типа услуги: сбрасываем только при переходе продажа ↔ доставка
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
  }, [dealFormData.serviceId, defaultDeal]);

  // Автоматически устанавливаем "доставка" для услуги перевозки
  useEffect(() => {
    if (
      dealFormData.serviceId &&
      isTransportService(dealFormData.serviceId) &&
      dealFormData.methodReceiving !== "доставка"
    ) {
      updateField("methodReceiving", "доставка");
    }
  }, [dealFormData.serviceId, dealFormData.methodReceiving, updateField]);

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

  useEffect(() => {
    updateField(
      "managerShare",
      dealFormData.paymentMethod === "наличный расчет"
        ? String(user?.profit?.cash.alone || "0.05")
        : String(user?.profit?.nonCash.alone || "0.05")
    );
  }, [dealFormData.paymentMethod, user, updateField]);

  const initialFormData = useMemo(
    () => (defaultDeal ? dealToFormData(defaultDeal) : null),
    [defaultDeal?._id]
  );

  const isDirty =
    !initialFormData || !isFormDataEqual(dealFormData, initialFormData);

  return {
    dealFormData,
    updateField,

    taxPercent: NDS_PERCENT,
    calculatedData,
    isDirty,
  };
}
