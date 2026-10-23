import { useMemo, useState } from "react";
import { Pagination } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLatestRequest } from "@/hooks/use-latest-request";
import { cancelDealOperation, getDealOperations } from "@/services/deal-operations";
import type { DealDto } from "@definitions/dto";
import type { DealPayment, DealShipment, OperationHistory, OperationResource, OperationSummary } from "@/definitions/dto/deal-operations";
import { formatCurrency } from "@/lib/formatters";
import RequestError from "@/features/crm/request-error";
import { CheckIcon, CircleSlashIcon, PencilIcon, PlusIcon, RotateCwIcon } from "lucide-react";
import OperationForm from "./operation-form";
import { operationDate, PAYMENT_KINDS, todayMoscow } from "@features/deals/utils/operations";

const load = (key: { id: string; page: number }, signal: AbortSignal) => getDealOperations(key.id, key.page, { signal });
const money = (value: number | null) => value == null ? "Нет данных" : formatCurrency(value);
const count = (value: number | null, unit: string) => value == null ? "Нет данных" : `${value.toLocaleString("ru-RU")} ${unit}`;
const labels: Record<string, string> = { planned: "Запланировано", paid: "Оплачено", delivered: "Поставлено", cancelled: "Отменено" };

function Metrics({ summary, payment }: { summary: OperationSummary; payment: boolean }) {
  const rows = payment ? [["Сумма сделки", money(summary.customerAmount)], ["Получено от заказчика", money(summary.customerPaid)], ["Осталось получить", money(summary.customerDebt)],
    ["Исполнителю оплачено", money(summary.providerPaid)], ["Осталось за материал", money(summary.providerDebt)], ["Оплачено за доставку", money(summary.deliveryPaid)],
    ["Прочие выплаты", money(summary.otherPaid)], ["Движение средств, нетто", money(summary.cashBalance)],
    ...(summary.customerOverpayment ? [["Переплата заказчика", money(summary.customerOverpayment)]] : []),
    ...(summary.providerOverpayment ? [["Переплата исполнителю", money(summary.providerOverpayment)]] : [])]
    : [["Заказано", count(summary.orderedQuantity, summary.unit)], ["Подтверждено", count(summary.deliveredQuantity, summary.unit)], ["В плане поставок", count(summary.plannedQuantity, summary.unit)],
      ["Осталось поставить", count(summary.remainingQuantity, summary.unit)], ["Не запланировано", count(summary.unplannedQuantity, summary.unit)], ["Исполнено", summary.progress == null ? "Нет данных" : `${summary.progress}%`],
      ...(summary.overDeliveredQuantity ? [["Сверх плана", count(summary.overDeliveredQuantity, summary.unit)]] : [])];
  return <dl className="grid min-w-0 gap-x-5 gap-y-4 border-y py-4 sm:grid-cols-2 lg:grid-cols-4">{rows.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-base font-medium tabular-nums">{value}</dd></div>)}</dl>;
}

function History({ rows }: { rows: OperationHistory[] }) {
  const fieldLabels: Record<string, string> = { status: "Статус", kind: "Направление", amount: "Сумма", quantity: "Объём", unit: "Единица", dueDate: "Плановая дата", plannedDate: "Плановая дата", actualDate: "Фактическая дата",
    reference: "Документ", comment: "Комментарий", notes: "Комментарий сделки", amountPurchase: "Закупка", deliveryCost: "Доставка", cancelReason: "Причина отмены", amountSalesUnit: "Цена продажи", amountPurchaseUnit: "Цена закупки", amountDelivery: "Доставка сделки", unitMeasurement: "Единица сделки", shippingAddressText: "Адрес погрузки", deliveryAddressText: "Адрес разгрузки" };
  const display = (field: string, value: unknown) => value == null ? "Не указано" : typeof value === "object" ? JSON.stringify(value) : field === "status" ? labels[String(value)] ?? String(value) : field === "kind" ? PAYMENT_KINDS[value as keyof typeof PAYMENT_KINDS] ?? String(value) : String(value);
  return rows.length ? <Table><TableHeader><TableRow><TableHead>Дата</TableHead><TableHead>Операция</TableHead><TableHead>Сотрудник</TableHead><TableHead>Изменения</TableHead></TableRow></TableHeader><TableBody>{rows.map((row) => <TableRow key={row._id}>
    <TableCell className="whitespace-nowrap align-top">{new Date(row.at).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}</TableCell>
    <TableCell className="align-top">{row.kind === "payments" ? "Платёж" : row.kind === "shipments" ? "Поставка" : "Сделка"}<p className="text-xs text-muted-foreground">{row.action === "created" ? "Добавлено" : row.action === "cancelled" ? "Отменено" : "Изменено"}</p></TableCell>
    <TableCell className="align-top">{row.actorName}</TableCell><TableCell className="min-w-56 max-w-md whitespace-normal align-top"><details><summary className="cursor-pointer text-sm">Изменения</summary><dl className="mt-2 grid gap-2 text-xs">
      {Object.entries(row.after ?? {}).filter(([field, value]) => fieldLabels[field] && JSON.stringify(row.before?.[field]) !== JSON.stringify(value)).map(([field, value]) => <div key={field}><dt className="text-muted-foreground">{fieldLabels[field]}</dt><dd className="break-words">{row.before && <span>{display(field, row.before[field])} → </span>}{display(field, value)}</dd></div>)}
    </dl></details>{row.reason && <p className="mt-2 break-words text-xs">{row.reason}</p>}</TableCell>
  </TableRow>)}</TableBody></Table> : <p className="py-6 text-sm text-muted-foreground">Изменений операций пока нет</p>;
}

export default function DealOperations({ deal, resource, onChanged }: { deal: DealDto; resource: OperationResource | "history"; onChanged: () => void }) {
  const [page, setPage] = useState(1);
  const key = useMemo(() => ({ id: deal._id, page }), [deal._id, page]);
  const request = useLatestRequest(key, load);
  const [filter, setFilter] = useState("active");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<{ entry?: DealPayment | DealShipment; confirm?: boolean } | null>(null);
  const [cancelling, setCancelling] = useState<DealPayment | DealShipment | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const payment = resource === "payments";
  const data = request.data;
  const rows = data && resource !== "history" ? data[resource].filter((row) => (filter === "all" || (filter === "active" ? row.status !== "cancelled" : row.status === filter))
    && (!search.trim() || [row.comment, "reference" in row ? row.reference : "", "kind" in row ? PAYMENT_KINDS[row.kind] : "", row.cancelReason].some((value) => value?.toLowerCase().includes(search.trim().toLowerCase())))) : [];
  const cancel = async () => {
    if (!cancelling || !data || resource === "history") return;
    if (reason.trim().length < 3) { setError("Укажите причину отмены, не менее трёх символов"); return; }
    setSaving(true); setError("");
    try { await cancelDealOperation(deal._id, resource, cancelling._id, data.revision, reason.trim()); setCancelling(null); onChanged(); }
    catch (err) { setError(err instanceof Error ? err.message : "Не удалось отменить операцию"); }
    finally { setSaving(false); }
  };
  const actions = (row: DealPayment | DealShipment) => row.status !== "cancelled" && <div className="flex items-center justify-end gap-1">
    {row.status === "planned" && <Button type="button" variant="ghost" size="icon-sm" title={payment ? "Учесть платёж" : "Подтвердить поставку"} aria-label={payment ? "Учесть платёж" : "Подтвердить поставку"} onClick={() => setEditing({ entry: row, confirm: true })}><CheckIcon /></Button>}
    <Button type="button" variant="ghost" size="icon-sm" title="Изменить операцию" aria-label="Изменить операцию" onClick={() => setEditing({ entry: row })}><PencilIcon /></Button>
    <Button type="button" variant="ghost" size="icon-sm" title="Отменить запись" aria-label="Отменить запись" onClick={() => { setCancelling(row); setReason(""); setError(""); }}><CircleSlashIcon /></Button>
  </div>;
  return <div className="grid min-w-0 gap-5">
    {request.loading ? <p role="status" className="py-6 text-sm text-muted-foreground">Загрузка операций...</p> : request.error ? <RequestError error={request.error} onRetry={request.retry} /> : data && <>
      {resource === "history" ? <><p className="text-sm text-muted-foreground">Изменений: {data.history.total}</p><History rows={data.history.items} /><Pagination total={data.history.totalPages} current={page} onClick={setPage} /></> : <>
        <Metrics summary={data.summary} payment={payment} />
        {data.summary.warning && <p role="alert" className="text-sm text-destructive">{data.summary.warning}</p>}
        {(payment ? data.summary.overduePayments : data.summary.overdueShipments) > 0 && <p className="text-sm text-red-700">Просрочено: {payment ? data.summary.overduePayments : data.summary.overdueShipments}</p>}
        <div className="flex min-w-0 flex-wrap items-center gap-3"><Button type="button" onClick={() => setEditing({})}><PlusIcon />{payment ? "Добавить платёж" : "Добавить поставку"}</Button>
          <Input aria-label="Поиск операций" className="min-w-0 flex-1 basis-48" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Комментарий или документ" />
          <Select value={filter} onValueChange={setFilter}><SelectTrigger aria-label="Статус операций" className="w-48"><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="active">Действующие</SelectItem><SelectItem value="all">Все записи</SelectItem><SelectItem value="planned">Запланированные</SelectItem><SelectItem value={payment ? "paid" : "delivered"}>{payment ? "Оплаченные" : "Поставленные"}</SelectItem><SelectItem value="cancelled">Отменённые</SelectItem>
          </SelectContent></Select><Button type="button" size="icon-sm" variant="ghost" title="Обновить операции" aria-label="Обновить операции" onClick={request.retry}><RotateCwIcon /></Button>
        </div>
        <p className="text-xs text-muted-foreground">Записей: {rows.length}</p>
        {rows.length ? <Table><TableHeader><TableRow><TableHead>Статус</TableHead><TableHead>{payment ? "Направление / документ" : "Объём / адреса"}</TableHead><TableHead>Плановая дата</TableHead><TableHead>Фактическая дата</TableHead><TableHead className="text-right">{payment ? "Сумма" : "Закупка / доставка"}</TableHead><TableHead>Комментарий</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>{rows.map((row) => { const due = "dueDate" in row ? row.dueDate : row.plannedDate; const overdue = row.status === "planned" && due && due < todayMoscow();
            return <TableRow key={row._id} className={row.status === "cancelled" ? "text-muted-foreground" : ""}>
              <TableCell className="align-top"><span className={`inline-block rounded px-2 py-1 text-xs ${row.status === "cancelled" ? "bg-muted" : row.status === "planned" ? "bg-sky-50 text-sky-800" : "bg-emerald-50 text-emerald-800"}`}>{labels[row.status]}</span>{overdue && <p className="mt-1 text-xs text-red-700">Просрочено</p>}{"invalid" in row && row.invalid && <p className="mt-1 text-xs text-red-700">Проверьте запись</p>}</TableCell>
              <TableCell className="min-w-40 max-w-xs whitespace-normal align-top">{"kind" in row ? <>{PAYMENT_KINDS[row.kind]}{row.reference && <p className="mt-1 break-words text-xs text-muted-foreground">{row.reference}</p>}</> : <><p className="font-medium tabular-nums">{count(row.quantity, row.unit)}</p>{[row.shippingAddressText, row.deliveryAddressText].filter(Boolean).map((address, index) => <p key={index} className="mt-1 break-words text-xs text-muted-foreground">{address}</p>)}</>}</TableCell>
              <TableCell className="whitespace-nowrap align-top">{operationDate(due)}</TableCell><TableCell className="whitespace-nowrap align-top">{operationDate(row.actualDate)}</TableCell>
              <TableCell className="whitespace-nowrap text-right align-top tabular-nums">{"amount" in row ? money(row.amount) : <>{money(row.amountPurchase)}<p className="mt-1 text-xs text-muted-foreground">Доставка: {money(row.deliveryCost)}</p></>}</TableCell>
              <TableCell className="min-w-40 max-w-xs whitespace-pre-wrap break-words align-top">{row.comment || "Не указан"}{row.cancelReason && <p className="mt-1 text-xs">Причина отмены: {row.cancelReason}</p>}</TableCell><TableCell className="align-top">{actions(row)}</TableCell>
            </TableRow>; })}</TableBody></Table> : <p className="py-6 text-sm text-muted-foreground">{(data[resource].length || search || filter !== "active") ? "По выбранным условиям записей нет" : payment ? "Платежей пока нет" : "Поставок пока нет"}</p>}
      </>}
    </>}
    {editing && resource !== "history" && <OperationForm deal={deal} resource={resource} entry={editing.entry} confirm={editing.confirm} revision={data?.revision ?? ""} reloading={request.loading} onReload={request.retry} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onChanged(); }} />}
    <Dialog open={Boolean(cancelling)} onOpenChange={(open) => !open && !saving && setCancelling(null)}><DialogContent className="sm:max-w-md" aria-describedby={undefined}><DialogHeader><DialogTitle>Отменить запись?</DialogTitle></DialogHeader>
      <p className="text-sm text-muted-foreground">Запись останется в истории и перестанет учитываться в итогах.</p><Label htmlFor="cancel-reason">Причина отмены</Label><Textarea id="cancel-reason" value={reason} maxLength={1000} disabled={saving} onChange={(event) => setReason(event.target.value)} />
      {error && <div className="grid gap-2"><p role="alert" className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" size="sm" disabled={saving || request.loading} onClick={request.retry}><RotateCwIcon />Обновить данные</Button></div>}
      <DialogFooter><Button type="button" variant="outline" disabled={saving} onClick={() => setCancelling(null)}>Не отменять</Button><Button type="button" variant="destructive" disabled={saving || request.loading || !data} onClick={cancel}>{saving ? "Сохранение..." : "Отменить запись"}</Button></DialogFooter>
    </DialogContent></Dialog>
  </div>;
}
