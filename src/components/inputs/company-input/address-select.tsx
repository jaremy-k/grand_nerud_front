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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAuthContext from "@/contexts/auth-context";
import { addressesService } from "@/services";
import { AddressDto } from "@definitions/dto";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function AddressSelect({
  companyId,
  value,
  onChange,
  placeholder = "Выберите адрес",
}: {
  companyId?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const { user } = useAuthContext();
  const canCreate = Boolean(user?.admin || user?.manager);
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [address, setAddress] = useState("");
  const [entrance, setEntrance] = useState("");
  const [typeAdress, setTypeAdress] = useState("Объект");
  const [cityId, setCityId] = useState("");
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!companyId) {
      setAddresses([]);
      return;
    }
    setLoading(true);
    addressesService
      .getAddresses(companyId)
      .then(setAddresses)
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }, [companyId]);

  const resetForm = () => {
    setAddress("");
    setEntrance("");
    setTypeAdress("Объект");
    setCityId("");
    setLongitude("");
    setLatitude("");
    setError("");
  };

  const handleCreate = async () => {
    if (!companyId) return;
    const longitudeValue = Number(longitude);
    const latitudeValue = Number(latitude);
    if (!address.trim() || !typeAdress.trim()) {
      setError("Укажите адрес и его тип");
      return;
    }
    if (!Number.isFinite(longitudeValue) || !Number.isFinite(latitudeValue)) {
      setError("Укажите корректные координаты");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const created = await addressesService.createAddress({
        companyId,
        coordinates: [longitudeValue, latitudeValue],
        cityId: cityId.trim() || undefined,
        adressDetail: {
          address: address.trim(),
          ...(entrance.trim() ? { entrance: entrance.trim() } : {}),
        },
        typeAdress: typeAdress.trim(),
      });
      setAddresses((current) => [...current, created]);
      onChange(created._id);
      setCreating(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать адрес");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onChange} disabled={!companyId || loading}>
        <SelectTrigger className="h-9 min-w-0 flex-1">
          <SelectValue placeholder={loading ? "Загрузка..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {addresses.map((item) => (
            <SelectItem key={item._id} value={item._id}>
              {item.adressDetail?.address || "Адрес без названия"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {canCreate && companyId && (
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="Добавить адрес"
          onClick={() => {
            resetForm();
            setCreating(true);
          }}
        >
          <PlusIcon />
        </Button>
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Новый адрес</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="deal-new-address">Адрес</Label>
              <Input
                id="deal-new-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                disabled={saving}
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="deal-new-address-entrance">Детали въезда</Label>
              <Input
                id="deal-new-address-entrance"
                value={entrance}
                onChange={(event) => setEntrance(event.target.value)}
                disabled={saving}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="deal-new-address-type">Тип адреса</Label>
              <Input
                id="deal-new-address-type"
                value={typeAdress}
                onChange={(event) => setTypeAdress(event.target.value)}
                disabled={saving}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="deal-new-address-city">ID города</Label>
              <Input
                id="deal-new-address-city"
                value={cityId}
                onChange={(event) => setCityId(event.target.value)}
                disabled={saving}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="deal-new-address-longitude">Долгота</Label>
              <Input
                id="deal-new-address-longitude"
                inputMode="decimal"
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
                disabled={saving}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="deal-new-address-latitude">Широта</Label>
              <Input
                id="deal-new-address-latitude"
                inputMode="decimal"
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
                disabled={saving}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreating(false)}
              disabled={saving}
            >
              Отмена
            </Button>
            <Button type="button" onClick={handleCreate} disabled={saving}>
              {saving ? "Сохранение..." : "Добавить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
