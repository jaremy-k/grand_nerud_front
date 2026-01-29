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
import { BanknoteIcon } from "lucide-react";
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
        quantity: Number(formData.quantity),
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
        ndsAmount: formData.calculatedData.taxAmount,
        ndsPercent: formData.taxPercent,

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
        addExpenses: formData.extraExpenses.map((v) => ({
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      <PrimaryInformationSection
        formData={formData}
        defaultDeal={defaultDeal}
      />
      <FinancialInformationSection formData={formData} />
      <DeliveryInformationSection formData={formData} />
      <AdditionalInformationSection formData={formData} />
      {!!formData.serviceId && !!formData.customerId && (
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
            {formData.paymentMethod === "безналичный расчет" && (
              <div className="flex flex-col gap-2 rounded-lg border bg-background/60 p-4">
                <p className="text-sm text-muted-foreground">
                  Сумма без НДС:{" "}
                  <span className="font-semibold text-foreground">
                    {formData.calculatedData.totalAmountWithoutTax} ₽
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  НДС ({formData.taxPercent * 100}%):{" "}
                  <span className="font-semibold text-foreground">
                    {formData.calculatedData.taxAmount} ₽
                  </span>
                </p>
              </div>
            )}
            <p className="text-2xl font-semibold tracking-tight">
              Итоговая сумма:{" "}
              <span className="text-primary">
                {formData.calculatedData.totalAmount} ₽
              </span>
            </p>
            <Button
              type="submit"
              size="lg"
              className="min-w-[200px]"
              disabled={
                !formData.customerId ||
                !formData.stageId ||
                !formData.materialId ||
                !formData.serviceId ||
                !formData.deliveryDate ||
                !formData.deliveryTime ||
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
