import { companiesService } from "@/services";
import { CompanyRole } from "@definitions/dto";
import { CreateCompanyRequest } from "@definitions/requests";
import { useState } from "react";
import { Button } from "../../ui/button";
import { DialogClose, DialogFooter } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

export default function InnProviderForm({
  disabled = false,
  withShortName = false,
  onSubmit = () => {},
  onCancel = () => {},
  roles,
}: {
  disabled?: boolean;
  withShortName?: boolean;
  onSubmit?: (data: CreateCompanyRequest) => void;
  onCancel?: () => void;
  roles: CompanyRole[];
}) {
  const [searching, setSearching] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [inn, setInn] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [abbreviatedName, setAbbreviatedName] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [kpp, setKpp] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [contacts, setContacts] = useState<Record<string, unknown>[]>([]);

  const resetFields = () => {
    setName("");
    setAbbreviatedName("");
    setType("");
    setKpp("");
    setComment("");
    setContacts([]);
  };

  const handleLoadData = () => {
    setSearching(true);
    setError("");
    resetFields();
    companiesService
      .getCompanyInfoByINN(inn)
      .then((res) => {
        if (!res?.name) {
          setError(
            `Компания с ИНН ${inn.replace(/\D/g, "")} не найдена. Проверьте номер или добавьте клиента как физическое лицо.`
          );
          return;
        }
        setName(res.name);
        setAbbreviatedName(res.abbreviatedName ?? "");
        setContacts(res.contacts);
        setType(res.type ?? "");
        setKpp(res.kpp ?? "");
        setComment(res.comment ?? "");
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Не удалось найти компанию по ИНН"
        );
      })
      .finally(() => setSearching(false));
  };

  const handleSubmit = () => {
    onSubmit({
      type,
      name,
      abbreviatedName,
      inn,
      kpp,
      roles,
      contacts,
      comment,
    });
  };

  return (
    <>
      <div className="grid gap-4">
        <div className="grid gap-3">
          <Label htmlFor="inn" className="gap-0.5">
            ИНН<span className="text-red-600">*</span>
          </Label>
          <Input
            value={inn}
            onChange={(e) => {
              setInn(e.target.value);
              if (error) setError("");
            }}
            disabled={disabled || searching}
            name="inn"
            autoComplete="off"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={disabled || searching}
          onClick={handleLoadData}
          className="-mt-1.5"
        >
          Найти
        </Button>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {name && (
          <div className="grid gap-3">
            <Label htmlFor="name" className="gap-0.5">
              Название
            </Label>
            <Input
              defaultValue={name}
              disabled
              name="name"
              autoComplete="off"
            />
          </div>
        )}
        {abbreviatedName && withShortName && (
          <div className="grid gap-3">
            <Label htmlFor="abbreviated-name" className="gap-0.5">
              Короткое название
            </Label>
            <Input
              defaultValue={abbreviatedName}
              disabled
              name="abbreviated-name"
              autoComplete="off"
            />
          </div>
        )}
        {kpp && (
          <div className="grid gap-3">
            <Label htmlFor="kpp" className="gap-0.5">
              КПП
            </Label>
            <Input value={kpp} disabled name="kpp" autoComplete="off" />
          </div>
        )}
        {contacts.map((contact, idx) => {
          const key = Object.keys(contact)[0];
          let fieldName = key === "address" ? "Адрес" : key;
          fieldName = fieldName === "email" ? "Почта" : fieldName;
          fieldName = fieldName === "director" ? "Директор" : fieldName;

          return (
            <div key={`${idx}-${key}`} className="grid gap-3">
              <Label htmlFor={key} className="gap-0.5">
                {fieldName}
              </Label>
              <Input
                defaultValue={String(contact[key] ?? "")}
                disabled
                name={key}
                autoComplete="off"
              />
            </div>
          );
        })}
        <div className="grid gap-3">
          <Label htmlFor="comment" className="gap-0.5">
            Комментарий
          </Label>
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={disabled || searching}
            name="comment"
            autoComplete="off"
          />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button
            disabled={disabled}
            onClick={onCancel}
            type="button"
            variant="outline"
          >
            Отмена
          </Button>
        </DialogClose>
        <Button
          disabled={disabled || name.trim().length === 0}
          type="button"
          onClick={handleSubmit}
        >
          Сохранить
        </Button>
      </DialogFooter>
    </>
  );
}
