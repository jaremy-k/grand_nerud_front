import { companiesService } from "@/services";
import { CompanyRole, ContactPerson } from "@definitions/dto";
import { CreateCompanyRequest } from "@definitions/requests";
import { useState } from "react";
import { Button } from "../../ui/button";
import { DialogClose, DialogFooter } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import ContactPersonsEditor, {
  isValidContactPersons,
} from "./contact-persons-editor";

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
  const [contactPersons, setContactPersons] = useState<ContactPerson[]>([]);

  const resetFields = () => {
    setName("");
    setAbbreviatedName("");
    setType("");
    setKpp("");
    setComment("");
    setContacts([]);
    setContactPersons([]);
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
        setContactPersons(res.contactPersons ?? []);
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
    if (!isValidContactPersons(contactPersons)) {
      setError("Укажите имя и корректный email для каждого контрагента");
      return;
    }

    onSubmit({
      type,
      name,
      abbreviatedName,
      inn,
      kpp,
      roles,
      contacts,
      contactPersons,
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
        {contacts.length > 0 && (
          <details className="rounded-md border border-border/50 px-3 py-2 text-muted-foreground">
            <summary className="cursor-pointer text-xs font-medium">
              Контакт карточки
            </summary>
            <dl className="mt-2 grid gap-1.5 text-xs">
              {contacts.flatMap((contact, contactIndex) =>
                Object.entries(contact).map(([key, value]) => (
                  <div key={`${contactIndex}-${key}`} className="flex gap-2">
                    <dt className="font-medium">{key}:</dt>
                    <dd>{String(value ?? "")}</dd>
                  </div>
                ))
              )}
            </dl>
          </details>
        )}
        <ContactPersonsEditor
          value={contactPersons}
          onChange={(value) => {
            setContactPersons(value);
            if (error) setError("");
          }}
          disabled={disabled || searching}
        />
        <div className="grid gap-3">
          <Label htmlFor="comment" className="gap-0.5">
            Комментарий
          </Label>
          <Textarea
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
