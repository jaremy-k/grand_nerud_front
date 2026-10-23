"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { isSalesService } from "@/config/services";
import { dealsService } from "@/services";
import { convertLead, getLead } from "@/services/leads";
import type LeadDto from "@/definitions/dto/lead";
import { DealDto } from "@definitions/dto";
import { CreateDealRequest, UpdateDealRequest } from "@definitions/requests";
import {
  formatDeliveredQuantity,
  useDataFormHook,
  DealFormData,
} from "@features/deals/hooks/deal-form";
import { useNavigate } from "react-router-dom";
import { FormEvent, useEffect, useRef, useState } from "react";
import UnsavedChangesGuard from "@/features/crm/unsaved-changes-guard";
import { ChevronDownIcon, ChevronUpIcon, Loader2Icon, RotateCwIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import AdditionalInformationSection from "./additional-information";
import DeliveryInformationSection from "./delivery-information";
import FinancialInformationSection from "./financial-information";
import PrimaryInformationSection from "./primary-information";

export default function DealForm({
  defaultDeal,
  initialProviderId,
  initialCustomerId,
  initialData,
  sourceLead,
}: {
  defaultDeal?: DealDto;
  initialProviderId?: string;
  initialCustomerId?: string;
  initialData?: Partial<DealFormData>;
  sourceLead?: LeadDto;
}) {
  const navigate = useNavigate();
  const formData = useDataFormHook(
    defaultDeal,
    initialProviderId,
    initialCustomerId,
    initialData
  );
  const { dealFormData, calculatedData, taxPercent, managerShare, isDirty, services,
    calculationLoading, calculationError, retryCalculation } =
    formData;
  const [submiting, setSubmiting] = useState(false);
  const [error, setError] = useState<string | null>();
  const [conversionPending, setConversionPending] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const allowNavigation = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const openSavedDeal = (id: string) => {
    if (!mounted.current) return;
    allowNavigation.current = true;
    navigate(`/deals/${id}`);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmiting(true);
    setError(null);

    if (sourceLead && conversionPending) {
      try {
        const converted = await convertLead(sourceLead._id, {});
        openSavedDeal(converted.deal._id);
      } catch (err) { setError(err instanceof Error ? err.message : "Не удалось завершить перевод"); }
      finally { setSubmiting(false); }
      return;
    }

    if (
      !dealFormData.serviceId ||
      !dealFormData.customerId ||
      !dealFormData.providerId ||
      !dealFormData.stageId ||
      !dealFormData.materialId ||
      !dealFormData.shippingAddressId ||
      (dealFormData.methodReceiving === "доставка" &&
        !dealFormData.deliveryAddressId)
    ) {
      setError("необходимо заполнить все обязательные поля");
      setSubmiting(false);
      return;
    }

    try {
      const shared = {
        stageId: dealFormData.stageId,
        materialId: dealFormData.materialId,
        unitMeasurement: dealFormData.unitMeasurement,
        quantity: Number(dealFormData.quantity),
        methodReceiving: dealFormData.methodReceiving,
        paymentMethod: dealFormData.paymentMethod,
        amountPurchaseUnit: Number(dealFormData.amountPurchaseUnit),
        amountSalesUnit: Number(dealFormData.amountSalesUnit),
        amountDelivery: Number(dealFormData.amountDelivery),
        shippingAddressId: dealFormData.shippingAddressId,
        deliveryAddressId: dealFormData.deliveryAddressId || null,
        notes: dealFormData.notes,
        OSSIG: dealFormData.ossig,
        addExpenses: dealFormData.extraExpenses.map((v) => ({
          name: v.name,
          amount: Number(v.amount),
        })),
        deliveredQuantity: formatDeliveredQuantity(
          dealFormData.deliveredQuantity,
          dealFormData.unitMeasurement
        ),
      };

      if (!!defaultDeal && defaultDeal._id) {
        const dataToSend: UpdateDealRequest = {
          ...shared,
          providerId: dealFormData.providerId,
        };
        await dealsService.updateDeal(defaultDeal._id, dataToSend);
        openSavedDeal(defaultDeal._id);
      } else {
        const dataToSend: CreateDealRequest = {
          ...shared,
          serviceId: dealFormData.serviceId,
          customerId: dealFormData.customerId,
          providerId: dealFormData.providerId,
        };
        if (sourceLead) {
          const converted = await convertLead(sourceLead._id, dataToSend);
          openSavedDeal(converted.deal._id);
          return;
        }
        const created = await dealsService.createDeal(dataToSend);
        openSavedDeal(created._id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
      if (sourceLead) {
        try {
          const currentLead = await getLead(sourceLead._id);
          if (currentLead.convertedAt && currentLead.dealId) openSavedDeal(currentLead.dealId);
          else setConversionPending(Boolean(currentLead.conversionPending));
        } catch { /* Keep the original API error visible. */ }
      }
    } finally {
      setSubmiting(false);
    }
  };

  const totalAmountWithoutTax =
    !calculatedData ? 0 : dealFormData.paymentMethod === "безналичный расчет"
      ? calculatedData.amountSalesTotal / (1 + taxPercent)
      : calculatedData.amountSalesTotal;

  const showSalesFields = isSalesService(dealFormData.serviceId, services);

  const showSummary = dealFormData.serviceId && dealFormData.customerId;

  const managerSharePercent = (managerShare * 100).toFixed(0);

  return (
    <form onSubmit={handleSubmit} aria-busy={submiting}>
      <UnsavedChangesGuard when={isDirty} bypass={allowNavigation} />
      <div className="flex justify-end py-3"><Button type="button" variant="outline" size="sm" disabled={submiting} onClick={() => navigate(defaultDeal ? `/deals/${defaultDeal._id}` : "/deals")}>Отмена</Button></div>
      {error && <p className="mb-4 text-sm text-destructive" role="alert">{error}</p>}
      {conversionPending && <div className="mb-4 flex flex-wrap items-center gap-3 border-y py-3"><p className="text-sm">Перевод начат. Завершите его с первоначальными данными.</p><Button type="submit" disabled={submiting}>Завершить перевод</Button></div>}
      <fieldset disabled={submiting} className="min-w-0 xl:grid xl:grid-cols-[1fr_320px] xl:gap-8 xl:items-start">
        <div className={cn("min-w-0 space-y-6 xl:pb-0", summaryExpanded ? "pb-[70dvh]" : "pb-[200px]")}>
          <PrimaryInformationSection
            formData={formData}
            defaultDeal={defaultDeal}
          />
          <FinancialInformationSection formData={formData} />
          <DeliveryInformationSection formData={formData} />
          <AdditionalInformationSection formData={formData} />
        </div>

        {showSummary && (
          <aside className="fixed bottom-0 left-0 right-0 z-10 mt-6 border-t bg-card shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] xl:bottom-auto xl:mt-0 xl:border-t-0 xl:shadow-none xl:sticky xl:top-4">
            <div className="max-h-[70dvh] overflow-y-auto rounded-t-lg border-x border-t border-b-0 bg-card p-4 xl:max-h-none xl:rounded-lg xl:border xl:border-b xl:p-5 xl:shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3 xl:mb-4">
                <div><h3 className="text-sm font-semibold text-muted-foreground">Итог по сделке</h3>
                  {calculatedData && <p className="mt-1 text-base font-semibold tabular-nums xl:hidden">{formatCurrency(calculatedData.totalDeliveredQuantity > 0 ? calculatedData.actualAmountSalesTotal : calculatedData.amountSalesTotal)}</p>}
                </div>
                <Button type="button" variant="ghost" size="icon-sm" className="xl:hidden" aria-label={summaryExpanded ? "Свернуть калькулятор" : "Развернуть калькулятор"} title={summaryExpanded ? "Свернуть калькулятор" : "Развернуть калькулятор"} aria-expanded={summaryExpanded} onClick={() => setSummaryExpanded((value) => !value)}>{summaryExpanded ? <ChevronDownIcon /> : <ChevronUpIcon />}</Button>
              </div>
              {calculationLoading && (
                <div className="flex min-h-24 items-center gap-2 text-sm text-muted-foreground" role="status">
                  <Loader2Icon className="size-4 animate-spin" /> Расчёт...
                </div>
              )}
              {calculationError && (
                <div className="space-y-2 py-3 text-sm" role="alert">
                  <p className="text-destructive">Расчёт недоступен. Суммы не подтверждены.</p>
                  <p className="break-words text-muted-foreground">{calculationError}</p>
                  <Button type="button" variant="outline" size="sm" onClick={retryCalculation}>
                    <RotateCwIcon /> Повторить расчёт
                  </Button>
                </div>
              )}
              {calculatedData && <div id="deal-calculator-details" className={cn(!summaryExpanded && "hidden xl:block")}>
              <div className="mb-4 space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">
                    Предполагаемая прибыль
                  </span>
                  <span className="font-semibold tabular-nums text-primary">
                    {formatCurrency(calculatedData.companyProfit)}
                  </span>
                </div>
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">
                    Фактическая прибыль
                  </span>
                  <span className="font-semibold tabular-nums">
                    {calculatedData.totalDeliveredQuantity > 0
                      ? formatCurrency(calculatedData.actualCompanyProfit)
                      : "—"}
                  </span>
                </div>
                {calculatedData.totalDeliveredQuantity > 0 && (
                  <p className="text-xs text-muted-foreground/80">
                    Доставлено: {calculatedData.totalDeliveredQuantity.toLocaleString("ru-RU")}{" "}
                    {dealFormData.unitMeasurement === "тонна"
                      ? "тонн"
                      : dealFormData.unitMeasurement === "куб.м"
                        ? "куб.м"
                        : "ед."}
                  </p>
                )}
              </div>
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
                          Сумма закупки
                        </dt>
                        <dd className="font-medium tabular-nums">
                          {formatCurrency(calculatedData.amountPurchaseTotal)}
                        </dd>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground/80">
                        Закупка × Количество
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
                    Сумма от клиента − Закупка − Доставка − Доп. расходы
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
                    Маржа × {managerSharePercent}%
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
                <div>
                  <div className="flex justify-between gap-2 border-t pt-3">
                    <dt className="font-semibold text-foreground">
                      Итоговая сумма
                    </dt>
                    <dd className="text-lg font-semibold tabular-nums text-primary">
                      {calculatedData.totalDeliveredQuantity > 0
                        ? formatCurrency(calculatedData.actualAmountSalesTotal)
                        : formatCurrency(calculatedData.amountSalesTotal)}
                    </dd>
                  </div>
                  {calculatedData.totalDeliveredQuantity > 0 && (
                    <p className="mt-0.5 text-xs text-muted-foreground/80">
                      По доставленным объёмам
                    </p>
                  )}
                </div>
              </dl>
              </div>}
              <Button
                type="submit"
                size="lg"
                className="mt-4 w-full xl:mt-5"
                disabled={
                  !dealFormData.customerId ||
                  !dealFormData.providerId ||
                  !dealFormData.stageId ||
                  !dealFormData.materialId ||
                  !dealFormData.shippingAddressId ||
                  (dealFormData.methodReceiving === "доставка" &&
                    !dealFormData.deliveryAddressId) ||
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
      </fieldset>
    </form>
  );
}
