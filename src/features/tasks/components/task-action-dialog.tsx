import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type TaskDto from "@/definitions/dto/task";
import { updateTask } from "@/services/tasks";
import { useState } from "react";

export default function TaskActionDialog({ task, status = "completed", onClose, onSaved }: {
  task: TaskDto;
  status?: "completed" | "cancelled";
  onClose: () => void;
  onSaved: () => void;
}) {
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await updateTask(task._id, {
        status,
        ...(status === "completed" ? { result: comment.trim() || null } : { comment: comment.trim() || null }),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить задачу");
    } finally { setSaving(false); }
  };
  return <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
    <DialogContent aria-describedby={undefined}>
      <DialogHeader><DialogTitle>{status === "completed" ? "Завершить задачу" : "Отменить задачу"}</DialogTitle></DialogHeader>
      <p className="break-words text-sm">{task.title}</p>
      <Label htmlFor="task-result">{status === "completed" ? "Результат" : "Причина отмены"}</Label>
      <Textarea id="task-result" value={comment} disabled={saving} onChange={(event) => setComment(event.target.value)} />
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" disabled={saving} onClick={onClose}>Назад</Button>
        <Button type="button" disabled={saving} onClick={save}>{saving ? "Сохранение..." : "Подтвердить"}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
