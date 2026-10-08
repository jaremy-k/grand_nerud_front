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
  const [lookupSuccess, setLookupSuccess] = useState(false);

  const [inn, setInn] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [abbreviatedName, setAbbreviatedName] = useState<string>("");
  const [kpp, setKpp] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [contacts, setContacts] = useState<Record<string, unknown>[]>([]);
  const [contactPersons, setContactPersons] = useState<ContactPerson[]>([]);

  const handleLoadData = () => {
    setSearching(true);
    setError("");
    setLookupSuccess(false);
    companiesService
      .getCompanyInfoByINN(inn)
      .then((res) => {
        if (!res?.name) {
          setError(
            `Компания с ИНН ${inn.replace(/\D/g, "")} не найдена. Заполните данные вручную.`
          );
          return;
        }
        setName(res.name);
        setAbbreviatedName(res.abbreviatedName ?? "");
        setContacts(res.contacts ?? []);
        setKpp(res.kpp ?? "");
        setLookupSuccess(true);
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
    if (!name.trim()) {
      setError("Название компании обязательно");
      return;
    }
    if (!inn.trim()) {
      setError("ИНН обязателен для юридического лица");
      return;
    }
    if (!isValidContactPersons(contactPersons)) {
      setError("Укажите имя и корректный email для каждого контактного лица");
      return;
    }

    onSubmit({
      type: "Юридическое лицо",
      name: name.trim(),
      abbreviatedName: abbreviatedName.trim(),
      inn: inn.trim(),
      kpp: kpp.trim(),
      roles,
      contacts,
      contactPersons,
      comment: comment.trim(),
    });
  };

  return (
    <>
      <div className="grid gap-4">
        <div className="grid gap-3">
          <Label htmlFor="inn" className="gap-0.5">
            ИНН <span className="text-destructive">*</span>
          </Label>
          <Input
            value={inn}
            onChange={(e) => {
              setInn(e.target.value);
              setLookupSuccess(false);
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
          className="-mt-1.5 justify-self-start"
        >
          {searching ? "Поиск..." : "Заполнить по ИНН"}
        </Button>
        {lookupSuccess && (
          <p className="text-sm text-emerald-700" role="status">
            Данные компании заполнены. Их можно изменить вручную.
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <div className="grid gap-3">
          <Label htmlFor="company-name" className="gap-0.5">
            Название компании <span className="text-destructive">*</span>
          </Label>
          <Input
            id="company-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError("");
            }}
            disabled={disabled || searching}
            name="name"
            autoComplete="off"
          />
        </div>
        {withShortName && (
          <div className="grid gap-3">
            <Label htmlFor="abbreviated-name" className="gap-0.5">
              Короткое название
            </Label>
            <Input
              id="abbreviated-name"
              value={abbreviatedName}
              onChange={(event) => setAbbreviatedName(event.target.value)}
              disabled={disabled || searching}
              name="abbreviated-name"
              autoComplete="off"
            />
          </div>
        )}
        <div className="grid gap-3">
          <Label htmlFor="kpp" className="gap-0.5">
            КПП
          </Label>
          <Input
            id="kpp"
            value={kpp}
            onChange={(event) => setKpp(event.target.value)}
            disabled={disabled || searching}
            name="kpp"
            autoComplete="off"
          />
        </div>
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
          disabled={disabled || searching}
          type="button"
          onClick={handleSubmit}
        >
          Сохранить
        </Button>
      </DialogFooter>
    </>
  );
}
