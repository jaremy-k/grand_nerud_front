import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReferenceSelect from "@/features/crm/reference-select";
import RelatedRecordSelect from "@/features/crm/related-record-select";
import { useCrmReferences } from "@/features/crm/use-references";
import { fromMoscowInput, TASK_TYPE_LABELS, toMoscowInput, userName } from "@/features/crm/utils";
import type TaskDto from "@/definitions/dto/task";
import type { TaskType } from "@/definitions/dto/task";
import { createTask, updateTask } from "@/services/tasks";
import { useState } from "react";
import { CompanyCombobox } from "@/components/inputs/company-input/company-combobox";

export type TaskContext = { companyId?: string; leadId?: string; dealId?: string; ownerId?: string };
export default function TaskFormDialog({ open, onClose, onSaved, task, context = {}, initialOwnerId }: {
  open: boolean; onClose: () => void; onSaved: () => void; task?: TaskDto; context?: TaskContext; initialOwnerId?: string;
}) {
  const refs = useCrmReferences();
  const [title, setTitle] = useState(task?.title ?? "");
  const [dueAt, setDueAt] = useState(toMoscowInput(task?.dueAt));
  const [type, setType] = useState<TaskType>(task?.type ?? "call");
  const [companyId, setCompanyId] = useState(task?.companyId ?? context.companyId ?? "");
  const [leadId, setLeadId] = useState(task?.leadId ?? context.leadId ?? "");
  const [dealId, setDealId] = useState(task?.dealId ?? context.dealId ?? "");
  const [ownerId, setOwnerId] = useState(task?.ownerId ?? context.ownerId ?? initialOwnerId ?? "");
  const [comment, setComment] = useState(task?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    setError("");
    if (!title.trim() || !dueAt) { setError("Укажите название и срок задачи"); return; }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(), dueAt: fromMoscowInput(dueAt)!, type,
        companyId: companyId || null, leadId: leadId || null, dealId: dealId || null,
        ...(refs.elevated && ownerId ? { ownerId } : {}), comment: comment.trim() || null,
      };
      if (task) await updateTask(task._id, payload); else await createTask(payload);
      onSaved(); onClose();
    } catch (err) { setError(err instanceof Error ? err.message : "Не удалось сохранить задачу"); }
    finally { setSaving(false); }
  };
  return (
    <Dialog open={open} onOpenChange={(value) => !value && !saving && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{task ? "Редактирование задачи" : "Новая задача"}</DialogTitle></DialogHeader>
        <fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2"><Label htmlFor="task-title">Название *</Label><Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="task-due">Срок (МСК) *</Label><Input id="task-due" type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="task-type">Тип</Label><Select value={type} onValueChange={(value) => setType(value as TaskType)}><SelectTrigger id="task-type"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TASK_TYPE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid gap-1.5"><Label htmlFor="task-company">Компания</Label><CompanyCombobox id="task-company" value={companyId} role="all" clearable disabled={Boolean(context.companyId || context.leadId || context.dealId)} onChange={(id) => { setCompanyId(id); setLeadId(""); setDealId(""); }} placeholder="Самостоятельная задача" /></div>
          {refs.elevated && <div className="grid gap-1.5"><Label htmlFor="task-owner">Ответственный</Label><ReferenceSelect id="task-owner" value={ownerId} disabled={Boolean(context.ownerId)} onChange={(id) => { setOwnerId(id); if (!context.leadId) setLeadId(""); if (!context.dealId) setDealId(""); }} placeholder="Я" options={refs.owners.map((item) => ({ value: item.id ?? item._id ?? "", label: userName(item) }))} /></div>}
          {!context.leadId && !context.dealId && <>
            <RelatedRecordSelect kind="lead" value={leadId} companyId={companyId || undefined} ownerId={ownerId || undefined} onChange={(id, company, owner) => { setLeadId(id); setDealId(""); if (id) { setCompanyId(company ?? ""); if (refs.elevated && owner) setOwnerId(owner); } }} />
            <RelatedRecordSelect kind="deal" value={dealId} companyId={companyId || undefined} ownerId={ownerId || undefined} onChange={(id, company, owner) => { setDealId(id); setLeadId(""); if (id) { setCompanyId(company ?? ""); if (refs.elevated && owner) setOwnerId(owner); } }} />
          </>}
          <div className="grid gap-1.5 sm:col-span-2"><Label htmlFor="task-comment">Комментарий</Label><Textarea id="task-comment" value={comment} onChange={(e) => setComment(e.target.value)} /></div>
        </fieldset>
        {(error || refs.error) && <p className="text-sm text-destructive" role="alert">{error || refs.error}</p>}
        <DialogFooter><Button type="button" variant="outline" disabled={saving} onClick={onClose}>Отмена</Button><Button type="button" disabled={saving} onClick={save}>{saving ? "Сохранение..." : "Сохранить"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
