import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Page } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useLatestRequest } from "@/hooks/use-latest-request";
import RecordTabs from "@/features/crm/record-tabs";
import { useRecordTab } from "@/features/crm/use-record-tab";
import RequestError from "@/features/crm/request-error";
import CompanySummary from "@/features/crm/company-summary";
import TaskList from "@/features/tasks/components/task-list";
import { addressesService, companiesService, dealsService } from "@/services";
import type { AddressDto, CompanyDto, DealDto } from "@definitions/dto";
import { formatCurrency } from "@/lib/formatters";
import { normalizeMaterialUnit } from "@/lib/company-materials";
import { getStageBadgeClass } from "@features/deals/utils/stage-colors";

const TABS = [ { value: "overview", label: "Обзор" }, { value: "finance", label: "Финансы" },
  { value: "deliveries", label: "Доставленные объёмы" }, { value: "tasks", label: "Задачи" } ] as const;
const loadDeal = (id: string, signal: AbortSignal) => dealsService.getDeal(id, { signal });
const loadCompany = (id: string, signal: AbortSignal) => companiesService.getCompany(id, { signal });
const loadAddress = (id: string) => addressesService.getAddress(id);
const money = (value?: number | null) => value == null ? "Нет данных" : formatCurrency(value);
const quantity = (value?: number | null) => value == null ? "Нет данных" : value.toLocaleString("ru-RU");
const date = (value?: string) => {
  if (!value) return "Не указана";
  const day = new Date(value.split(" ")[0]);
  return Number.isNaN(day.getTime()) ? value : day.toLocaleDateString("ru-RU", { timeZone: "Europe/Moscow" });
};

function Fields({ rows }: { rows: Array<[string, ReactNode]> }) {
  return <dl className="grid gap-3 text-sm">{rows.map(([label, value], index) => <div key={`${label}-${index}`} className="grid gap-1 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-5">
    <dt className="text-muted-foreground">{label}</dt><dd className="min-w-0 whitespace-pre-wrap break-words">{value || "Не указано"}</dd>
  </div>)}</dl>;
}

function CompanyInfo({ id, company }: { id?: string | null; company?: CompanyDto | null }) {
  if (company) return <CompanySummary company={company} linked />;
  if (!id) return <p className="text-sm text-muted-foreground">Не указан</p>;
  return <CompanyFallback key={id} id={id} />;
}
function CompanyFallback({ id }: { id: string }) {
  const request = useLatestRequest(id, loadCompany);
  return request.loading ? <p role="status" className="text-sm text-muted-foreground">Загрузка компании...</p>
    : request.error ? <RequestError error={request.error} onRetry={request.retry} />
      : request.data && <CompanySummary company={request.data} linked />;
}
function AddressInfo({ id, address }: { id?: string | null; address?: AddressDto | null }) {
  if (address) return <span>{address.adressDetail?.address || "Адрес не заполнен"}</span>;
  if (!id) return <span>Не указан</span>;
  return <AddressFallback key={id} id={id} />;
}
function AddressFallback({ id }: { id: string }) {
  const request = useLatestRequest(id, loadAddress);
  return request.loading ? <span>Загрузка адреса...</span> : request.error
    ? <RequestError error={request.error} onRetry={request.retry} /> : <span>{request.data?.adressDetail?.address || "Адрес не заполнен"}</span>;
}

export default function DealDetailPage() {
  const { id = "" } = useParams();
  const request = useLatestRequest(id, loadDeal);
  return <Page breadcrumbLinks={[{ label: "Сделки", href: "/deals" }, { label: "Карточка сделки", href: `/deals/${id}` }]}>
    {request.loading ? <p role="status" className="py-10 text-sm text-muted-foreground">Загрузка сделки...</p>
      : request.error ? <RequestError error={request.error} onRetry={request.retry} />
        : request.data && <DealDetail key={request.data._id} deal={request.data} />}
  </Page>;
}

function DealDetail({ deal }: { deal: DealDto }) {
  const navigate = useNavigate();
  const tab = useRecordTab(TABS);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const remove = async () => {
    setSaving(true); setError("");
    try { await dealsService.deleteDeal(deal._id); navigate("/deals", { replace: true }); }
    catch (err) { setError(err instanceof Error ? err.message : "Не удалось удалить сделку"); }
    finally { setSaving(false); setDeleting(false); }
  };
  const deliveries = deal.deliveredQuantity ?? [];
  const delivered = new Map<string, number>();
  deliveries.forEach((item) => {
    const unit = normalizeMaterialUnit(item.unit || "") || "Без единицы";
    delivered.set(unit, (delivered.get(unit) ?? 0) + item.quantity);
  });
  const unit = normalizeMaterialUnit(deal.unitMeasurement || "");
  const planQuantity = Number.isFinite(deal.quantity) ? deal.quantity : null;
  const comparable = Boolean(unit) && planQuantity != null && [...delivered.keys()].every((value) => value === unit);
  const deliveredInUnit = comparable ? delivered.get(unit) ?? 0 : null;
  return <div className="grid min-w-0 gap-5 py-5">
    <header className="flex min-w-0 flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 space-y-2">
        <h1 className="break-words text-xl font-semibold">{deal.customer?.name || "Сделка"}</h1>
        <p className="break-words text-sm text-muted-foreground">{deal.material?.name || "Материал не указан"} · {quantity(deal.quantity)} {unit}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {deal.stage && <span className={`rounded px-2 py-1 ${getStageBadgeClass(deal.stage._id)}`}>{deal.stage.name}</span>}
          <span className="text-muted-foreground">Создана {date(deal.createdAt)}</span>
          {deal.user?.name && <span className="text-muted-foreground">{deal.user.name}</span>}
        </div>
        <details className="text-xs text-muted-foreground"><summary className="cursor-pointer">ID сделки</summary><p className="break-all pt-1">{deal._id}</p></details>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button asChild size="sm" variant="outline"><Link to={`/deals/${deal._id}/edit`}><PencilIcon />Редактировать</Link></Button>
        <Button size="icon-sm" variant="ghost" title="Удалить сделку" aria-label="Удалить сделку" onClick={() => setDeleting(true)}><Trash2Icon /></Button>
      </div>
    </header>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <RecordTabs tabs={TABS} value={tab.value} onChange={tab.change} label="Разделы сделки">
      {tab.value === "overview" && <div className="grid gap-7">
        <Fields rows={[["Услуга", deal.service?.name], ["Материал", deal.material?.name], ["Объём", `${quantity(deal.quantity)} ${unit}`],
          ["Способ получения", deal.methodReceiving], ["Способ оплаты", deal.paymentMethod], ["ОССиГ", deal.OSSIG ? "Да" : "Нет"],
          ["Комментарий по сделке", deal.notes], ["Исходный лид", deal.sourceLeadId ? <Link to={`/leads/${deal.sourceLeadId}`} className="text-primary hover:underline">Открыть лид</Link> : "Не связан"]]} />
        <div className="grid gap-6 border-t pt-5 lg:grid-cols-2">
          <section className="grid min-w-0 content-start gap-4"><h2 className="text-base font-medium">Заказчик</h2><CompanyInfo id={deal.customerId} company={deal.customer} />
            <div className="space-y-1 text-sm"><p className="text-muted-foreground">Объект</p><AddressInfo id={deal.deliveryAddressId} address={deal.deliveryAddress} /></div>
          </section>
          <section className="grid min-w-0 content-start gap-4 lg:border-l lg:pl-6"><h2 className="text-base font-medium">Исполнитель</h2><CompanyInfo id={deal.providerId} company={deal.provider} />
            <div className="space-y-1 text-sm"><p className="text-muted-foreground">Адрес отгрузки</p><AddressInfo id={deal.shippingAddressId} address={deal.shippingAddress} /></div>
            {deal.providerId && <Link to={`/companies/${deal.providerId}?tab=prices`} className="text-sm text-primary hover:underline">Материалы и цены исполнителя</Link>}
          </section>
        </div>
      </div>}
      {tab.value === "finance" && <div className="grid gap-6">
        <Table><TableHeader><TableRow><TableHead>Показатель</TableHead><TableHead className="text-right">План</TableHead><TableHead className="text-right">По доставленным объёмам</TableHead></TableRow></TableHeader>
          <TableBody>{[["Сумма от клиента", deal.amountSalesTotal, deal.actualAmountSalesTotal], ["Закупка", deal.amountPurchaseTotal, deal.actualAmountPurchaseTotal],
            ["Прибыль компании", deal.companyProfit, deal.actualCompanyProfit]].map(([label, plan, fact]) => <TableRow key={label}>
              <TableCell>{label}</TableCell><TableCell className="text-right tabular-nums">{money(plan as number)}</TableCell>
              <TableCell className="text-right tabular-nums">{deliveries.length ? money(fact as number | undefined) : "Нет поставок"}</TableCell>
            </TableRow>)}</TableBody>
        </Table>
        <Fields rows={[["Цена продажи за единицу", `${money(deal.amountSalesUnit)} / ${unit}`], ["Цена закупки за единицу", `${money(deal.amountPurchaseUnit)} / ${unit}`],
          ["Доставка", money(deal.amountDelivery)], ["НДС", money(deal.ndsAmount)], ["Доход менеджера", money(deal.managerProfit)], ["Итого по расчёту", money(deal.totalAmount)]]} />
        {Boolean(deal.addExpenses?.length) && <section className="grid gap-3 border-t pt-4"><h2 className="text-sm font-medium">Дополнительные расходы</h2><Fields rows={deal.addExpenses.map((item) => [item.name, money(item.amount)])} /></section>}
      </div>}
      {tab.value === "deliveries" && <div className="grid gap-5">
        <Fields rows={[["Плановый объём", `${quantity(deal.quantity)} ${unit}`],
          ["Доставлено", delivered.size ? [...delivered].map(([key, total]) => `${quantity(total)} ${key}`).join("; ") : "Поставок пока нет"],
          ["Остаток", planQuantity == null || !unit ? "Нет данных" : deliveredInUnit == null ? "Разные единицы измерения" : `${quantity(Math.max(0, planQuantity - deliveredInUnit))} ${unit}`],
          ...(deliveredInUnit != null && deliveredInUnit > deal.quantity ? [["Сверх плана", `${quantity(deliveredInUnit - deal.quantity)} ${unit}`] as [string, ReactNode]] : [])]} />
        {deliveries.length ? <Table><TableHeader><TableRow><TableHead>Дата</TableHead><TableHead>Объём</TableHead><TableHead className="text-right">Закупка</TableHead></TableRow></TableHeader>
          <TableBody>{deliveries.map((item, index) => <TableRow key={`${item.date}-${index}`}><TableCell>{date(item.date)}</TableCell><TableCell>{quantity(item.quantity)} {item.unit}</TableCell><TableCell className="text-right tabular-nums">{money(item.amountPurchase)}</TableCell></TableRow>)}</TableBody></Table>
          : <p className="py-5 text-sm text-muted-foreground">Доставленные объёмы ещё не добавлены</p>}
        <Button asChild variant="outline" size="sm" className="justify-self-start"><Link to={`/deals/${deal._id}/edit`}><PencilIcon />Изменить объёмы</Link></Button>
      </div>}
      {tab.value === "tasks" && <TaskList filters={{ dealId: deal._id }} context={{ dealId: deal._id, companyId: deal.customerId, ownerId: deal.userId }} />}
    </RecordTabs>
    <AlertDialog open={deleting} onOpenChange={(open) => !saving && setDeleting(open)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Удалить сделку?</AlertDialogTitle><AlertDialogDescription>Сделка будет удалена из активного списка.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={saving}>Отмена</AlertDialogCancel><Button variant="destructive" disabled={saving} onClick={remove}>{saving ? "Удаление..." : "Удалить"}</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
