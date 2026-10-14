import { Page, Pagination } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { addressesService } from "@/services";
import { convertLead, createLeadActivity, deleteLead, getLead, getLeadActivities } from "@/services/leads";
import { useCrmReferences } from "@/features/crm/use-references";
import { formatCrmDate, leadIsLocked, PRIORITY_LABELS, STAGE_COLORS, userName } from "@/features/crm/utils";
import LeadFormDialog from "@/features/leads/components/lead-form-dialog";
import LeadStageDialog from "@/features/leads/components/lead-stage-dialog";
import TaskList from "@/features/tasks/components/task-list";
import type LeadDto from "@/definitions/dto/lead";
import type { LeadActivityDto, PaginatedResult } from "@/definitions/dto/lead";
import { FilePlus2Icon, PencilIcon, SendIcon, Trash2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const ACTIVITY_LABELS: Record<string, string> = {
  note: "Заметка", call: "Звонок", meeting: "Встреча", email: "Письмо",
  created: "Лид создан", lead_created: "Лид создан", updated: "Лид изменён", lead_updated: "Лид изменён",
  stage_changed: "Этап изменён", converted: "Перевод в сделку", lead_converted: "Перевод в сделку",
  task_created: "Задача создана", task_updated: "Задача изменена", task_completed: "Задача завершена",
  task_cancelled: "Задача отменена", task_deleted: "Задача удалена",
};
export default function LeadDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const refs = useCrmReferences();
  const [lead, setLead] = useState<LeadDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [changingStage, setChangingStage] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [activityPage, setActivityPage] = useState(1);
  const [activities, setActivities] = useState<PaginatedResult<LeadActivityDto> | null>(null);
  const [activityError, setActivityError] = useState("");
  const [comment, setComment] = useState("");
  const [activityType, setActivityType] = useState<"note" | "call" | "meeting" | "email">("note");
  const [objectAddress, setObjectAddress] = useState("");
  const refresh = useCallback(() => { setRevision((value) => value + 1); }, []);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError("");
    getLead(id, { signal: controller.signal }).then((item) => { if (!controller.signal.aborted) setLead(item); })
      .catch((err) => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Не удалось загрузить лид"); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, revision]);
  useEffect(() => {
    const controller = new AbortController(); setActivityError("");
    getLeadActivities(id, activityPage, { signal: controller.signal }).then((items) => { if (!controller.signal.aborted) setActivities(items); })
      .catch((err) => { if (!controller.signal.aborted) setActivityError(err instanceof Error ? err.message : "Не удалось загрузить историю"); });
    return () => controller.abort();
  }, [id, activityPage, revision]);
  useEffect(() => {
    let active = true; setObjectAddress("");
    if (lead?.objectAddressId) addressesService.getAddress(lead.objectAddressId).then((item) => { if (active) setObjectAddress(item.adressDetail.address); }).catch(() => {});
    return () => { active = false; };
  }, [lead?.objectAddressId]);
  const addActivity = async () => {
    if (!comment.trim()) { setActivityError("Введите комментарий"); return; }
    setBusy(true); setActivityError("");
    try { await createLeadActivity(id, { type: activityType, comment: comment.trim() }); setComment(""); setActivityPage(1); refresh(); }
    catch (err) { setActivityError(err instanceof Error ? err.message : "Не удалось добавить запись"); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true); setError("");
    try { await deleteLead(id); navigate("/leads"); }
    catch (err) { setError(err instanceof Error ? err.message : "Не удалось удалить лид"); setDeleting(false); }
    finally { setBusy(false); }
  };
  const retryConversion = async () => {
    setBusy(true); setError("");
    try { const result = await convertLead(id, {}); navigate(`/deals/${result.deal._id}`); }
    catch (err) { setError(err instanceof Error ? err.message : "Не удалось завершить перевод"); }
    finally { setBusy(false); }
  };
  const stage = lead?.stage ?? refs.stages.find((item) => item._id === lead?.stageId);
  const locked = lead ? leadIsLocked({ ...lead, stage: stage ?? lead.stage }) : false;
  const owner = refs.owners.find((item) => (item.id ?? item._id) === lead?.ownerId);
  return (
    <Page breadcrumbLinks={[{ label: "Лиды", href: "/leads" }, { label: lead?.title || "Карточка лида", href: `/leads/${id}` }]}>
      <div className="grid gap-5 py-4">
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {loading && !lead && <p className="py-10 text-center text-muted-foreground">Загрузка...</p>}
        {lead && <>
          <section className="grid gap-4 border-b pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h1 className="break-words text-xl font-semibold">{lead.title}</h1><p className="mt-1 text-sm text-muted-foreground">{lead.company?.name || refs.companies.find((item) => item._id === lead.companyId)?.name || "Без компании"}</p></div>
              <div className="flex flex-wrap gap-2">
                {lead.conversionPending ? <Button disabled={busy} onClick={retryConversion}>Завершить перевод</Button> : lead.dealId ? <Button asChild><Link to={`/deals/${lead.dealId}`}>Открыть сделку</Link></Button> : stage?.kind === "qualified" ? <Button asChild><Link to={`/deals/create?leadId=${encodeURIComponent(id)}`}><FilePlus2Icon />Создать сделку</Link></Button> : null}
                {!locked && <><Button variant="outline" onClick={() => setEditing(true)}><PencilIcon />Редактировать</Button><Button variant="ghost" size="icon" title="Удалить лид" aria-label="Удалить лид" onClick={() => setDeleting(true)}><Trash2Icon /></Button></>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm"><span className={`rounded px-2 py-1 text-xs ${stage ? STAGE_COLORS[stage.kind] : "bg-muted"}`}>{stage?.name || "Без этапа"}</span>{!locked && <Button size="sm" variant="outline" onClick={() => setChangingStage(true)}>Изменить этап</Button>}<span>{PRIORITY_LABELS[lead.priority]}</span>{owner && <span className="text-muted-foreground">{userName(owner)}</span>}</div>
            <dl className="grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <div><dt className="text-xs text-muted-foreground">Материалы</dt><dd className="mt-1">{lead.materials?.map((item) => item.name).join(", ") || "—"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Объём / бюджет</dt><dd className="mt-1">{lead.quantity != null ? `${lead.quantity} ${lead.unitMeasurement || ""}` : "—"}{lead.budget != null ? ` · ${lead.budget.toLocaleString("ru-RU")} руб.` : ""}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Ожидаемая закупка</dt><dd className="mt-1">{formatCrmDate(lead.expectedPurchaseAt)}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Следующий контакт</dt><dd className="mt-1">{formatCrmDate(lead.nextContactAt)}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Объект</dt><dd className="mt-1">{objectAddress || lead.objectAddress || "—"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Источник</dt><dd className="mt-1">{lead.source || "—"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Контактное лицо</dt><dd className="mt-1">{lead.contactPerson?.name || "—"}{lead.contactPerson?.position && <p className="text-xs text-muted-foreground">{lead.contactPerson.position}</p>}{lead.contactPerson?.phones?.map((phone) => <a key={phone} href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="block text-xs hover:underline">{phone}</a>)}{lead.contactPerson?.emails?.map((email) => <a key={email} href={`mailto:${email}`} className="block break-all text-xs hover:underline">{email}</a>)}</dd></div>
              {lead.lossReason && <div><dt className="text-xs text-muted-foreground">Причина нецелевого лида</dt><dd className="mt-1">{lead.lossReason}</dd></div>}
            </dl>
            {lead.notes && <p className="whitespace-pre-wrap break-words text-sm">{lead.notes}</p>}
          </section>
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="grid content-start gap-3"><h2 className="text-base font-medium">Задачи</h2><TaskList filters={{ leadId: id }} context={{ leadId: id, companyId: lead.companyId || undefined, ownerId: lead.ownerId }} onChanged={refresh} ownerNames={Object.fromEntries(refs.owners.map((item) => [item.id ?? item._id ?? "", userName(item)]))} /></section>
            <section className="grid content-start gap-3"><h2 className="text-base font-medium">История контактов</h2>
              {!locked && <div className="grid gap-2 border-b pb-4"><Label htmlFor="activity-comment">Новая запись</Label><Select value={activityType} onValueChange={(value) => setActivityType(value as typeof activityType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["note", "call", "meeting", "email"].map((type) => <SelectItem key={type} value={type}>{ACTIVITY_LABELS[type]}</SelectItem>)}</SelectContent></Select><Textarea id="activity-comment" value={comment} onChange={(e) => setComment(e.target.value)} /><Button className="justify-self-end" disabled={busy} onClick={addActivity}><SendIcon />Добавить запись</Button></div>}
              {activityError && <p className="text-sm text-destructive">{activityError}</p>}
              <div className="divide-y">{activities?.items.map((activity) => <article key={activity._id} className="grid gap-1 py-3"><div className="flex flex-wrap justify-between gap-2 text-xs"><span className="font-medium">{ACTIVITY_LABELS[activity.type] || "Событие"}</span><time className="text-muted-foreground">{formatCrmDate(activity.createdAt)}</time></div>{activity.comment && <p className="whitespace-pre-wrap break-words text-sm">{activity.comment}</p>}{refs.owners.find((item) => (item.id ?? item._id) === activity.userId) && <p className="text-xs text-muted-foreground">{userName(refs.owners.find((item) => (item.id ?? item._id) === activity.userId)!)}</p>}</article>)}{activities && !activities.items.length && <p className="py-4 text-sm text-muted-foreground">Нет записей</p>}</div>
              {activities && <Pagination total={activities.totalPages} current={activityPage} onClick={setActivityPage} />}
            </section>
          </div>
        </>}
      </div>
      {editing && lead && <LeadFormDialog open lead={lead} onClose={() => setEditing(false)} onSaved={refresh} />}
      {changingStage && lead && <LeadStageDialog lead={lead} stages={refs.stages} onClose={() => setChangingStage(false)} onSaved={refresh} />}
      <AlertDialog open={deleting} onOpenChange={setDeleting}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Удалить лид?</AlertDialogTitle><AlertDialogDescription>Остальные открытые задачи нужно завершить или отменить перед удалением.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={busy}>Отмена</AlertDialogCancel><Button variant="destructive" disabled={busy} onClick={remove}>Удалить</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </Page>
  );
}
