"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { materialsService } from "@/services";
import { MaterialDto } from "@definitions/dto";
import { FormEvent, useState } from "react";

export function CreateMaterialDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (material: MaterialDto) => void;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
    setName("");
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Введите название материала");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const created = await materialsService.createMaterial({ name: trimmed });
      onCreated(created);
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось создать материал"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новый материал</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="material-name">
              Название <span className="text-destructive">*</span>
            </Label>
            <Input
              id="material-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Щебень фракция 5–20"
              disabled={submitting}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={handleClose}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Сохранение…" : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
