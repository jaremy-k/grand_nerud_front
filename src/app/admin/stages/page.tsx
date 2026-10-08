"use client";

import { Page } from "@/components/blocks";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { stagesService } from "@/services";
import { StageDto } from "@definitions/dto";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PencilIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

function sortStages(items: StageDto[]): StageDto[] {
  return [...items].sort((left, right) => {
    const orderDifference =
      (left.order ?? Number.MAX_SAFE_INTEGER) -
      (right.order ?? Number.MAX_SAFE_INTEGER);
    return orderDifference || left.name.localeCompare(right.name, "ru");
  });
}

export default function AdminStagesPage() {
  const [stages, setStages] = useState<StageDto[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deletingStage, setDeletingStage] = useState<StageDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadStages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const items = await stagesService.getStages();
      setStages(sortStages(items.filter((stage) => !stage.is_deleted)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить этапы");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStages();
  }, [loadStages]);

  const handleCreate = async () => {
    if (!newName.trim()) {
      setError("Введите название этапа");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await stagesService.createStage({
        name: newName.trim(),
        order:
          stages.reduce(
            (maximum, stage) => Math.max(maximum, stage.order ?? -1),
            -1
          ) + 1,
      });
      setNewName("");
      await loadStages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать этап");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (stage: StageDto) => {
    setEditingId(stage._id);
    setEditingName(stage.name);
    setError("");
  };

  const handleSave = async () => {
    if (!editingId || !editingName.trim()) {
      setError("Название этапа не может быть пустым");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await stagesService.updateStage(editingId, { name: editingName.trim() });
      setEditingId(null);
      await loadStages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить этап");
    } finally {
      setSaving(false);
    }
  };

  const moveStage = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= stages.length) return;
    const current = stages[index];
    const target = stages[targetIndex];
    const currentOrder = current.order ?? index;
    const targetOrder = target.order ?? targetIndex;
    setSaving(true);
    setError("");
    try {
      await Promise.all([
        stagesService.updateStage(current._id, { order: targetOrder }),
        stagesService.updateStage(target._id, { order: currentOrder }),
      ]);
      await loadStages();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось изменить порядок"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStage) return;
    setSaving(true);
    setError("");
    try {
      await stagesService.deleteStage(deletingStage._id);
      setDeletingStage(null);
      await loadStages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить этап");
      setDeletingStage(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page
      breadcrumbLinks={[
        { label: "Управление этапами", href: "/admin/stages" },
      ]}
    >
      <div className="grid gap-6 py-4">
        <section className="grid max-w-xl gap-2">
          <Label htmlFor="new-stage-name">Новый этап</Label>
          <div className="flex gap-2">
            <Input
              id="new-stage-name"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void handleCreate();
              }}
              placeholder="Название этапа"
              disabled={saving}
            />
            <Button type="button" onClick={handleCreate} disabled={saving}>
              <PlusIcon />
              Добавить
            </Button>
          </div>
        </section>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {loading && (
          <p className="py-10 text-center text-muted-foreground">Загрузка...</p>
        )}
        {!loading && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Порядок</TableHead>
                <TableHead>Название</TableHead>
                <TableHead className="w-36">
                  <span className="sr-only">Действия</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stages.map((stage, index) => (
                <TableRow key={stage._id}>
                  <TableCell className="text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    {editingId === stage._id ? (
                      <Input
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") void handleSave();
                        }}
                        disabled={saving}
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium">{stage.name}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {editingId === stage._id ? (
                        <>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Сохранить этап"
                            disabled={saving}
                            onClick={handleSave}
                          >
                            <SaveIcon />
                          </Button>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Отменить редактирование"
                            disabled={saving}
                            onClick={() => setEditingId(null)}
                          >
                            <XIcon />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Поднять этап"
                            disabled={saving || index === 0}
                            onClick={() => void moveStage(index, -1)}
                          >
                            <ArrowUpIcon />
                          </Button>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Опустить этап"
                            disabled={saving || index === stages.length - 1}
                            onClick={() => void moveStage(index, 1)}
                          >
                            <ArrowDownIcon />
                          </Button>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Редактировать этап"
                            disabled={saving}
                            onClick={() => startEditing(stage)}
                          >
                            <PencilIcon />
                          </Button>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Удалить этап"
                            disabled={saving}
                            onClick={() => setDeletingStage(stage)}
                          >
                            <Trash2Icon />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {stages.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="h-32 text-center text-muted-foreground"
                  >
                    Этапы не добавлены
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <AlertDialog
        open={deletingStage !== null}
        onOpenChange={(open) => !open && setDeletingStage(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить этап?</AlertDialogTitle>
            <AlertDialogDescription>
              Этап нельзя будет выбрать для новых сделок. Если он используется,
              сервер может запретить удаление.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Отмена</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={saving}
              onClick={handleDelete}
            >
              Удалить
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
}
