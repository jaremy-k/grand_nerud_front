"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dealsService } from "@/services";
import { DealDto } from "@definitions/dto";
import { CreateDealRequest } from "@definitions/requests";
import { useDataFormHook } from "@features/deals/hooks/deal-form";
import { BanknoteIcon } from "lucide-react";
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      <PrimaryInformationSection
        formData={formData}
        defaultDeal={defaultDeal}
      />
      <FinancialInformationSection formData={formData} />
      <DeliveryInformationSection formData={formData} />
      <AdditionalInformationSection formData={formData} />
      {dealFormData.serviceId && dealFormData.customerId && (
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BanknoteIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Итог по сделке</CardTitle>
                <CardDescription>
                  Проверьте суммы и нажмите кнопку для сохранения
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {dealFormData.paymentMethod === "безналичный расчет" && (
              <div className="flex flex-col gap-2 rounded-lg border bg-background/60 p-4">
                <p className="text-sm text-muted-foreground">
                  Сумма без НДС:{" "}
                  <span className="font-semibold text-foreground">
                    {totalAmountWithoutTax.toFixed(2)} ₽
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  НДС ({taxPercent * 100}%):{" "}
                  <span className="font-semibold text-foreground">
                    {calculatedData.taxAmount} ₽
                  </span>
                </p>
              </div>
            )}
            <p className="text-2xl font-semibold tracking-tight">
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
          </CardContent>
        </Card>
      )}
    </form>
  );
}
