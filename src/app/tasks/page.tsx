import { Page } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReferenceSelect from "@/features/crm/reference-select";
import { useCrmReferences } from "@/features/crm/use-references";
import OwnerScopeSelect from "@/features/crm/owner-scope-select";
import { updateCrmParams } from "@/features/crm/owner-scope";
import { useOwnerScope } from "@/features/crm/use-owner-scope";
import { TASK_STATUS_LABELS, TASK_TYPE_LABELS, userName } from "@/features/crm/utils";
import TaskList from "@/features/tasks/components/task-list";
import type { TaskFilters } from "@/services/tasks";
import { getLead } from "@/services/leads";
import { dealsService } from "@/services";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const BUCKETS = [{ value: "today", label: "Сегодня" }, { value: "overdue", label: "Просроченные" }, { value: "upcoming", label: "Предстоящие" }, { value: "all", label: "Все" }] as const;
export default function TasksPage() {
  const refs = useCrmReferences();
  const [params, setParams] = useSearchParams();
  const { scope, changeScope } = useOwnerScope();
  const leadId = params.get("leadId") || undefined;
  const dealId = params.get("dealId") || undefined;
  const bucket = BUCKETS.find((item) => item.value === params.get("bucket"))?.value ?? "today";
  const status = params.get("status") || "all";
  const type = params.get("type") || "";
  const companyId = params.get("companyId") || "";
  const dateFrom = params.get("dateFrom") || "";
  const dateTo = params.get("dateTo") || "";
  const setFilter = (key: string, value: string) => setParams(updateCrmParams(params, { [key]: value || undefined }));
  const resetFilters = () => setParams(updateCrmParams(params, { type: undefined, companyId: undefined, status: undefined, dateFrom: undefined, dateTo: undefined }));
  const filtered = Boolean(type || companyId || (bucket === "all" && (status !== "all" || dateFrom || dateTo)));
  const [contextOwner, setContextOwner] = useState<string | undefined>();
  const [contextCompany, setContextCompany] = useState<string | undefined>();
  useEffect(() => {
    let active = true;
    setContextOwner(undefined);
    setContextCompany(undefined);
    if (leadId) getLead(leadId).then((lead) => { if (active) { setContextOwner(lead.ownerId); setContextCompany(lead.companyId || undefined); } }).catch(() => {});
    if (dealId) dealsService.getDeal(dealId).then((deal) => { if (active) { setContextOwner(deal.userId); setContextCompany(deal.customerId); } }).catch(() => {});
    return () => { active = false; };
  }, [leadId, dealId]);
  const filters = useMemo<TaskFilters>(() => ({ companyId: companyId || undefined, leadId, dealId, ownerId: scope.ownerId,
    type: type ? type as TaskFilters["type"] : undefined,
    ...(bucket === "all" ? { status: status === "all" ? undefined : status as TaskFilters["status"], dateFrom: dateFrom || undefined, dateTo: dateTo || undefined } : { bucket: bucket as TaskFilters["bucket"] }),
  }), [companyId, leadId, dealId, scope.ownerId, type, bucket, status, dateFrom, dateTo]);
  const invalidRange = dateFrom && dateTo && dateFrom > dateTo;
  return <Page breadcrumbLinks={[{ label: "Задачи", href: "/tasks" }]}>
    <div className="grid gap-4 py-4">
      <div role="group" aria-label="Сроки задач" className="flex flex-wrap gap-1 border-b pb-3">{BUCKETS.map((item) => <Button key={item.value} size="sm" variant={bucket === item.value ? "secondary" : "ghost"} aria-pressed={bucket === item.value} onClick={() => setFilter("bucket", item.value)}>{item.label}</Button>)}</div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="grid gap-1.5"><Label htmlFor="tasks-type">Тип</Label><Select value={type || "all"} onValueChange={(value) => setFilter("type", value === "all" ? "" : value)}><SelectTrigger id="tasks-type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Все типы</SelectItem>{Object.entries(TASK_TYPE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
        <div className="grid gap-1.5"><Label htmlFor="tasks-company">Компания</Label><ReferenceSelect id="tasks-company" value={companyId} onChange={(value) => setFilter("companyId", value)} placeholder="Все компании" options={refs.companies.map((item) => ({ value: item._id, label: item.name }))} /></div>
        <OwnerScopeSelect id="tasks-owner" scope={scope} onChange={changeScope} owners={refs.owners} />
        {bucket === "all" && <>
          <div className="grid gap-1.5"><Label htmlFor="tasks-status">Состояние</Label><Select value={status} onValueChange={(value) => setFilter("status", value)}><SelectTrigger id="tasks-status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Все состояния</SelectItem>{Object.entries(TASK_STATUS_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid gap-1.5"><Label htmlFor="tasks-from">С даты (МСК)</Label><Input id="tasks-from" type="date" value={dateFrom} onChange={(e) => setFilter("dateFrom", e.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="tasks-to">По дату (МСК)</Label><Input id="tasks-to" type="date" value={dateTo} onChange={(e) => setFilter("dateTo", e.target.value)} /></div>
        </>}
      </div>
      {leadId && <Link to={`/leads/${leadId}`} className="text-sm text-primary hover:underline">Задачи выбранного лида</Link>}{dealId && <Link to={`/deals/${dealId}`} className="text-sm text-primary hover:underline">Задачи выбранной сделки</Link>}
      {refs.error && <p className="text-sm text-destructive">{refs.error}</p>}
      {scope.error ? <p className="text-sm text-destructive" role="alert">{scope.error}</p> : invalidRange ? <p className="text-sm text-destructive">Дата начала должна быть не позже даты окончания</p> : <TaskList filters={filters} filtered={filtered} onResetFilters={resetFilters} initialOwnerId={scope.ownerId} emptyMessage={bucket === "today" ? "На сегодня задач нет" : bucket === "overdue" ? "Просроченных задач нет" : bucket === "upcoming" ? "Предстоящих задач нет" : undefined} context={{ companyId: contextCompany || companyId || undefined, leadId, dealId, ownerId: contextOwner }} ownerNames={Object.fromEntries(refs.owners.map((item) => [item.id ?? item._id ?? "", userName(item)]))} companyNames={Object.fromEntries(refs.companies.map((item) => [item._id, item.name]))} />}
    </div>
  </Page>;
}
