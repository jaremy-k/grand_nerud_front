"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { isSalesService } from "@/config/services";
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
  const { dealFormData, calculatedData, taxPercent, isDirty } = formData;
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

  const showSalesFields = isSalesService(dealFormData.serviceId);

  const showSummary =
    dealFormData.serviceId && dealFormData.customerId;

  const managerSharePercent =
    (Number(dealFormData.managerShare) * 100).toFixed(0);
  const extraExpensesSum = dealFormData.extraExpenses.reduce(
    (s, e) => s + Number(e.amount || 0),
    0
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="xl:grid xl:grid-cols-[1fr_320px] xl:gap-8 xl:items-start">
        {/* Основная колонка — поля формы; отступ снизу на мобиле под фиксированную панель */}
        <div className="min-w-0 space-y-6 pb-[380px] xl:pb-0">
          <PrimaryInformationSection
            formData={formData}
            defaultDeal={defaultDeal}
          />
          <FinancialInformationSection formData={formData} />
          <DeliveryInformationSection formData={formData} />
          <AdditionalInformationSection formData={formData} />
        </div>

        {/* Боковая панель — итог по сделке: на мобиле фиксирована внизу, на xl — липкая справа */}
        {showSummary && (
          <aside className="fixed bottom-0 left-0 right-0 z-10 mt-6 border-t bg-card shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] xl:bottom-auto xl:mt-0 xl:border-t-0 xl:shadow-none xl:sticky xl:top-4">
            <div className="max-h-[70dvh] overflow-y-auto rounded-t-xl border-x border-t border-b-0 bg-card p-4 xl:max-h-none xl:rounded-xl xl:border xl:border-b xl:p-5 xl:shadow-sm">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground xl:mb-4">
                Итог по сделке
              </h3>
              <dl className="space-y-3 text-sm">
                {showSalesFields && (
                  <>
                    <div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">
                          Сумма от клиента
                        </dt>
                        <dd className="font-medium tabular-nums">
                          {formatCurrency(calculatedData.amountSalesTotal)}
                        </dd>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground/80">
                        Цена клиента × Количество
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">
                          Сумма у карьера
                        </dt>
                        <dd className="font-medium tabular-nums">
                          {formatCurrency(calculatedData.amountPurchaseTotal)}
                        </dd>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground/80">
                        Цена у карьера × Количество
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Маржа</dt>
                    <dd className="font-medium tabular-nums">
                      {formatCurrency(calculatedData.companyProfit)}
                    </dd>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground/80">
                    Сумма от клиента − Сумма у карьера − Доставка
                  </p>
                </div>
                <div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Доход менеджера</dt>
                    <dd className="font-medium tabular-nums">
                      {formatCurrency(calculatedData.managerProfit)}
                    </dd>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground/80">
                    Маржа × {managerSharePercent}% − Доп. расходы
                    {extraExpensesSum > 0
                      ? ` (${formatCurrency(extraExpensesSum)})`
                      : ""}
                  </p>
                </div>
                {dealFormData.paymentMethod === "безналичный расчет" && (
                  <>
                    <div>
                      <div className="flex justify-between gap-2 border-t pt-3">
                        <dt className="text-muted-foreground">Без НДС</dt>
                        <dd className="font-medium tabular-nums">
                          {formatCurrency(totalAmountWithoutTax)}
                        </dd>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground/80">
                        Сумма от клиента ÷ (1 + НДС {taxPercent * 100}%)
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">
                          НДС {taxPercent * 100}%
                        </dt>
                        <dd className="font-medium tabular-nums">
                          {formatCurrency(calculatedData.taxAmount)}
                        </dd>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground/80">
                        (Сумма от клиента ÷ (1 + НДС)) × НДС
                      </p>
                    </div>
                  </>
                )}
                <div className="flex justify-between gap-2 border-t pt-3">
                  <dt className="font-semibold text-foreground">
                    Итоговая сумма
                  </dt>
                  <dd className="text-lg font-semibold tabular-nums text-primary">
                    {formatCurrency(calculatedData.amountSalesTotal)}
                  </dd>
                </div>
              </dl>
              <Button
                type="submit"
                size="lg"
                className="mt-4 w-full xl:mt-5"
                disabled={
                  !dealFormData.customerId ||
                  !dealFormData.stageId ||
                  !dealFormData.materialId ||
                  !dealFormData.serviceId ||
                  submiting ||
                  (!!defaultDeal && !isDirty)
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
