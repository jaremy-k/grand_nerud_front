"use client";

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
import { MaterialSelect } from "@/components/inputs/material-input/material-select";
import { companyMaterialsService } from "@/services";
import { CompanyMaterialDto } from "@definitions/dto";
import { PackageIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type FormState = {
  materialId: string;
  price: string;
  unit: string;
  comment: string;
};

const EMPTY_FORM: FormState = {
  materialId: "",
  price: "",
  unit: "т",
  comment: "",
};

const priceFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2,
});

export default function CompanyMaterialsSection({
  companyId,
}: {
  companyId: string;
}) {
  const [items, setItems] = useState<CompanyMaterialDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingItem, setDeletingItem] =
    useState<CompanyMaterialDto | null>(null);
  const [error, setError] = useState("");

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await companyMaterialsService.getCompanyMaterials(companyId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось загрузить прайс-лист"
      );
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
    setError("");
  };

  const openEdit = (item: CompanyMaterialDto) => {
    setEditingId(item._id);
    setForm({
      materialId: item.materialId,
      price: String(item.price),
      unit: item.unit,
      comment: item.comment ?? "",
    });
    setFormOpen(true);
    setError("");
  };

  const handleSave = async () => {
    const price = Number(form.price.replace(",", "."));
    if (!form.materialId || !form.unit.trim() || !Number.isFinite(price)) {
      setError("Выберите материал, укажите цену и единицу измерения");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        companyId,
        materialId: form.materialId,
        price,
        unit: form.unit.trim(),
        comment: form.comment.trim() || undefined,
      };
      if (editingId) {
        await companyMaterialsService.updateCompanyMaterial(editingId, payload);
      } else {
        await companyMaterialsService.createCompanyMaterial(payload);
      }
      await loadItems();
      setFormOpen(false);
      setEditingId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось сохранить позицию"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await companyMaterialsService.deleteCompanyMaterial(deletingItem._id);
      setItems((current) =>
        current.filter((item) => item._id !== deletingItem._id)
      );
      setDeletingItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить позицию");
      setDeletingItem(null);
    }
  };

  return (
    <section className="grid gap-3 border-t pt-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PackageIcon className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Материалы и цены</h3>
        </div>
        {!formOpen && (
          <Button type="button" size="sm" variant="outline" onClick={openCreate}>
            <PlusIcon />
            Добавить
          </Button>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Загрузка...</p>}
      {!loading && items.length === 0 && !formOpen && (
        <p className="text-sm text-muted-foreground">Прайс-лист пока пуст</p>
      )}

      <div className="grid gap-2">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex items-start justify-between gap-3 rounded-md border border-border/60 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {item.material?.name || "Материал"}
              </p>
              <p className="text-sm">
                {priceFormatter.format(item.price)} руб. / {item.unit}
              </p>
              {item.comment && (
                <p className="text-xs text-muted-foreground">{item.comment}</p>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label="Редактировать позицию"
                onClick={() => openEdit(item)}
              >
                <PencilIcon />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label="Удалить позицию"
                onClick={() => setDeletingItem(item)}
              >
                <Trash2Icon />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {formOpen && (
        <div className="grid gap-3 rounded-md border border-border/60 bg-muted/20 p-3">
          <p className="text-sm font-medium">
            {editingId ? "Редактирование позиции" : "Новая позиция"}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5 sm:col-span-2">
              <Label>Материал</Label>
              <MaterialSelect
                value={form.materialId}
                onChange={(materialId) =>
                  setForm((current) => ({ ...current, materialId }))
                }
                disabled={saving}
                name="company-material"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="company-material-price">Цена</Label>
              <Input
                id="company-material-price"
                inputMode="decimal"
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                disabled={saving}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="company-material-unit">Единица измерения</Label>
              <Input
                id="company-material-unit"
                value={form.unit}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    unit: event.target.value,
                  }))
                }
                disabled={saving}
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="company-material-comment">Комментарий</Label>
              <Input
                id="company-material-comment"
                value={form.comment}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    comment: event.target.value,
                  }))
                }
                disabled={saving}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => setFormOpen(false)}
            >
              Отмена
            </Button>
            <Button type="button" disabled={saving} onClick={handleSave}>
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <AlertDialog
        open={deletingItem !== null}
        onOpenChange={(open) => !open && setDeletingItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить позицию?</AlertDialogTitle>
            <AlertDialogDescription>
              Материал исчезнет из активного прайс-листа компании.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Удалить
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
