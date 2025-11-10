"use client";

import { Page } from "@/components/blocks";
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
              {deal.stage
                ? capitalizeFirstLetter(deal.stage.name)
                : "Не указано"}
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
            <TableCell className="font-medium w-1/3">Сумма закупки</TableCell>
            <TableCell>{formatCurrency(deal.amountPurchaseTotal)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3">Сумма продажи</TableCell>
            <TableCell>{formatCurrency(deal.amountSalesTotal)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3">
              Прибыль компании
            </TableCell>
            <TableCell>{formatCurrency(deal.companyProfit)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium w-1/3">Доставка</TableCell>
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
            <TableCell className="w-1/3">Итого</TableCell>
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
          <TableRow>
            <TableCell className="font-medium w-1/3">Дедлайн</TableCell>
            <TableCell>
              {deal.deadline
                ? new Date(deal.deadline).toLocaleString("ru-RU")
                : "Не указано"}
            </TableCell>
          </TableRow>
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
