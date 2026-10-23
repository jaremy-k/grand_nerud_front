import { Pagination } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { formatCrmDate, TASK_STATUS_LABELS, TASK_TYPE_LABELS } from "@/features/crm/utils";
import type TaskDto from "@/definitions/dto/task";
import type { PaginatedResult } from "@/definitions/dto/lead";
import { deleteTask, getTasks, TaskFilters } from "@/services/tasks";
import { crmQuery } from "@/services/crm-query";
import { useLatestRequest } from "@/hooks/use-latest-request";
import RequestError from "@/features/crm/request-error";
import { useCompanyNames } from "@/features/crm/use-company-names";
import { CheckIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TaskFormDialog, { TaskContext } from "./task-form-dialog";
import TaskActionDialog from "./task-action-dialog";

type TaskListProps = {
  filters?: TaskFilters; context?: TaskContext; onChanged?: () => void;
  ownerNames?: Record<string, string>; companyNames?: Record<string, string>;
  filtered?: boolean; onResetFilters?: () => void; emptyMessage?: string; initialOwnerId?: string;
};
type TaskQuery = { filters: TaskFilters; page: number };
const loadTasks = (query: TaskQuery, signal: AbortSignal): Promise<PaginatedResult<TaskDto>> =>
  getTasks({ ...query.filters, page: query.page, pageSize: 25 }, { signal });

export default function TaskList(props: TaskListProps) {
  return <TaskListContent key={crmQuery(props.filters ?? {})} {...props} />;
}

function TaskListContent({ filters = {}, context, onChanged, ownerNames = {}, companyNames = {}, filtered, onResetFilters, emptyMessage, initialOwnerId }: TaskListProps) {
  // A new filter key remounts this list, including its pagination and dialogs.
  const [initialFilters] = useState(filters);
  const [page, setPage] = useState(1);
  const query = useMemo(() => ({ filters: initialFilters, page }), [initialFilters, page]);
  const request = useLatestRequest(query, loadTasks);
  const { data: result, loading } = request;
  const names = useCompanyNames((result?.items ?? []).filter((task) => !task.company?.name).map((task) => task.companyId || ""));
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TaskDto | null>(null);
  const [action, setAction] = useState<{ task: TaskDto; status: "completed" | "cancelled" } | null>(null);
  const [deleting, setDeleting] = useState<TaskDto | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (result && page > Math.max(1, result.totalPages)) setPage(Math.max(1, result.totalPages));
  }, [result, page]);
  const changed = () => { request.retry(); onChanged?.(); };
  const remove = async () => {
    if (!deleting) return;
    setSaving(true); setError("");
    try { await deleteTask(deleting._id); setDeleting(null); changed(); }
    catch (err) { setError(err instanceof Error ? err.message : "Не удалось удалить задачу"); setDeleting(null); }
    finally { setSaving(false); }
  };
  return (
    <section className="grid min-w-0 gap-3">
      <div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{result ? `Задач: ${result.total}` : "Задачи"}</p><Button type="button" size="sm" onClick={() => setCreating(true)}><PlusIcon />Новая задача</Button></div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      {loading ? <p className="py-6 text-center text-sm text-muted-foreground" role="status">Загрузка...</p> : request.error ? <RequestError error={request.error} onRetry={request.retry} /> : <div className="divide-y border-y">
        {result?.items.map((task) => <article key={task._id} className="grid gap-3 py-3 sm:grid-cols-[1fr_auto]">
          <div className="min-w-0 space-y-1">
            <p className="break-words text-sm font-medium">{task.title}</p>
            <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground"><span className={task.status === "open" && new Date(task.dueAt).getTime() < Date.now() ? "text-red-700 dark:text-red-300" : ""}>{formatCrmDate(task.dueAt)} МСК</span><span>{TASK_TYPE_LABELS[task.type]}</span><span>{TASK_STATUS_LABELS[task.status]}</span>{ownerNames[task.ownerId] && <span>{ownerNames[task.ownerId]}</span>}</p>
            <div className="flex flex-wrap gap-3 text-xs">{task.companyId && <Link className="text-primary hover:underline" to={`/companies/${task.companyId}`}>{task.company?.name || companyNames[task.companyId] || names.data?.[task.companyId] || "Открыть компанию"}</Link>}{task.leadId && <Link className="text-primary hover:underline" to={`/leads/${task.leadId}`}>{task.lead?.title || "Открыть лид"}</Link>}{task.dealId && <Link className="text-primary hover:underline" to={`/deals/${task.dealId}`}>Открыть сделку</Link>}</div>
            {task.comment && <p className="whitespace-pre-wrap break-words text-xs text-muted-foreground">{task.comment}</p>}
            {task.result && <p className="whitespace-pre-wrap break-words text-xs">Результат: {task.result}</p>}
          </div>
          <div className="flex items-start gap-1">
            {task.status === "open" && <><Button type="button" size="icon-sm" variant="ghost" title="Завершить" aria-label="Завершить задачу" onClick={() => setAction({ task, status: "completed" })}><CheckIcon /></Button><Button type="button" size="icon-sm" variant="ghost" title="Отменить" aria-label="Отменить задачу" onClick={() => setAction({ task, status: "cancelled" })}><XIcon /></Button><Button type="button" size="icon-sm" variant="ghost" title="Редактировать" aria-label="Редактировать задачу" onClick={() => setEditing(task)}><PencilIcon /></Button></>}
            <Button type="button" size="icon-sm" variant="ghost" title="Удалить" aria-label="Удалить задачу" onClick={() => setDeleting(task)}><Trash2Icon /></Button>
          </div>
        </article>)}
        {result?.total === 0 && <div className="space-y-3 py-8 text-center"><p className="text-sm text-muted-foreground">{filtered ? "Задачи не найдены" : emptyMessage || "Задач пока нет"}</p>{filtered && onResetFilters ? <Button type="button" size="sm" variant="outline" onClick={onResetFilters}>Сбросить фильтры</Button> : <Button type="button" size="sm" variant="outline" onClick={() => setCreating(true)}><PlusIcon />Новая задача</Button>}</div>}
      </div>}
      {result && !loading && !request.error && <Pagination total={result.totalPages} current={page} onClick={setPage} />}
      {creating && <TaskFormDialog open onClose={() => setCreating(false)} onSaved={changed} context={context} initialOwnerId={initialOwnerId} />}
      {editing && <TaskFormDialog open task={editing} context={context} onClose={() => setEditing(null)} onSaved={changed} />}
      {action && <TaskActionDialog task={action.task} status={action.status} onClose={() => setAction(null)} onSaved={changed} />}
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && !saving && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Удалить задачу?</AlertDialogTitle><AlertDialogDescription>{deleting?.title}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={saving}>Отмена</AlertDialogCancel><Button variant="destructive" disabled={saving} onClick={remove}>Удалить</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </section>
  );
}
