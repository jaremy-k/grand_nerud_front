import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddressSelect from "@/components/inputs/company-input/address-select";
import UnsavedChangesGuard from "@/features/crm/unsaved-changes-guard";
import { normalizeMaterialUnit } from "@/lib/company-materials";
import type { DealDto } from "@definitions/dto";
import type { DealPayment, DealShipment, OperationResource, PaymentKind } from "@/definitions/dto/deal-operations";
import { saveDealPayment, saveDealShipment } from "@/services/deal-operations";
import { decimalString, operationDraft, PAYMENT_KINDS, todayMoscow, validateOperationDraft, type OperationDraft } from "@features/deals/utils/operations";
import { RotateCwIcon } from "lucide-react";

export default function OperationForm({ deal, resource, entry, confirm, revision, reloading, onReload, onClose, onSaved }: {
  deal: DealDto; resource: OperationResource; entry?: DealPayment | DealShipment; confirm?: boolean;
  revision: string; reloading: boolean; onReload: () => void; onClose: () => void; onSaved: () => void;
}) {
  const payment = resource === "payments";
  const [initial] = useState<OperationDraft>(() => ({ ...operationDraft(entry, confirm), unit: normalizeMaterialUnit(deal.unitMeasurement),
    shippingAddressId: entry && "shippingAddressId" in entry ? entry.shippingAddressId ?? "" : deal.shippingAddressId ?? "",
    deliveryAddressId: entry && "deliveryAddressId" in entry ? entry.deliveryAddressId ?? "" : deal.deliveryAddressId ?? "" }));
  const [draft, setDraft] = useState(initial);
  const [requestId] = useState(() => entry?.requestId || crypto.randomUUID());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const allowNavigation = useRef(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const close = () => { if (!saving) { if (dirty) setClosing(true); else onClose(); } };
  const update = <K extends keyof OperationDraft>(key: K, value: OperationDraft[K]) => { setDraft((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: "" })); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const invalid = validateOperationDraft(draft, payment);
    setErrors(invalid);
    if (Object.keys(invalid).length || !revision || reloading) return;
    setSaving(true); setError("");
    try {
      if (payment) await saveDealPayment(deal._id, { revision, requestId, kind: draft.kind, status: draft.status === "paid" ? "paid" : "planned",
        amount: decimalString(draft.amount), dueDate: draft.plannedDate || null, actualDate: draft.status === "paid" ? draft.actualDate : null,
        reference: draft.reference.trim(), comment: draft.comment.trim() }, entry?._id);
      else await saveDealShipment(deal._id, { revision, requestId, status: draft.status === "delivered" ? "delivered" : "planned", quantity: decimalString(draft.quantity), unit: draft.unit,
        plannedDate: draft.plannedDate || null, actualDate: draft.status === "delivered" ? draft.actualDate : null,
        amountPurchase: draft.amountPurchase.trim() ? decimalString(draft.amountPurchase) : null,
        deliveryCost: draft.deliveryCost.trim() ? decimalString(draft.deliveryCost) : null, comment: draft.comment.trim(),
        shippingAddressId: draft.shippingAddressId || null, deliveryAddressId: draft.deliveryAddressId || null }, entry?._id);
      allowNavigation.current = true;
      onSaved();
    } catch (err) { setError(err instanceof Error ? err.message : "Не удалось сохранить операцию"); }
    finally { setSaving(false); }
  };
  const fieldError = (field: string) => errors[field] ? <p id={`op-error-${field}`} role="alert" className="text-xs text-destructive">{errors[field]}</p> : null;
  const numberInput = (field: "amount" | "quantity" | "amountPurchase" | "deliveryCost", label: string) => <div className="grid min-w-0 gap-1.5">
    <Label htmlFor={`op-${field}`}>{label}</Label><Input id={`op-${field}`} inputMode="decimal" value={draft[field]} onChange={(event) => update(field, event.target.value)}
      aria-invalid={Boolean(errors[field])} aria-describedby={errors[field] ? `op-error-${field}` : undefined} />{fieldError(field)}
  </div>;
  return <>
    <UnsavedChangesGuard when={dirty && !saving} bypass={allowNavigation} />
    <Dialog open onOpenChange={(open) => !open && close()}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl" aria-describedby={undefined}>
      <DialogHeader><DialogTitle>{confirm ? payment ? "Учесть платёж" : "Подтвердить поставку" : entry ? payment ? "Изменить платёж" : "Изменить поставку" : payment ? "Добавить платёж" : "Добавить поставку"}</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="grid min-w-0 gap-4" noValidate>
        <fieldset disabled={saving || reloading} className="grid min-w-0 gap-4">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5"><Label htmlFor="op-status">Статус</Label><Select value={draft.status} onValueChange={(value) => {
              update("status", value as OperationDraft["status"]); if (value !== "planned" && !draft.actualDate) update("actualDate", todayMoscow());
            }}><SelectTrigger id="op-status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="planned">Запланировано</SelectItem>
              <SelectItem value={payment ? "paid" : "delivered"}>{payment ? "Оплачено" : "Поставлено"}</SelectItem></SelectContent></Select></div>
            {payment ? <div className="grid gap-1.5"><Label htmlFor="op-kind">Направление</Label><Select value={draft.kind} onValueChange={(value) => update("kind", value as PaymentKind)}><SelectTrigger id="op-kind"><SelectValue /></SelectTrigger><SelectContent>
              {Object.entries(PAYMENT_KINDS).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
            </SelectContent></Select></div> : <div className="grid gap-1.5"><Label>Исполнитель</Label><p className="break-words text-sm">{deal.provider?.name || "Не указан"}</p></div>}
            {payment ? numberInput("amount", "Сумма, руб.") : <>{numberInput("quantity", "Объём")}<div className="grid gap-1.5"><Label htmlFor="op-unit">Единица</Label><Input id="op-unit" value={draft.unit} readOnly aria-invalid={Boolean(errors.unit)} />{fieldError("unit")}</div></>}
            <div className="grid gap-1.5"><Label htmlFor="op-planned">Плановая дата</Label><Input id="op-planned" type="date" value={draft.plannedDate} onChange={(event) => update("plannedDate", event.target.value)} aria-invalid={Boolean(errors.plannedDate)} />{fieldError("plannedDate")}</div>
            {draft.status !== "planned" && <div className="grid gap-1.5"><Label htmlFor="op-actual">Фактическая дата</Label><Input id="op-actual" type="date" max={todayMoscow()} value={draft.actualDate} onChange={(event) => update("actualDate", event.target.value)} aria-invalid={Boolean(errors.actualDate)} />{fieldError("actualDate")}</div>}
            {!payment && <>{numberInput("amountPurchase", "Закупка за эту поставку, руб.")}{numberInput("deliveryCost", "Доставка за эту поставку, руб.")}</>}
          </div>
          {!payment && <div className="grid min-w-0 gap-4 border-t pt-4"><div className="grid min-w-0 gap-1.5"><Label htmlFor="op-shipping">Адрес погрузки</Label><AddressSelect id="op-shipping" companyId={deal.providerId ?? undefined} value={draft.shippingAddressId} onChange={(value) => update("shippingAddressId", value)} placeholder="Адрес исполнителя" /></div>
            <div className="grid min-w-0 gap-1.5"><Label htmlFor="op-delivery">Адрес разгрузки</Label><AddressSelect id="op-delivery" companyId={deal.customerId} value={draft.deliveryAddressId} onChange={(value) => update("deliveryAddressId", value)} placeholder="Объект заказчика" /></div></div>}
          {payment && <div className="grid gap-1.5"><Label htmlFor="op-reference">Номер платёжного документа</Label><Input id="op-reference" maxLength={100} value={draft.reference} onChange={(event) => update("reference", event.target.value)} /></div>}
          <div className="grid gap-1.5"><Label htmlFor="op-comment">Комментарий</Label><Textarea id="op-comment" maxLength={1000} value={draft.comment} onChange={(event) => update("comment", event.target.value)} /></div>
        </fieldset>
        {error && <div className="grid gap-2 border-t pt-3"><p role="alert" className="break-words text-sm text-destructive">{error}</p><Button type="button" size="sm" variant="outline" className="justify-self-start" disabled={saving || reloading} onClick={onReload}><RotateCwIcon />Обновить данные</Button></div>}
        <DialogFooter><Button type="button" variant="outline" disabled={saving} onClick={close}>Отмена</Button><Button type="submit" disabled={saving || reloading || !revision}>{saving ? "Сохранение..." : reloading ? "Обновление..." : "Сохранить"}</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
    <AlertDialog open={closing} onOpenChange={setClosing}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Закрыть без сохранения?</AlertDialogTitle><AlertDialogDescription>Изменения этой операции не будут сохранены.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Продолжить редактирование</AlertDialogCancel><Button variant="destructive" onClick={onClose}>Закрыть</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </>;
}
