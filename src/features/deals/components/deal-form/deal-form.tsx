"use client";

import { Button } from "@/components/ui/button";
import { dealsService } from "@/services";
import { DealDto } from "@definitions/dto";
import { CreateDealRequest } from "@definitions/requests";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import AdditionalInformationSection from "./additional-information";
import { useDataFormHook } from "./data-form-hook";
import DeliveryInformationSection from "./delivery-information";
import FinancialInformationSection from "./financial-information";
import PrimaryInformationSection from "./primary-information";

export default function DealForm({ defaultDeal }: { defaultDeal?: DealDto }) {
  const router = useRouter();
  const formData = useDataFormHook(defaultDeal);
  const [submiting, setSubmiting] = useState(false);
  const [error, setError] = useState<string | null>(); //eslint-disable-line @typescript-eslint/no-unused-vars

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmiting(true);
    setError(null);

    if (
      !formData.serviceId ||
      !formData.customerId ||
      !formData.stageId ||
      !formData.materialId
    ) {
      setError("необходимо заполнить все обязательные поля");
      setSubmiting(false);
      return;
    }

    try {
      const dataToSend: CreateDealRequest = {
        serviceId: formData.serviceId!,
        customerId: formData.customerId!,
        stageId: formData.stageId!,
        materialId: formData.materialId!,
        unitMeasurement: formData.unitMeasurement,
        quantity: formData.quantity,
        methodReceiving: formData.methodReceiving,
        paymentMethod: formData.paymentMethod,

        amountPurchaseUnit: Number(formData.amountPurchaseUnit),
        amountPurchaseTotal: formData.calculatedData.amountPurchaseTotal,
        amountSalesUnit: Number(formData.amountSalesUnit),
        amountSalesTotal: formData.calculatedData.amountSalesTotal,
        amountDelivery: Number(formData.amountDelivery),
        companyProfit: formData.calculatedData.companyProfit,
        totalAmount: formData.calculatedData.totalAmount,
        managerProfit: formData.calculatedData.managerProfit,

        shippingAddress: formData.shippingAddress,
        deliveryAddress: formData.deliveryAddress,
        deadline: `${formData.deliveryDate?.getFullYear()}-${(
          (formData.deliveryDate?.getMonth() || 0) + 1
        )
          .toString()
          .padStart(2, "0")}-${formData.deliveryDate
          ?.getDate()
          .toString()
          .padStart(2, "0")} ${formData.deliveryTime}`, // TODO: add deadline input
        notes: formData.notes,
        OSSIG: formData.ossig,
      };

      if (!!defaultDeal && defaultDeal._id) {
        await dealsService.updateDeal(defaultDeal._id, dataToSend);
      } else {
        await dealsService.createDeal(dataToSend);
      }
      router.push("/deals");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setSubmiting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <PrimaryInformationSection
        formData={formData}
        defaultDeal={defaultDeal}
      />
      <FinancialInformationSection formData={formData} />
      <DeliveryInformationSection formData={formData} />
      <AdditionalInformationSection formData={formData} />
      {!!formData.serviceId && !!formData.customerId && (
        <div className="flex flex-col gap-4">
          <p className="text-xl text-slate-800">
            <span className="font-light text-slate-600">Итоговая сумма:</span>{" "}
            {formData.calculatedData.totalAmount} ₽
          </p>
          <div className="inline-flex gap-4">
            <Button
              type="submit"
              disabled={
                !formData.customerId ||
                !formData.stageId ||
                !formData.materialId ||
                !formData.serviceId ||
                submiting
              }
            >
              {defaultDeal ? "Обновить сделку" : "Создать сделку"}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
