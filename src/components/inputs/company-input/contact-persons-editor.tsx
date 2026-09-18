import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ContactPerson } from "@definitions/dto";
import { PlusIcon, Trash2Icon } from "lucide-react";

const EMPTY_CONTACT_PERSON: ContactPerson = { name: "" };

export function isValidContactPersons(contactPersons: ContactPerson[]) {
  return contactPersons.every(
    (person) =>
      person.name.trim().length > 0 &&
      (!person.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email))
  );
}

export default function ContactPersonsEditor({
  value,
  onChange,
  disabled = false,
}: {
  value: ContactPerson[];
  onChange: (value: ContactPerson[]) => void;
  disabled?: boolean;
}) {
  const updatePerson = (
    index: number,
    key: keyof ContactPerson,
    fieldValue: string
  ) => {
    onChange(
      value.map((person, personIndex) =>
        personIndex === index ? { ...person, [key]: fieldValue } : person
      )
    );
  };

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <Label>Контрагенты</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => onChange([...value, { ...EMPTY_CONTACT_PERSON }])}
        >
          <PlusIcon />
          Добавить
        </Button>
      </div>

      {value.map((person, index) => (
        <div
          key={index}
          className="grid gap-3 rounded-md border border-border/60 bg-muted/20 p-3"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Контрагент {index + 1}</p>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              disabled={disabled}
              aria-label="Удалить контрагента"
              onClick={() =>
                onChange(value.filter((_, personIndex) => personIndex !== index))
              }
            >
              <Trash2Icon />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor={`contact-person-name-${index}`}>
                Имя <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`contact-person-name-${index}`}
                value={person.name}
                disabled={disabled}
                required
                onChange={(event) =>
                  updatePerson(index, "name", event.target.value)
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`contact-person-position-${index}`}>
                Должность
              </Label>
              <Input
                id={`contact-person-position-${index}`}
                value={person.position ?? ""}
                disabled={disabled}
                onChange={(event) =>
                  updatePerson(index, "position", event.target.value)
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`contact-person-phone-${index}`}>Телефон</Label>
              <Input
                id={`contact-person-phone-${index}`}
                value={person.phone ?? ""}
                disabled={disabled}
                onChange={(event) =>
                  updatePerson(index, "phone", event.target.value)
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`contact-person-email-${index}`}>Email</Label>
              <Input
                id={`contact-person-email-${index}`}
                type="email"
                value={person.email ?? ""}
                disabled={disabled}
                onChange={(event) =>
                  updatePerson(index, "email", event.target.value)
                }
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`contact-person-comment-${index}`}>
              Комментарий
            </Label>
            <Textarea
              id={`contact-person-comment-${index}`}
              value={person.comment ?? ""}
              disabled={disabled}
              onChange={(event) =>
                updatePerson(index, "comment", event.target.value)
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}
