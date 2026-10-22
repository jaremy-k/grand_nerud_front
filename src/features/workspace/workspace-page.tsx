import { Page } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import useAuthContext from "@/contexts/auth-context";
import type TaskDto from "@/definitions/dto/task";
import OwnerScopeSelect from "@/features/crm/owner-scope-select";
import { crmScopeLink } from "@/features/crm/owner-scope";
import RequestError from "@/features/crm/request-error";
import { useOwnerScope } from "@/features/crm/use-owner-scope";
import { formatCrmDate, PRIORITY_LABELS, TASK_TYPE_LABELS, userName } from "@/features/crm/utils";
import LeadFormDialog from "@/features/leads/components/lead-form-dialog";
import TaskActionDialog from "@/features/tasks/components/task-action-dialog";
import TaskFormDialog from "@/features/tasks/components/task-form-dialog";
import { AlarmClockIcon, ArrowRightIcon, CalendarClockIcon, CalendarDaysIcon, CheckIcon, ClipboardListIcon, FilePlus2Icon, MailIcon, PhoneIcon, PlusIcon, RotateCwIcon, TargetIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useWorkspaceData } from "./use-workspace-data";

const TASK_ICONS = { call: PhoneIcon, meeting: CalendarDaysIcon, email: MailIcon, other: ClipboardListIcon };
const BUCKETS = [
  { value: "overdue", label: "Просроченные", icon: AlarmClockIcon, color: "text-red-700 dark:text-red-300" },
  { value: "today", label: "Сегодня", icon: CalendarDaysIcon, color: "text-emerald-700 dark:text-emerald-300" },
  { value: "upcoming", label: "Предстоящие", icon: CalendarClockIcon, color: "text-sky-700 dark:text-sky-300" },
] as const;
type Bucket = typeof BUCKETS[number]["value"];

export default function WorkspacePage() {
  const { user } = useAuthContext();
  const { scope, changeScope } = useOwnerScope();
  const data = useWorkspaceData(scope);
  const [bucket, setBucket] = useState<Bucket | null>(null);
  const selectedBucket = bucket ?? (data.overdue.data?.total === 0 ? "today" : "overdue");
  const tasks = data[selectedBucket];
  const [creating, setCreating] = useState<"lead" | "task" | null>(null);
  const [editingTask, setEditingTask] = useState<TaskDto | null>(null);
  const [completingTask, setCompletingTask] = useState<TaskDto | null>(null);
  const ownerNames = Object.fromEntries([...(data.owners.data ?? []), ...(user ? [user] : [])].map((owner) => [owner.id || owner._id, userName(owner)]));
  const loading = data.overdue.loading || data.today.loading || data.upcoming.loading || data.newLeads.loading;
  const date = new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Moscow", weekday: "long", day: "numeric", month: "long" }).format(data.now);
  const metrics = [
    ...BUCKETS.map((item) => ({ ...item, request: data[item.value], href: crmScopeLink("/tasks", scope, { bucket: item.value }) })),
    { value: "leads", label: "Новые лиды", icon: TargetIcon, color: "text-foreground", request: data.newLeads, href: crmScopeLink("/leads", scope, { status: "new" }) },
  ];

  return <Page breadcrumbLinks={[{ label: "Рабочий стол", href: "/" }]}>
    <div className="min-w-0 space-y-6 py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-2xl font-semibold">Рабочий стол</h1><p className="mt-1 text-sm text-muted-foreground">{date} · МСК</p></div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setCreating("lead")}><PlusIcon />Новый лид</Button>
          <Button size="sm" variant="outline" onClick={() => setCreating("task")}><ClipboardListIcon />Новая задача</Button>
          <Button size="sm" variant="outline" asChild><Link to="/deals/create"><FilePlus2Icon />Создать сделку</Link></Button>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full max-w-xs"><OwnerScopeSelect id="workspace-owner" scope={scope} onChange={changeScope} owners={data.owners.data ?? []} /></div>
        <Button type="button" size="icon" variant="outline" title="Обновить рабочий стол" aria-label="Обновить рабочий стол" onClick={data.refresh}>
          <RotateCwIcon className={loading ? "animate-spin" : ""} />
        </Button>
      </div>
      {data.owners.error && <RequestError error={`Не удалось загрузить сотрудников: ${data.owners.error}`} onRetry={data.owners.retry} />}
      <div className="grid grid-cols-2 divide-x divide-y border-y lg:grid-cols-4 lg:divide-y-0">
        {metrics.map((metric) => <Link key={metric.value} to={metric.href} aria-label={`${metric.label}: ${metric.request.data?.total ?? (metric.request.error ? "нет данных" : "загрузка")}`} className="group min-w-0 px-3 py-4 transition-colors hover:bg-muted/40 focus-visible:outline-primary sm:px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><metric.icon className={`size-4 shrink-0 ${metric.color}`} /><span>{metric.label}</span></div>
          <div className="mt-2 flex min-h-9 items-center justify-between gap-2">
            <span className={`text-2xl font-semibold tabular-nums ${metric.color}`}>{metric.request.loading ? "..." : metric.request.error ? <span className="text-sm font-normal text-destructive">Нет данных</span> : metric.request.data?.total.toLocaleString("ru-RU")}</span>
            <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
          </div>
        </Link>)}
      </div>
      <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="min-w-0" aria-label="Задачи рабочего стола">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Задачи</h2>
            <Link className="inline-flex items-center gap-1 text-sm text-primary hover:underline" to={crmScopeLink("/tasks", scope, { bucket: selectedBucket })}>Все задачи<ArrowRightIcon className="size-4" /></Link>
          </div>
          <div role="tablist" aria-label="Срок задач рабочего стола" className="flex flex-wrap gap-1 border-b pb-3">
            {BUCKETS.map((item, index) => <Button key={item.value} type="button" size="sm" role="tab" tabIndex={selectedBucket === item.value ? 0 : -1} aria-selected={selectedBucket === item.value} aria-controls="workspace-tasks" id={`workspace-${item.value}`} variant={selectedBucket === item.value ? "secondary" : "ghost"} onClick={() => setBucket(item.value)} onKeyDown={(event) => {
              const offset = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
              if (!offset && event.key !== "Home" && event.key !== "End") return;
              event.preventDefault();
              const next = BUCKETS[event.key === "Home" ? 0 : event.key === "End" ? BUCKETS.length - 1 : (index + offset + BUCKETS.length) % BUCKETS.length];
              setBucket(next.value);
              document.getElementById(`workspace-${next.value}`)?.focus();
            }}>{item.label}</Button>)}
          </div>
          <div id="workspace-tasks" role="tabpanel" aria-labelledby={`workspace-${selectedBucket}`}>
            {tasks.loading ? <p className="py-8 text-sm text-muted-foreground" role="status">Загрузка задач...</p>
              : tasks.error ? <RequestError error={tasks.error} onRetry={tasks.retry} />
              : tasks.data?.total === 0 ? <div className="space-y-3 py-8"><p className="text-sm text-muted-foreground">{selectedBucket === "overdue" ? "Просроченных задач нет" : selectedBucket === "today" ? "На сегодня задач нет" : "Предстоящих задач нет"}</p><Button size="sm" variant="outline" onClick={() => setCreating("task")}><PlusIcon />Новая задача</Button></div>
              : <div className="divide-y">{tasks.data?.items.map((task) => {
                const Icon = TASK_ICONS[task.type];
                return <article key={task._id} className="flex min-w-0 items-start gap-3 py-4">
                  <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <button type="button" className="block text-left text-sm font-medium break-words hover:text-primary hover:underline" aria-label={`Открыть задачу: ${task.title}`} onClick={() => setEditingTask(task)}>{task.title}</button>
                    <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground"><span className={new Date(task.dueAt).getTime() < data.now ? "text-red-700 dark:text-red-300" : ""}>{formatCrmDate(task.dueAt)} МСК</span><span>{TASK_TYPE_LABELS[task.type]}</span>{ownerNames[task.ownerId] && <span>{ownerNames[task.ownerId]}</span>}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      {task.company?.name && <span className="break-words text-muted-foreground">{task.company.name}</span>}
                      {task.leadId && <Link className="text-primary hover:underline" to={`/leads/${task.leadId}`}>{task.lead?.title || "Открыть лид"}</Link>}
                      {task.dealId && <Link className="text-primary hover:underline" to={`/deals/${task.dealId}`}>Открыть сделку</Link>}
                    </div>
                  </div>
                  {task.status === "open" && <Button type="button" size="icon-sm" variant="outline" title="Завершить задачу" aria-label={`Завершить задачу: ${task.title}`} onClick={() => setCompletingTask(task)}><CheckIcon /></Button>}
                </article>;
              })}</div>}
            {tasks.data && tasks.data.total > tasks.data.items.length && <Link className="block border-t py-3 text-sm text-primary hover:underline" to={crmScopeLink("/tasks", scope, { bucket: selectedBucket })}>Показать все: {tasks.data.total.toLocaleString("ru-RU")}</Link>}
          </div>
        </section>
        <section className="min-w-0" aria-label="Новые лиды рабочего стола">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold">Новые лиды</h2><Link className="inline-flex items-center gap-1 text-sm text-primary hover:underline" to={crmScopeLink("/leads", scope, { status: "new" })}>Все новые<ArrowRightIcon className="size-4" /></Link></div>
          <div className="border-t">
            {data.newLeads.loading ? <p className="py-8 text-sm text-muted-foreground" role="status">Загрузка лидов...</p>
              : data.newLeads.error ? <RequestError error={data.newLeads.error} onRetry={data.newLeads.retry} />
              : data.newLeads.data?.total === 0 ? <div className="space-y-3 py-8"><p className="text-sm text-muted-foreground">Новых лидов нет</p><Button size="sm" variant="outline" onClick={() => setCreating("lead")}><PlusIcon />Новый лид</Button></div>
              : <div className="divide-y">{data.newLeads.data?.items.map((lead) => <article key={lead._id} className="min-w-0 space-y-2 py-4">
                <Link to={`/leads/${lead._id}`} className="block break-words text-sm font-medium hover:text-primary hover:underline">{lead.title}</Link>
                <p className="break-words text-xs text-muted-foreground">{lead.company?.name || "Без компании"}</p>
                <div className="flex flex-wrap justify-between gap-2 text-xs"><span className={lead.priority === "urgent" || lead.priority === "high" ? "font-medium text-red-700 dark:text-red-300" : "text-muted-foreground"}>{PRIORITY_LABELS[lead.priority]}</span>{ownerNames[lead.ownerId] && <span className="text-muted-foreground">{ownerNames[lead.ownerId]}</span>}</div>
                {lead.nextContactAt && <p className="text-xs text-muted-foreground">Контакт: {formatCrmDate(lead.nextContactAt)} МСК</p>}
              </article>)}</div>}
            {data.newLeads.data && data.newLeads.data.total > data.newLeads.data.items.length && <Link className="block border-t py-3 text-sm text-primary hover:underline" to={crmScopeLink("/leads", scope, { status: "new" })}>Показать все: {data.newLeads.data.total.toLocaleString("ru-RU")}</Link>}
          </div>
        </section>
      </div>
    </div>
    {creating === "lead" && <LeadFormDialog open initialOwnerId={scope.ownerId} onClose={() => setCreating(null)} onSaved={data.refresh} />}
    {creating === "task" && <TaskFormDialog open initialOwnerId={scope.ownerId} onClose={() => setCreating(null)} onSaved={data.refresh} />}
    {editingTask && <TaskFormDialog open task={editingTask} onClose={() => setEditingTask(null)} onSaved={data.refresh} />}
    {completingTask && <TaskActionDialog task={completingTask} onClose={() => setCompletingTask(null)} onSaved={data.refresh} />}
  </Page>;
}
