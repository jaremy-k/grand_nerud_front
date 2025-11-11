import { companiesService } from "@/services";
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
}: {
  disabled?: boolean;
  withShortName?: boolean;
  onSubmit?: (data: CreateCompanyRequest) => void;
  onCancel?: () => void;
}) {
  const [searching, setSearching] = useState<boolean>(false);

  const [inn, setInn] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [abbreviatedName, setAbbreviatedName] = useState<string>("");
  const [type, setType] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [contacts, setContacts] = useState<any[]>([]);

  const handleLoadData = () => {
    setSearching(true);
    companiesService
      .getCompanyInfoByINN(inn)
      .then((res) => {
        setName(res.name);
        setAbbreviatedName(res.abbreviatedName);
        setContacts(res.contacts);
        setType(res.type);
      })
      .finally(() => setSearching(false));
  };

  const handleSubmit = () => {
    onSubmit({
      type,
      name,
      abbreviatedName,
      inn,
      contacts,
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
            onChange={(e) => setInn(e.target.value)}
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
                defaultValue={contact[key]}
                disabled
                name={key}
                autoComplete="off"
              />
            </div>
          );
        })}
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
