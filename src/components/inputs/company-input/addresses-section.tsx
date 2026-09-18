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
import useAuthContext from "@/contexts/auth-context";
import { addressesService } from "@/services";
import { AddressDto } from "@definitions/dto";
import { MapPinIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";

type AddressFormState = {
  address: string;
  entrance: string;
  typeAdress: string;
  cityId: string;
  longitude: string;
  latitude: string;
};

const EMPTY_FORM: AddressFormState = {
  address: "",
  entrance: "",
  typeAdress: "Объект",
  cityId: "",
  longitude: "",
  latitude: "",
};

export default function AddressesSection({ companyId }: { companyId: string }) {
  const { user } = useAuthContext();
  const canEdit = Boolean(user?.admin || user?.manager);
  const canDelete = Boolean(user?.admin);
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<AddressFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingAddress, setDeletingAddress] = useState<AddressDto | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    addressesService
      .getAddresses(companyId)
      .then(setAddresses)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Не удалось загрузить адреса")
      )
      .finally(() => setLoading(false));
  }, [companyId]);

  const updateField = (key: keyof AddressFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
    setError("");
  };

  const openEditForm = (address: AddressDto) => {
    setEditingId(address._id);
    setForm({
      address: address.adressDetail?.address ?? "",
      entrance: String(address.adressDetail?.entrance ?? ""),
      typeAdress: address.typeAdress ?? "Объект",
      cityId: address.cityId ?? "",
      longitude: String(address.coordinates?.[0] ?? ""),
      latitude: String(address.coordinates?.[1] ?? ""),
    });
    setFormOpen(true);
    setError("");
  };

  const handleSave = async () => {
    const longitude = Number(form.longitude);
    const latitude = Number(form.latitude);
    if (!form.address.trim() || !form.typeAdress.trim()) {
      setError("Укажите адрес и его тип");
      return;
    }
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      setError("Укажите корректные координаты");
      return;
    }

    const data = {
      coordinates: [longitude, latitude] as [number, number],
      cityId: form.cityId.trim() || undefined,
      adressDetail: {
        address: form.address.trim(),
        ...(form.entrance.trim() ? { entrance: form.entrance.trim() } : {}),
      },
      typeAdress: form.typeAdress.trim(),
    };

    setSaving(true);
    setError("");
    try {
      if (editingId) {
        const updated = await addressesService.updateAddress(editingId, data);
        setAddresses((current) =>
          current.map((item) => (item._id === updated._id ? updated : item))
        );
      } else {
        const created = await addressesService.createAddress({
          ...data,
          companyId,
        });
        setAddresses((current) => [...current, created]);
      }
      setFormOpen(false);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить адрес");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAddress) return;
    setError("");
    try {
      await addressesService.deleteAddress(deletingAddress._id);
      setAddresses((current) =>
        current.filter((item) => item._id !== deletingAddress._id)
      );
      setDeletingAddress(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось удалить адрес"
      );
      setDeletingAddress(null);
    }
  };

  return (
    <section className="grid gap-3 border-t pt-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPinIcon className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Адреса</h3>
        </div>
        {canEdit && !formOpen && (
          <Button type="button" size="sm" variant="outline" onClick={openCreateForm}>
            <PlusIcon />
            Добавить
          </Button>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Загрузка...</p>}
      {!loading && addresses.length === 0 && !formOpen && (
        <p className="text-sm text-muted-foreground">Адреса не добавлены</p>
      )}
      <div className="grid gap-2">
        {addresses.map((address) => (
          <div
            key={address._id}
            className="flex items-start justify-between gap-3 rounded-md border border-border/60 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {address.adressDetail?.address || "Адрес не указан"}
              </p>
              <p className="text-xs text-muted-foreground">
                {address.typeAdress}
                {address.adressDetail?.entrance
                  ? ` · ${String(address.adressDetail.entrance)}`
                  : ""}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {address.coordinates?.join(", ")}
              </p>
            </div>
            {(canEdit || canDelete) && (
              <div className="flex shrink-0 gap-1">
                {canEdit && (
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Редактировать адрес"
                    onClick={() => openEditForm(address)}
                  >
                    <PencilIcon />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Удалить адрес"
                    onClick={() => setDeletingAddress(address)}
                  >
                    <Trash2Icon />
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {canEdit && formOpen && (
        <div className="grid gap-3 rounded-md border border-border/60 bg-muted/20 p-3">
          <p className="text-sm font-medium">
            {editingId ? "Редактирование адреса" : "Новый адрес"}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="company-address">Адрес</Label>
              <Input
                id="company-address"
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
                disabled={saving}
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="company-address-entrance">Детали въезда</Label>
              <Input
                id="company-address-entrance"
                value={form.entrance}
                onChange={(event) => updateField("entrance", event.target.value)}
                disabled={saving}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="company-address-type">Тип адреса</Label>
              <Input
                id="company-address-type"
                value={form.typeAdress}
                onChange={(event) => updateField("typeAdress", event.target.value)}
                disabled={saving}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="company-address-city">ID города</Label>
              <Input
                id="company-address-city"
                value={form.cityId}
                onChange={(event) => updateField("cityId", event.target.value)}
                disabled={saving}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="company-address-longitude">Долгота</Label>
              <Input
                id="company-address-longitude"
                inputMode="decimal"
                value={form.longitude}
                onChange={(event) => updateField("longitude", event.target.value)}
                disabled={saving}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="company-address-latitude">Широта</Label>
              <Input
                id="company-address-latitude"
                inputMode="decimal"
                value={form.latitude}
                onChange={(event) => updateField("latitude", event.target.value)}
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
              {saving ? "Сохранение..." : "Сохранить адрес"}
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <AlertDialog
        open={deletingAddress !== null}
        onOpenChange={(nextOpen) => !nextOpen && setDeletingAddress(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить адрес?</AlertDialogTitle>
            <AlertDialogDescription>
              Адрес будет удалён, если он не используется в активной сделке.
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
