import { Page } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReferenceSelect from "@/features/crm/reference-select";
import { useCrmReferences } from "@/features/crm/use-references";
import { TASK_STATUS_LABELS, TASK_TYPE_LABELS, userName } from "@/features/crm/utils";
import TaskList from "@/features/tasks/components/task-list";
import type { TaskFilters } from "@/services/tasks";
import { getLead } from "@/services/leads";
import { dealsService } from "@/services";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const BUCKETS = [{ value: "today", label: "Сегодня" }, { value: "overdue", label: "Просроченные" }, { value: "upcoming", label: "Предстоящие" }, { value: "all", label: "Все" }] as const;
export default function TasksPage() {
  const refs = useCrmReferences();
  const [params] = useSearchParams();
  const leadId = params.get("leadId") || undefined;
  const dealId = params.get("dealId") || undefined;
  const [bucket, setBucket] = useState("today");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [companyId, setCompanyId] = useState(params.get("companyId") ?? "");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [contextOwner, setContextOwner] = useState<string | undefined>();
  const [contextCompany, setContextCompany] = useState<string | undefined>();
  useEffect(() => {
    let active = true;
    if (leadId) getLead(leadId).then((lead) => { if (active) { setContextOwner(lead.ownerId); setContextCompany(lead.companyId || undefined); } }).catch(() => {});
    if (dealId) dealsService.getDeal(dealId).then((deal) => { if (active) { setContextOwner(deal.userId); setContextCompany(deal.customerId); } }).catch(() => {});
    return () => { active = false; };
  }, [leadId, dealId]);
  const filters: TaskFilters = { companyId: companyId || undefined, leadId, dealId, ownerId: refs.elevated ? ownerId || undefined : undefined,
    type: type ? type as TaskFilters["type"] : undefined,
    ...(bucket === "all" ? { status: status === "all" ? undefined : status as TaskFilters["status"], dateFrom: dateFrom || undefined, dateTo: dateTo || undefined } : { bucket: bucket as TaskFilters["bucket"] }),
  };
  const invalidRange = dateFrom && dateTo && dateFrom > dateTo;
  return <Page breadcrumbLinks={[{ label: "Задачи", href: "/tasks" }]}>
    <div className="grid gap-4 py-4">
      <div role="group" aria-label="Сроки задач" className="flex flex-wrap gap-1 border-b pb-3">{BUCKETS.map((item) => <Button key={item.value} size="sm" variant={bucket === item.value ? "secondary" : "ghost"} aria-pressed={bucket === item.value} onClick={() => setBucket(item.value)}>{item.label}</Button>)}</div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="grid gap-1.5"><Label htmlFor="tasks-type">Тип</Label><Select value={type || "all"} onValueChange={(value) => setType(value === "all" ? "" : value)}><SelectTrigger id="tasks-type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Все типы</SelectItem>{Object.entries(TASK_TYPE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
        <div className="grid gap-1.5"><Label htmlFor="tasks-company">Компания</Label><ReferenceSelect id="tasks-company" value={companyId} onChange={setCompanyId} placeholder="Все компании" options={refs.companies.map((item) => ({ value: item._id, label: item.name }))} /></div>
        {refs.elevated && <div className="grid gap-1.5"><Label htmlFor="tasks-owner">Ответственный</Label><ReferenceSelect id="tasks-owner" value={ownerId} onChange={setOwnerId} placeholder="Все ответственные" options={refs.owners.map((item) => ({ value: item.id ?? item._id ?? "", label: userName(item) }))} /></div>}
        {bucket === "all" && <>
          <div className="grid gap-1.5"><Label htmlFor="tasks-status">Состояние</Label><Select value={status} onValueChange={setStatus}><SelectTrigger id="tasks-status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Все состояния</SelectItem>{Object.entries(TASK_STATUS_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid gap-1.5"><Label htmlFor="tasks-from">С даты (МСК)</Label><Input id="tasks-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="tasks-to">По дату (МСК)</Label><Input id="tasks-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></div>
        </>}
      </div>
      {leadId && <Link to={`/leads/${leadId}`} className="text-sm text-primary hover:underline">Задачи выбранного лида</Link>}{dealId && <Link to={`/deals/${dealId}`} className="text-sm text-primary hover:underline">Задачи выбранной сделки</Link>}
      {refs.error && <p className="text-sm text-destructive">{refs.error}</p>}
      {invalidRange ? <p className="text-sm text-destructive">Дата начала должна быть не позже даты окончания</p> : <TaskList filters={filters} context={{ companyId: contextCompany || companyId || undefined, leadId, dealId, ownerId: contextOwner }} ownerNames={Object.fromEntries(refs.owners.map((item) => [item.id ?? item._id ?? "", userName(item)]))} companyNames={Object.fromEntries(refs.companies.map((item) => [item._id, item.name]))} />}
    </div>
  </Page>;
}
