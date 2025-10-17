"use client";

import { useDebounce } from "@/lib/debouncer";
import { DealDto } from "@definitions/dto";
import { useEffect, useMemo, useState } from "react";

export type MeasurementUnit = "тонна" | "куб.м" | "шт";
export type PaymentMethod = "наличный расчет" | "безналичный расчет";
export type ReceivingMethod = "самовывоз" | "доставка";

export type DealDataFormHook = {
  serviceId: string | undefined;
  setServiceId: (val: string) => void;
  customerId: string | undefined;
  setCustomerId: (val: string) => void;
  stageId: string | undefined;
  setStageId: (val: string) => void;
  materialId: string | undefined;
  setMaterialId: (val: string) => void;
  //
  unitMeasurement: MeasurementUnit;
  setUnitMeasurement: (val: MeasurementUnit) => void;
  quantity: number;
  setQuantity: (val: number) => void;
  amountPurchaseUnit: string;
  setAmountPurchaseUnit: (val: string) => void;
  amountSalesUnit: string;
  setAmountSalesUnit: (val: string) => void;
  amountDelivery: string;
  setAmountDelivery: (val: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (val: PaymentMethod) => void;
  shippingAddress: string;
  setShippingAddress: (val: string) => void;
  methodReceiving: ReceivingMethod;
  setMethodReceiving: (val: ReceivingMethod) => void;
  deliveryAddress: string;
  setDeliveryAddress: (val: string) => void;
  ossig: boolean;
  setOssig: (val: boolean) => void;
  deliveryDate: Date | undefined;
  setDeliveryDate: (val: Date | undefined) => void;
  deliveryTime: string;
  setDeliveryTime: (val: string) => void;

  // Additional information
  notes: string;
  setNotes: (val: string) => void;

  // Hook methods and values
  calculatedData: {
    totalAmount: number;
    companyProfit: number;
    managerProfit: number;
    amountPurchaseTotal: number;
    amountSalesTotal: number;
  };
};

const roundWithDecimals = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100;

const calculateTotal = (
  quantity: number,
  amountPurchaseUnit: number,
  amountSalesUnit: number,
  deliveryPrice: number = 0
) => {
  const amountPurchaseTotal = quantity * amountPurchaseUnit;
  const amountSalesTotal = quantity * amountSalesUnit;
  const companyProfit = amountSalesTotal - amountPurchaseTotal;
  const totalAmount = amountSalesTotal + deliveryPrice;
  const managerProfit = roundWithDecimals(companyProfit * 0.5);

  return {
    totalAmount,
    companyProfit,
    managerProfit,
    amountPurchaseTotal,
    amountSalesTotal,
  };
};

export function useDataFormHook(defaultDeal?: DealDto): DealDataFormHook {
  // Primary information
  const [serviceId, setServiceId] = useState<string | undefined>(
    defaultDeal?.serviceId || undefined
  );
  const [customerId, setCustomerId] = useState<string | undefined>(
    defaultDeal?.customerId || undefined
  );
  const [stageId, setStageId] = useState<string | undefined>(
    defaultDeal?.stageId || undefined
  );
  const [materialId, setMaterialId] = useState<string | undefined>(
    defaultDeal?.materialId || undefined
  );

  // Payments information
  const [unitMeasurement, setUnitMeasurement] = useState<MeasurementUnit>(
    (defaultDeal?.unitMeasurement as MeasurementUnit) || "тонна"
  );
  const [quantity, setQuantity] = useState<number>(defaultDeal?.quantity || 0);
  const [amountPurchaseUnit, setAmountPurchaseUnit] = useState<string>(
    defaultDeal?.amountPurchaseUnit
      ? String(defaultDeal.amountPurchaseUnit)
      : "0"
  );
  const [amountSalesUnit, setAmountSalesUnit] = useState<string>(
    defaultDeal?.amountSalesUnit ? String(defaultDeal.amountSalesUnit) : "0"
  );
  const [amountDelivery, setAmountDelivery] = useState<string>(
    defaultDeal?.amountDelivery ? String(defaultDeal.amountDelivery) : "0"
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    (defaultDeal?.paymentMethod as PaymentMethod) || "наличный расчет"
  );

  // Delivery information
  const [methodReceiving, setMethodReceiving] = useState<ReceivingMethod>(
    (defaultDeal?.methodReceiving as ReceivingMethod) || "самовывоз"
  );
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    defaultDeal?.deliveryAddress || ""
  );
  const [shippingAddress, setShippingAddress] = useState<string>(
    defaultDeal?.shippingAddress || ""
  );
  const [ossig, setOssig] = useState<boolean>(defaultDeal?.OSSIG || false);

  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    defaultDeal?.deadline
      ? new Date(defaultDeal.deadline.split("T")[0])
      : undefined
  );
  const [deliveryTime, setDeliveryTime] = useState<string>(
    defaultDeal?.deadline ? defaultDeal.deadline.split(" ")[1] : ""
  );

  const [notes, setNotes] = useState<string>(defaultDeal?.notes || "");

  // Calculate totals with debounce
  const debounced = useDebounce(
    useMemo(
      () => ({
        quantity,
        amountPurchaseUnit,
        amountSalesUnit,
        amountDelivery,
      }),
      [quantity, amountPurchaseUnit, amountSalesUnit, amountDelivery]
    ),
    300
  );
  const calculatedData = useMemo(
    () =>
      calculateTotal(
        Number(debounced.quantity),
        Number(debounced.amountPurchaseUnit),
        Number(debounced.amountSalesUnit),
        Number(debounced.amountDelivery)
      ),
    [debounced]
  );

  useEffect(() => {
    if (!!defaultDeal && defaultDeal.serviceId === serviceId) {
      setStageId(defaultDeal.stageId || undefined);
      setMaterialId(defaultDeal.materialId || undefined);
      setUnitMeasurement(
        (defaultDeal.unitMeasurement as MeasurementUnit) || "тонна"
      );
      setQuantity(defaultDeal.quantity || 0);
      setAmountPurchaseUnit(String(defaultDeal.amountPurchaseUnit || "0"));
      setAmountSalesUnit(String(defaultDeal.amountSalesUnit || "0"));
      setAmountDelivery(String(defaultDeal.amountDelivery || "0"));
      setShippingAddress(defaultDeal.shippingAddress || "");
      setDeliveryAddress(defaultDeal.deliveryAddress || "");
      setOssig(defaultDeal.OSSIG || false);
      setPaymentMethod(
        (defaultDeal.paymentMethod as PaymentMethod) || "наличный расчет"
      );
      setMethodReceiving(
        (defaultDeal.methodReceiving as ReceivingMethod) || "самовывоз"
      );
      setNotes(defaultDeal.notes || "");
      setDeliveryDate(new Date(defaultDeal.deadline || ""));
      setDeliveryTime(
        defaultDeal.deadline ? defaultDeal.deadline.split(" ")[1] : ""
      );
      return;
    }
    setStageId("");
    setMaterialId("");
    setUnitMeasurement("тонна");
    setQuantity(0);
    setAmountPurchaseUnit("0");
    setAmountSalesUnit("0");
    setAmountDelivery("0");
    setShippingAddress("");
    setDeliveryAddress("");
    setOssig(false);
    setPaymentMethod("наличный расчет");
    setMethodReceiving("самовывоз");
    setNotes("");
  }, [serviceId, defaultDeal]);

  useEffect(() => {
    if (defaultDeal && defaultDeal.methodReceiving === methodReceiving) {
      setDeliveryAddress(defaultDeal.deliveryAddress || "");
      setAmountDelivery(String(defaultDeal.amountDelivery || "0"));
      return;
    }
    setDeliveryAddress("");
    setAmountDelivery("0");
  }, [methodReceiving, defaultDeal]);

  return {
    serviceId,
    setServiceId,
    customerId,
    setCustomerId,
    stageId,
    setStageId,
    materialId,
    setMaterialId,
    unitMeasurement,
    setUnitMeasurement,
    quantity,
    setQuantity,
    amountPurchaseUnit,
    setAmountPurchaseUnit,
    amountSalesUnit,
    setAmountSalesUnit,
    amountDelivery,
    setAmountDelivery,
    paymentMethod,
    setPaymentMethod,
    methodReceiving,
    setMethodReceiving,
    shippingAddress,
    setShippingAddress,
    deliveryAddress,
    setDeliveryAddress,
    ossig,
    setOssig,
    deliveryDate,
    setDeliveryDate,
    deliveryTime,
    setDeliveryTime,
    notes,
    setNotes,
    calculatedData,
  };
}
