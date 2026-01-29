"use client";

import { Button } from "@/components/ui/button";
import { dealsService } from "@/services";
import { DealDto } from "@definitions/dto";
import { CreateDealRequest } from "@definitions/requests";
import { useDataFormHook } from "@features/deals/hooks/deal-form";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import AdditionalInformationSection from "./additional-information";
import DeliveryInformationSection from "./delivery-information";
import FinancialInformationSection from "./financial-information";
import PrimaryInformationSection from "./primary-information";

export default function DealForm({ defaultDeal }: { defaultDeal?: DealDto }) {
  const router = useRouter();
  const formData = useDataFormHook(defaultDeal);
  const { dealFormData, calculatedData, taxPercent } = formData;
  const [submiting, setSubmiting] = useState(false);
  const [error, setError] = useState<string | null>(); //eslint-disable-line @typescript-eslint/no-unused-vars

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmiting(true);
    setError(null);

    if (
      !dealFormData.serviceId ||
      !dealFormData.customerId ||
      !dealFormData.stageId ||
      !dealFormData.materialId
    ) {
      setError("необходимо заполнить все обязательные поля");
      setSubmiting(false);
      return;
    }

    try {
      const dataToSend: CreateDealRequest = {
        serviceId: dealFormData.serviceId,
        customerId: dealFormData.customerId,
        stageId: dealFormData.stageId,
        materialId: dealFormData.materialId,
        unitMeasurement: dealFormData.unitMeasurement,
        quantity: Number(dealFormData.quantity),
        methodReceiving: dealFormData.methodReceiving,
        paymentMethod: dealFormData.paymentMethod,

        amountPurchaseUnit: Number(dealFormData.amountPurchaseUnit),
        amountPurchaseTotal: calculatedData.amountPurchaseTotal,
        amountSalesUnit: Number(dealFormData.amountSalesUnit),
        amountSalesTotal: calculatedData.amountSalesTotal,
        amountDelivery: Number(dealFormData.amountDelivery),
        companyProfit: calculatedData.companyProfit,
        totalAmount: calculatedData.amountSalesTotal,
        managerProfit: calculatedData.managerProfit,
        ndsAmount: calculatedData.taxAmount,
        ndsPercent: taxPercent,

        shippingAddress: dealFormData.shippingAddress,
        deliveryAddress: dealFormData.deliveryAddress,
        deadline: `${dealFormData.deliveryDate?.getFullYear()}-${(
          (dealFormData.deliveryDate?.getMonth() || 0) + 1
        )
          .toString()
          .padStart(2, "0")}-${dealFormData.deliveryDate
          ?.getDate()
          .toString()
          .padStart(2, "0")} ${dealFormData.deliveryTime}`,
        notes: dealFormData.notes,
        OSSIG: dealFormData.ossig,
        addExpenses: dealFormData.extraExpenses.map((v) => ({
          name: v.name,
          amount: Number(v.amount),
        })),
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

  const totalAmountWithoutTax =
    dealFormData.paymentMethod === "безналичный расчет"
      ? calculatedData.amountSalesTotal / (1 + taxPercent)
      : calculatedData.amountSalesTotal;

  const isSalesService =
    dealFormData.serviceId === "687a88dfb6b13b70b6a575f3";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10 pb-[280px]">
      <PrimaryInformationSection
        formData={formData}
        defaultDeal={defaultDeal}
      />
      <FinancialInformationSection formData={formData} />
      <DeliveryInformationSection formData={formData} />
      <AdditionalInformationSection formData={formData} />
      {dealFormData.serviceId && dealFormData.customerId && (
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-card shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                {isSalesService && (
                  <>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground">
                        Итоговая сумма закупки:
                      </span>
                      <span className="font-medium">
                        {calculatedData.amountPurchaseTotal} ₽
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground">
                        Итоговая сумма продажи:
                      </span>
                      <span className="font-medium">
                        {calculatedData.amountSalesTotal} ₽
                      </span>
                    </div>
                  </>
                )}
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Маржа фирмы:</span>
                  <span className="font-medium">
                    {calculatedData.companyProfit} ₽
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground">
                    Доход менеджера:
                  </span>
                  <span className="font-medium">
                    {calculatedData.managerProfit} ₽
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:items-end">
                {dealFormData.paymentMethod === "безналичный расчет" && (
                  <div className="flex flex-col gap-0.5 text-right text-sm">
                    <p className="text-muted-foreground">
                      Сумма без НДС:{" "}
                      <span className="font-semibold text-foreground">
                        {totalAmountWithoutTax.toFixed(2)} ₽
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      НДС ({taxPercent * 100}%):{" "}
                      <span className="font-semibold text-foreground">
                        {calculatedData.taxAmount} ₽
                      </span>
                    </p>
                  </div>
                )}
                <p className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Итоговая сумма:{" "}
                  <span className="text-primary">
                    {calculatedData.amountSalesTotal} ₽
                  </span>
                </p>
                <Button
                  type="submit"
                  size="lg"
                  className="min-w-[200px]"
                  disabled={
                    !dealFormData.customerId ||
                    !dealFormData.stageId ||
                    !dealFormData.materialId ||
                    !dealFormData.serviceId ||
                    !dealFormData.deliveryDate ||
                    !dealFormData.deliveryTime ||
                    submiting
                  }
                >
                  {defaultDeal ? "Обновить сделку" : "Создать сделку"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
