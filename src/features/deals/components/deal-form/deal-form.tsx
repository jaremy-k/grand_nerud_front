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
        notes: dealFormData.notes,
        OSSIG: dealFormData.ossig,
        addExpenses: dealFormData.extraExpenses.map((v) => ({
          name: v.name,
          amount: Number(v.amount),
        })),
        deliveredQuantity: dealFormData.deliveredQuantity
          .filter((dq) => dq.date && dq.quantity)
          .map((dq) => ({
            quantity: Number(dq.quantity),
            unit: dealFormData.unitMeasurement,
            date: `${dq.date!.getFullYear()}-${(dq.date!.getMonth() + 1)
              .toString()
              .padStart(2, "0")}-${dq.date!.getDate().toString().padStart(2, "0")} 00:00`,
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

  const showSummary =
    dealFormData.serviceId && dealFormData.customerId;

  return (
    <form onSubmit={handleSubmit}>
      <div className="xl:grid xl:grid-cols-[1fr_320px] xl:gap-8 xl:items-start">
        {/* Основная колонка — поля формы */}
        <div className="min-w-0 space-y-6">
          <PrimaryInformationSection
            formData={formData}
            defaultDeal={defaultDeal}
          />
          <FinancialInformationSection formData={formData} />
          <DeliveryInformationSection formData={formData} />
          <AdditionalInformationSection formData={formData} />
        </div>

        {/* Боковая панель — итог по сделке (липкая на десктопе) */}
        {showSummary && (
          <aside className="mt-6 xl:mt-0 xl:sticky xl:top-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Итог по сделке
              </h3>
              <dl className="space-y-3 text-sm">
                {isSalesService && (
                  <>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">
                        Сумма закупки
                      </dt>
                      <dd className="font-medium tabular-nums">
                        {calculatedData.amountPurchaseTotal} ₽
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">
                        Сумма продажи
                      </dt>
                      <dd className="font-medium tabular-nums">
                        {calculatedData.amountSalesTotal} ₽
                      </dd>
                    </div>
                  </>
                )}
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Маржа фирмы</dt>
                  <dd className="font-medium tabular-nums">
                    {calculatedData.companyProfit} ₽
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Доход менеджера</dt>
                  <dd className="font-medium tabular-nums">
                    {calculatedData.managerProfit} ₽
                  </dd>
                </div>
                {dealFormData.paymentMethod === "безналичный расчет" && (
                  <>
                    <div className="flex justify-between gap-2 border-t pt-3">
                      <dt className="text-muted-foreground">Без НДС</dt>
                      <dd className="font-medium tabular-nums">
                        {totalAmountWithoutTax.toFixed(2)} ₽
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">
                        НДС {taxPercent * 100}%
                      </dt>
                      <dd className="font-medium tabular-nums">
                        {calculatedData.taxAmount} ₽
                      </dd>
                    </div>
                  </>
                )}
                <div className="flex justify-between gap-2 border-t pt-3">
                  <dt className="font-semibold text-foreground">
                    Итоговая сумма
                  </dt>
                  <dd className="text-lg font-semibold tabular-nums text-primary">
                    {calculatedData.amountSalesTotal} ₽
                  </dd>
                </div>
              </dl>
              <Button
                type="submit"
                size="lg"
                className="mt-5 w-full"
                disabled={
                    !dealFormData.customerId ||
                    !dealFormData.stageId ||
                    !dealFormData.materialId ||
                    !dealFormData.serviceId ||
                    submiting
                  }
              >
                {defaultDeal ? "Обновить сделку" : "Создать сделку"}
              </Button>
            </div>
          </aside>
        )}
      </div>
    </form>
  );
}
