"use client";

import { Page } from "@/components/blocks";
import { actualProfitCalculator } from "@/lib/calculators";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableRow,
} from "@/components/ui/table";
import useAuthContext from "@/contexts/auth-context";
import { formatCurrency, formatINN } from "@/lib/formatters";
import { capitalizeFirstLetter } from "@/lib/typography";
import {
  getStageBadgeClass,
  getStageDotClass,
} from "@features/deals/utils/stage-colors";
import { companiesService, dealsService } from "@/services";
import { CompanyDto, DealDto } from "@definitions/dto";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DealDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuthContext();
  const [deal, setDeal] = useState<DealDto | null>(null);
  const [customer, setCustomer] = useState<CompanyDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = async () => {
    if (!deal) return;
    await dealsService.deleteDeal(deal._id);
    router.replace("/deals");
  };

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    dealsService
      .getDeal(id as string)
      .then((res) => {
        setDeal(res);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load deal")
      )
      .then(() => setLoading(false));
  }, [id, user]);

  useEffect(() => {
    if (deal)
      companiesService
        .getCompany(deal.customerId)
        .then((data) => setCustomer(data));
  }, [deal]);

  if (loading) {
    return <div className="text-center py-10">Загрузка данных сделки...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!deal) {
    return <div className="text-center py-10">Сделка не найдена</div>;
  }

  const deliveredItems =
    deal.deliveredQuantity?.map((dq) => ({
      quantity: dq.quantity || 0,
      amountPurchase: dq.amountPurchase,
    })) ?? [];
  const totalDelivered = deliveredItems.reduce((s, d) => s + d.quantity, 0);
  const actualProfit =
    totalDelivered > 0 && deal.quantity > 0
      ? actualProfitCalculator(
          deliveredItems,
          deal.quantity,
          deal.amountPurchaseUnit ?? 0,
          deal.amountSalesUnit ?? 0,
          deal.amountDelivery ?? 0,
          (deal.addExpenses ?? []).map((e) => ({
            name: e.name,
            amount: String(e.amount),
          }))
        )
      : null;

  return (
    <Page
      breadcrumbLinks={[
        {
          label: "Сделки",
          href: "/deals",
        },
        {
          label: `Сделка #${deal._id}`,
          href: `/deals/${deal._id}`,
        },
      ]}
    >
      {actualProfit && (
        <div className="mb-6 flex justify-end">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-muted-foreground">
                  Предполагаемая прибыль
                </p>
                <p className="text-lg font-semibold tabular-nums text-primary">
                  {formatCurrency(deal.companyProfit ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Фактическая прибыль
                </p>
                <p className="text-lg font-semibold tabular-nums">
                  {formatCurrency(actualProfit.actualCompanyProfit)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Доставлено: {totalDelivered.toLocaleString("ru-RU")}{" "}
                  {deal.unitMeasurement === "тонна"
                    ? "тонн"
                    : deal.unitMeasurement === "куб.м"
                      ? "куб.м"
                      : "ед."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <Table>
        <TableBody>
          <TableRow>
            <TableCell
              className="font-medium text-lg pointer-events-none"
              colSpan={2}
            >
              Основная информация
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3">Клиент</TableCell>
            <TableCell>{customer?.name}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3">ИНН</TableCell>
            <TableCell>{formatINN(customer?.inn || "")}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3">Тип услуги</TableCell>
            <TableCell>
              {deal.service
                ? capitalizeFirstLetter(deal.service.name)
                : "Не указано"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3">Статус</TableCell>
            <TableCell>
              {deal.stage ? (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStageBadgeClass(deal.stage._id)}`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${getStageDotClass(deal.stage._id)}`}
                  />
                  {capitalizeFirstLetter(deal.stage.name)}
                </span>
              ) : (
                "Не указано"
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3">Менеджер</TableCell>
            <TableCell>
              {capitalizeFirstLetter(deal.user?.name || "Не указано")}{" "}
              {deal.user?.email}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3">Дата создания</TableCell>
            <TableCell>
              {new Date(deal.createdAt).toLocaleString("ru-RU")}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell
              className="font-medium text-lg pointer-events-none"
              colSpan={2}
            >
              Финансовая информация
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3">Сумма от клиента</TableCell>
            <TableCell>{formatCurrency(deal.amountSalesTotal)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3">Сумма закупки</TableCell>
            <TableCell>{formatCurrency(deal.amountPurchaseTotal)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3">Маржа</TableCell>
            <TableCell>{formatCurrency(deal.companyProfit)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3">
              Оплата перевозщику
            </TableCell>
            <TableCell>{formatCurrency(deal.amountDelivery)}</TableCell>
          </TableRow>
          {deal.ndsAmount > 0 && (
            <TableRow>
              <TableCell className="font-medium w-1/3">НДС</TableCell>
              <TableCell>{formatCurrency(deal.ndsAmount)}</TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="w-1/3">
              Итого
              {deal.paymentMethod === "безналичный расчет"
                ? ` с учетом НДС ${Math.round((deal.ndsPercent ?? 0.22) * 100)}%`
                : ""}
            </TableCell>
            <TableCell>{formatCurrency(deal.totalAmount)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell
              className="font-medium text-lg pointer-events-none"
              colSpan={2}
            >
              Дополнительная информация
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3">Способ оплаты</TableCell>
            <TableCell>{capitalizeFirstLetter(deal.paymentMethod)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3">
              Способ получения
            </TableCell>
            <TableCell>{capitalizeFirstLetter(deal.methodReceiving)}</TableCell>
          </TableRow>
          {deal.deliveredQuantity && deal.deliveredQuantity.length > 0 && (
            <TableRow>
              <TableCell className="font-medium w-1/3">
                Доставленные количества
              </TableCell>
              <TableCell>
                <div className="flex flex-col w-full max-w-sm gap-2">
                  {deal.deliveredQuantity.map((dq, idx) => (
                    <div
                      key={`delivered-quantity-${idx}`}
                      className="inline-flex justify-between items-center w-full border-b last:border-0 py-1 gap-2"
                    >
                      <span>
                        {dq.quantity} {dq.unit}
                      </span>
                      {dq.amountPurchase != null && (
                        <span className="text-muted-foreground">
                          Закупка: {formatCurrency(dq.amountPurchase)}
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        {dq.date
                          ? new Date(dq.date.split(" ")[0]).toLocaleDateString(
                              "ru-RU"
                            )
                          : "Не указано"}
                      </span>
                    </div>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell className="font-medium w-1/3">ОССиГ</TableCell>
            <TableCell>{deal.OSSIG ? "Да" : "Нет"}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3">Примечания</TableCell>
            <TableCell>{deal.notes || "Нет примечаний"}</TableCell>
          </TableRow>
          {deal.addExpenses && deal.addExpenses.length > 0 && (
            <TableRow>
              <TableCell className="font-medium w-1/3">
                Дополнительные расходы
              </TableCell>
              <TableCell>
                <div className="flex flex-col w-full max-w-sm">
                  {deal.addExpenses.map((el, idx) => (
                    <div
                      key={`extra-expenses-${idx}`}
                      className="inline-flex justify-between w-full border-b last:border-0 py-1"
                    >
                      <div>{el.name}</div>
                      <div>{formatCurrency(el.amount)}</div>
                    </div>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="inline-flex gap-2.5 mt-6">
        <AlertDialog open={deleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Вы точно хотите удалить сделку?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Сделка #{deal._id} будет удалена навсегда. Вы уверены в своем
                решении?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteOpen(false)}>
                Отменить
              </AlertDialogCancel>
              <Button variant="destructive" onClick={handleDelete}>
                Удалить
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          Удалить
        </Button>
        <Button onClick={() => router.push(`/deals/${deal._id}/edit`)}>
          Редактировать
        </Button>
      </div>
    </Page>
  );
}
