"use client";

import useAuthContext from "@/contexts/auth-context";
import { dealCalculator } from "@/lib/calculators";
import { useDebounce } from "@/lib/debouncer";
import { DealDto } from "@definitions/dto";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DealDataFormHook,
  DealFormData,
  MeasurementUnit,
  PaymentMethod,
  ReceivingMethod,
} from "./types";

const NDS_PERCENT = 0.2;

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
    deliveryDate: defaultDeal?.deadline
      ? new Date(defaultDeal.deadline.split("T")[0])
      : undefined,
    deliveryTime: defaultDeal?.deadline
      ? defaultDeal.deadline.split(" ")[1]
      : "",
    notes: defaultDeal?.notes || "",
    extraExpenses:
      defaultDeal?.addExpenses.map((el) => ({
        ...el,
        amount: el.amount.toString(),
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

  useEffect(() => {
    if (!!defaultDeal && defaultDeal.serviceId === dealFormData.serviceId) {
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
          (defaultDeal.methodReceiving as ReceivingMethod) || "самовывоз",
        deliveryAddress: defaultDeal.deliveryAddress || "",
        shippingAddress: defaultDeal.shippingAddress || "",
        ossig: defaultDeal.OSSIG || false,
        deliveryDate: new Date(defaultDeal.deadline || ""),
        deliveryTime: defaultDeal.deadline
          ? defaultDeal.deadline.split(" ")[1]
          : "",
      }));

      return;
    }
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
      methodReceiving: "самовывоз",
      deliveryAddress: "",
      shippingAddress: "",
      ossig: false,
    }));
  }, [dealFormData.serviceId, defaultDeal]);

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

  return {
    dealFormData,
    updateField,

    taxPercent: NDS_PERCENT,
    calculatedData,
  };
}
