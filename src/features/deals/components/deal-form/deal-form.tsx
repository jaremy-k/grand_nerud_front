"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
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
          .padStart(2, "0")} ${dealFormData.deliveryTime}`, // TODO: add deadline input
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 relative">
      <PrimaryInformationSection
        formData={formData}
        defaultDeal={defaultDeal}
      />
      <FinancialInformationSection formData={formData} />
      <DeliveryInformationSection formData={formData} />
      <AdditionalInformationSection formData={formData} />
      {dealFormData.serviceId && dealFormData.customerId && (
        <div className="bg-white sticky bottom-0 left-0 right-0 border-t py-6">
          <div className="flex w-full justify-between items-end">
            <div className="flex gap-8">
              {dealFormData.serviceId === "687a88dfb6b13b70b6a575f3" && (
                <table className="table text-sm -ml-2 text-slate-700">
                  <tbody>
                    <tr className="group">
                      <td className="py-1.5 px-2.5 group-hover:bg-slate-50 first:rounded-l last:rounded-r">
                        Итоговая сумма закупки:
                      </td>
                      <td className="py-1.5 px-2.5 group-hover:bg-slate-50 first:rounded-l last:rounded-r font-medium text-slate-900">
                        {formatCurrency(
                          formData.calculatedData.amountPurchaseTotal
                        )}
                      </td>
                    </tr>
                    <tr className="group">
                      <td className="py-1.5 px-2.5 group-hover:bg-slate-50 first:rounded-l last:rounded-r">
                        Итоговая сумма продажи:
                      </td>
                      <td className="py-1.5 px-2.5 group-hover:bg-slate-50 first:rounded-l last:rounded-r font-medium text-slate-900">
                        {formatCurrency(
                          formData.calculatedData.amountSalesTotal
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
              <table className="table text-sm -ml-2 text-slate-700">
                <tbody>
                  <tr className="group">
                    <td className="py-1.5 px-2.5 group-hover:bg-slate-50 first:rounded-l last:rounded-r">
                      Маржа фирмы:
                    </td>
                    <td className="py-1.5 px-2.5 group-hover:bg-slate-50 first:rounded-l last:rounded-r font-medium text-slate-900">
                      {formatCurrency(formData.calculatedData.companyProfit)}
                    </td>
                  </tr>
                  <tr className="group">
                    <td className="py-1.5 px-2.5 group-hover:bg-slate-50 first:rounded-l last:rounded-r">
                      Доход менеджера:
                    </td>
                    <td className="py-1.5 px-2.5 group-hover:bg-slate-50 first:rounded-l last:rounded-r font-medium text-slate-900">
                      {formatCurrency(formData.calculatedData.managerProfit)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex flex-row items-end gap-16">
              <div className="flex flex-col text-slate-900">
                <p className="text-lg font-medium leading-[1] text-nowrap">
                  Итоговая сумма:
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  С НДС 20%
                </p>
                <p className="text-2xl font-medium mt-2">
                  {formatCurrency(calculatedData.amountSalesTotal)}
                </p>
              </div>
              <Button
                type="submit"
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
      )}
    </form>
  );
}
