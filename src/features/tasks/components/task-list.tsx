import { Pagination } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { formatCrmDate, TASK_STATUS_LABELS, TASK_TYPE_LABELS } from "@/features/crm/utils";
import type TaskDto from "@/definitions/dto/task";
import type { PaginatedResult } from "@/definitions/dto/lead";
import { deleteTask, getTasks, updateTask, TaskFilters } from "@/services/tasks";
import { CheckIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TaskFormDialog, { TaskContext } from "./task-form-dialog";

export default function TaskList({ filters = {}, context, onChanged, ownerNames = {}, companyNames = {} }: {
  filters?: TaskFilters; context?: TaskContext; onChanged?: () => void;
  ownerNames?: Record<string, string>; companyNames?: Record<string, string>;
}) {
  const [result, setResult] = useState<PaginatedResult<TaskDto> | null>(null);
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TaskDto | null>(null);
  const [action, setAction] = useState<{ task: TaskDto; status: "completed" | "cancelled" } | null>(null);
  const [deleting, setDeleting] = useState<TaskDto | null>(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const filterKey = JSON.stringify(filters);
  useEffect(() => { setPage(1); }, [filterKey]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    getTasks({ ...JSON.parse(filterKey), page, pageSize: 25 }, { signal: controller.signal }).then((data) => {
      if (!controller.signal.aborted) {
        setResult(data);
        if (page > Math.max(1, data.totalPages)) setPage(Math.max(1, data.totalPages));
      }
    }).catch((err) => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Не удалось загрузить задачи"); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filterKey, page, revision]);
  const changed = () => { setRevision((value) => value + 1); onChanged?.(); };
  const performAction = async () => {
    if (!action) return;
    setSaving(true); setError("");
    try {
      await updateTask(action.task._id, { status: action.status,
        ...(action.status === "completed" ? { result: comment.trim() || null } : { comment: comment.trim() || null }) });
      setAction(null); changed();
    } catch (err) { setError(err instanceof Error ? err.message : "Не удалось обновить задачу"); }
    finally { setSaving(false); }
  };
  const remove = async () => {
    if (!deleting) return;
    setSaving(true); setError("");
    try { await deleteTask(deleting._id); setDeleting(null); changed(); }
    catch (err) { setError(err instanceof Error ? err.message : "Не удалось удалить задачу"); setDeleting(null); }
    finally { setSaving(false); }
  };
  return (
    <section className="grid min-w-0 gap-3">
      <div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Задач: {result?.total ?? 0}</p><Button type="button" size="sm" onClick={() => setCreating(true)}><PlusIcon />Новая задача</Button></div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      {loading ? <p className="py-6 text-center text-sm text-muted-foreground">Загрузка...</p> : <div className="divide-y border-y">
        {result?.items.map((task) => <article key={task._id} className="grid gap-3 py-3 sm:grid-cols-[1fr_auto]">
          <div className="min-w-0 space-y-1">
            <p className="break-words text-sm font-medium">{task.title}</p>
            <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground"><span className={task.status === "open" && new Date(task.dueAt).getTime() < Date.now() ? "text-red-700 dark:text-red-300" : ""}>{formatCrmDate(task.dueAt)} МСК</span><span>{TASK_TYPE_LABELS[task.type]}</span><span>{TASK_STATUS_LABELS[task.status]}</span>{ownerNames[task.ownerId] && <span>{ownerNames[task.ownerId]}</span>}</p>
            <div className="flex flex-wrap gap-3 text-xs">{(task.company?.name || (task.companyId && companyNames[task.companyId])) && <span className="text-muted-foreground">{task.company?.name || companyNames[task.companyId!]}</span>}{task.leadId && <Link className="text-primary hover:underline" to={`/leads/${task.leadId}`}>{task.lead?.title || "Открыть лид"}</Link>}{task.dealId && <Link className="text-primary hover:underline" to={`/deals/${task.dealId}`}>Открыть сделку</Link>}</div>
            {task.comment && <p className="whitespace-pre-wrap break-words text-xs text-muted-foreground">{task.comment}</p>}
            {task.result && <p className="whitespace-pre-wrap break-words text-xs">Результат: {task.result}</p>}
          </div>
          <div className="flex items-start gap-1">
            {task.status === "open" && <><Button type="button" size="icon-sm" variant="ghost" title="Завершить" aria-label="Завершить задачу" onClick={() => { setComment(""); setAction({ task, status: "completed" }); }}><CheckIcon /></Button><Button type="button" size="icon-sm" variant="ghost" title="Отменить" aria-label="Отменить задачу" onClick={() => { setComment(""); setAction({ task, status: "cancelled" }); }}><XIcon /></Button><Button type="button" size="icon-sm" variant="ghost" title="Редактировать" aria-label="Редактировать задачу" onClick={() => setEditing(task)}><PencilIcon /></Button></>}
            <Button type="button" size="icon-sm" variant="ghost" title="Удалить" aria-label="Удалить задачу" onClick={() => setDeleting(task)}><Trash2Icon /></Button>
          </div>
        </article>)}
        {!result?.items.length && <p className="py-8 text-center text-sm text-muted-foreground">Задачи не найдены</p>}
      </div>}
      {result && <Pagination total={result.totalPages} current={page} onClick={setPage} />}
      {creating && <TaskFormDialog open onClose={() => setCreating(false)} onSaved={changed} context={context} />}
      {editing && <TaskFormDialog open task={editing} context={context} onClose={() => setEditing(null)} onSaved={changed} />}
      <Dialog open={Boolean(action)} onOpenChange={(open) => !open && !saving && setAction(null)}><DialogContent><DialogHeader><DialogTitle>{action?.status === "completed" ? "Завершить задачу" : "Отменить задачу"}</DialogTitle></DialogHeader><p className="text-sm">{action?.task.title}</p><Label htmlFor="task-result">{action?.status === "completed" ? "Результат" : "Причина отмены"}</Label><Textarea id="task-result" value={comment} onChange={(e) => setComment(e.target.value)} />{error && <p className="text-sm text-destructive">{error}</p>}<DialogFooter><Button type="button" variant="outline" disabled={saving} onClick={() => setAction(null)}>Назад</Button><Button type="button" disabled={saving} onClick={performAction}>{saving ? "Сохранение..." : "Подтвердить"}</Button></DialogFooter></DialogContent></Dialog>
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && !saving && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Удалить задачу?</AlertDialogTitle><AlertDialogDescription>{deleting?.title}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={saving}>Отмена</AlertDialogCancel><Button variant="destructive" disabled={saving} onClick={remove}>Удалить</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </section>
  );
}
