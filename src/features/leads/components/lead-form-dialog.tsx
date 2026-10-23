import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addressesService, companiesService } from "@/services";
import { CompanyCombobox } from "@/components/inputs/company-input/company-combobox";
import { useLatestRequest } from "@/hooks/use-latest-request";
import { personPhones, personEmails } from "@/lib/company-contacts";
import { createLead, updateLead } from "@/services/leads";
import type LeadDto from "@/definitions/dto/lead";
import type { LeadPriority } from "@/definitions/dto/lead";
import type { AddressDto } from "@definitions/dto";
import { useEffect, useState } from "react";
import ReferenceSelect from "@/features/crm/reference-select";
import { useCrmReferences } from "@/features/crm/use-references";
import { fromMoscowInput, leadIsLocked, PRIORITY_LABELS, splitContactValues, toMoscowInput, userName, validateLeadStage } from "@/features/crm/utils";
const loadCompany = (id: string, signal: AbortSignal) => id ? companiesService.getCompany(id, { signal }) : Promise.resolve(null);

export default function LeadFormDialog({ open, onClose, onSaved, lead, initialCompanyId, initialOwnerId }: {
  open: boolean; onClose: () => void; onSaved: (lead: LeadDto) => void; lead?: LeadDto; initialCompanyId?: string; initialOwnerId?: string;
}) {
  const refs = useCrmReferences();
  const [title, setTitle] = useState(lead?.title ?? "");
  const [companyId, setCompanyId] = useState(lead?.companyId ?? initialCompanyId ?? "");
  const [ownerId, setOwnerId] = useState(lead?.ownerId ?? initialOwnerId ?? "");
  const [stageId, setStageId] = useState(lead?.stageId ?? "");
  const [priority, setPriority] = useState<LeadPriority>(lead?.priority ?? "normal");
  const [source, setSource] = useState(lead?.source ?? "");
  const [materialIds, setMaterialIds] = useState<string[]>(lead?.materialIds ?? []);
  const [quantity, setQuantity] = useState(lead?.quantity != null ? String(lead.quantity) : "");
  const [unit, setUnit] = useState(lead?.unitMeasurement ?? "т");
  const [budget, setBudget] = useState(lead?.budget != null ? String(lead.budget) : "");
  const [addressId, setAddressId] = useState(lead?.objectAddressId ?? "");
  const [address, setAddress] = useState(lead?.objectAddress ?? "");
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [expectedAt, setExpectedAt] = useState(toMoscowInput(lead?.expectedPurchaseAt));
  const [nextContactAt, setNextContactAt] = useState(toMoscowInput(lead?.nextContactAt));
  const [lossReason, setLossReason] = useState(lead?.lossReason ?? "");
  const [notes, setNotes] = useState(lead?.notes ?? "");
  const [contactName, setContactName] = useState(lead?.contactPerson?.name ?? "");
  const [position, setPosition] = useState(lead?.contactPerson?.position ?? "");
  const [phones, setPhones] = useState(lead?.contactPerson?.phones?.join("; ") ?? "");
  const [emails, setEmails] = useState(lead?.contactPerson?.emails?.join("; ") ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const selectedCompany = useLatestRequest(companyId, loadCompany).data;
  const selectedStage = refs.stages.find((item) => item._id === stageId);

  useEffect(() => {
    let active = true;
    setAddresses([]);
    if (companyId) addressesService.getAddresses(companyId).then((items) => {
      if (active) setAddresses(items);
    }).catch((err) => { if (active) setError(err instanceof Error ? err.message : "Не удалось загрузить адреса"); });
    return () => { active = false; };
  }, [companyId]);

  const save = async () => {
    setError("");
    if (!title.trim()) { setError("Укажите название лида"); return; }
    if (lead && leadIsLocked(lead)) { setError("Редактирование этого лида недоступно"); return; }
    const stageError = validateLeadStage(selectedStage?.kind, nextContactAt, lossReason);
    if (stageError) { setError(stageError); return; }
    const parsedEmails = splitContactValues(emails);
    if (parsedEmails.some((value) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) { setError("Проверьте email контактного лица"); return; }
    if (!contactName.trim() && (phones.trim() || emails.trim() || position.trim())) { setError("Укажите имя контактного лица"); return; }
    if ([quantity, budget].some((value) => value && (!Number.isFinite(Number(value)) || Number(value) < 0))) { setError("Объём и бюджет должны быть неотрицательными числами"); return; }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(), companyId: companyId || null, stageId: stageId || undefined, priority,
        ...(refs.elevated && ownerId ? { ownerId } : {}), source: source.trim() || null,
        materialIds, quantity: quantity ? Number(quantity) : null, unitMeasurement: unit.trim() || null,
        budget: budget ? Number(budget) : null, objectAddressId: addressId || null,
        objectAddress: address.trim() || null, expectedPurchaseAt: fromMoscowInput(expectedAt),
        nextContactAt: selectedStage?.kind === "unqualified" ? null : fromMoscowInput(nextContactAt),
        lossReason: lossReason.trim() || null, notes: notes.trim() || null,
        contactPerson: contactName.trim() ? { name: contactName.trim(), position: position.trim() || undefined,
          phones: splitContactValues(phones), emails: parsedEmails } : null,
      };
      const result = lead ? await updateLead(lead._id, payload) : await createLead(payload);
      onSaved(result);
      onClose();
    } catch (err) { setError(err instanceof Error ? err.message : "Не удалось сохранить лид"); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && !saving && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader><DialogTitle>{lead ? "Редактирование лида" : "Новый лид"}</DialogTitle></DialogHeader>
        <fieldset disabled={saving} className="grid min-w-0 gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2"><Label htmlFor="lead-title">Название потребности *</Label><Input id="lead-title" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="lead-company">Компания</Label><CompanyCombobox id="lead-company" value={companyId} role="all" clearable placeholder="Без компании" onChange={(id) => { setCompanyId(id); setAddressId(""); }} /></div>
          <div className="grid gap-1.5"><Label htmlFor="lead-priority">Приоритет</Label><Select value={priority} onValueChange={(value) => setPriority(value as LeadPriority)}><SelectTrigger id="lead-priority"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PRIORITY_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid gap-1.5"><Label htmlFor="lead-stage">Этап</Label><ReferenceSelect id="lead-stage" value={stageId} placeholder="Новый (по умолчанию)" options={refs.stages.filter((item) => item.kind !== "converted").map((item) => ({ value: item._id, label: item.name }))} onChange={setStageId} /></div>
          {refs.elevated && <div className="grid gap-1.5"><Label htmlFor="lead-owner">Ответственный</Label><ReferenceSelect id="lead-owner" value={ownerId} placeholder="Я" options={refs.owners.map((item) => ({ value: item.id ?? item._id ?? "", label: userName(item) }))} onChange={setOwnerId} /></div>}
          <div className="grid gap-1.5"><Label htmlFor="lead-source">Источник</Label><Input id="lead-source" value={source} onChange={(e) => setSource(e.target.value)} /></div>
          <section className="grid gap-3 border-t pt-4 sm:col-span-2">
            <h3 className="text-sm font-medium">Контактное лицо</h3>
            {selectedCompany?.contactPersons?.length ? <ReferenceSelect value="" placeholder="Выбрать контактное лицо компании" options={selectedCompany.contactPersons.map((item, index) => ({ value: String(index), label: item.name }))} onChange={(value) => { const person = selectedCompany.contactPersons[Number(value)]; if (!value || !person) return; setContactName(person.name); setPosition(person.position ?? ""); setPhones(personPhones(person).join("; ")); setEmails(personEmails(person).join("; ")); }} /> : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5"><Label htmlFor="lead-contact-name">Имя</Label><Input id="lead-contact-name" value={contactName} onChange={(e) => setContactName(e.target.value)} /></div>
              <div className="grid gap-1.5"><Label htmlFor="lead-position">Должность</Label><Input id="lead-position" value={position} onChange={(e) => setPosition(e.target.value)} /></div>
              <div className="grid gap-1.5"><Label htmlFor="lead-phones">Телефоны</Label><Input id="lead-phones" value={phones} onChange={(e) => setPhones(e.target.value)} placeholder="+7…; +7…" /></div>
              <div className="grid gap-1.5"><Label htmlFor="lead-emails">Email</Label><Input id="lead-emails" value={emails} onChange={(e) => setEmails(e.target.value)} /></div>
            </div>
          </section>
          <section className="grid gap-3 border-t pt-4 sm:col-span-2">
            <h3 className="text-sm font-medium">Материалы</h3>
            <div className="flex max-h-36 flex-wrap gap-x-5 gap-y-2 overflow-y-auto">
              {refs.materials.map((item) => <label key={item._id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={materialIds.includes(item._id)} onChange={(e) => setMaterialIds((items) => e.target.checked ? [...items, item._id] : items.filter((id) => id !== item._id))} />{item.name}</label>)}
            </div>
          </section>
          <div className="grid gap-1.5"><Label htmlFor="lead-quantity">Объём</Label><Input id="lead-quantity" type="number" min="0" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="lead-unit">Единица измерения</Label><Input id="lead-unit" value={unit} onChange={(e) => setUnit(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="lead-budget">Бюджет, руб.</Label><Input id="lead-budget" type="number" min="0" step="any" value={budget} onChange={(e) => setBudget(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="lead-expected">Ожидаемая закупка (МСК)</Label><Input id="lead-expected" type="datetime-local" value={expectedAt} onChange={(e) => setExpectedAt(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="lead-object">Объект компании</Label><ReferenceSelect id="lead-object" value={addressId} onChange={setAddressId} disabled={!companyId} options={addresses.map((item) => ({ value: item._id, label: item.adressDetail.address }))} placeholder="Без привязки к адресу" /></div>
          <div className="grid gap-1.5"><Label htmlFor="lead-address">Адрес объекта</Label><Input id="lead-address" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="lead-next-contact">Следующий контакт (МСК)</Label><Input id="lead-next-contact" type="datetime-local" value={nextContactAt} onChange={(e) => setNextContactAt(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="lead-loss">Причина нецелевого лида</Label><Input id="lead-loss" value={lossReason} onChange={(e) => setLossReason(e.target.value)} /></div>
          <div className="grid gap-1.5 sm:col-span-2"><Label htmlFor="lead-notes">Комментарий</Label><Textarea id="lead-notes" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        </fieldset>
        {(error || refs.error) && <p className="text-sm text-destructive" role="alert">{error || refs.error}</p>}
        <DialogFooter><Button type="button" variant="outline" disabled={saving} onClick={onClose}>Отмена</Button><Button type="button" disabled={saving} onClick={save}>{saving ? "Сохранение..." : "Сохранить"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
