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
import { Textarea } from "@/components/ui/textarea";
import { companiesService } from "@/services";
import { CompanyDto, CompanyRole, ContactPerson } from "@definitions/dto";
import { useEffect, useState } from "react";
import ContactPersonsEditor, {
  isValidContactPersons,
} from "./contact-persons-editor";

export function EditingCompanyModal({
  company,
  open,
  onClose,
  onUpdate,
}: {
  company: CompanyDto | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (company: CompanyDto) => void;
}) {
  const [name, setName] = useState("");
  const [abbreviatedName, setAbbreviatedName] = useState("");
  const [inn, setInn] = useState("");
  const [kpp, setKpp] = useState("");
  const [roles, setRoles] = useState<CompanyRole[]>([]);
  const [comment, setComment] = useState("");
  const [contactPersons, setContactPersons] = useState<ContactPerson[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !company) return;
    setName(company.name ?? "");
    setAbbreviatedName(company.abbreviatedName ?? "");
    setInn(company.inn ?? "");
    setKpp(company.kpp ?? "");
    setRoles(company.roles?.length ? [...company.roles] : []);
    setComment(company.comment ?? "");
    setContactPersons(company.contactPersons?.map((person) => ({ ...person })) ?? []);
    setError("");
  }, [company, open]);

  const toggleRole = (role: CompanyRole) => {
    setRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role]
    );
  };

  const handleSubmit = async () => {
    if (!company) return;
    if (!name.trim()) {
      setError("Название компании обязательно");
      return;
    }
    if (roles.length === 0) {
      setError("Выберите хотя бы одну роль компании");
      return;
    }
    if (!isValidContactPersons(contactPersons)) {
      setError("Укажите имя и корректный email для каждого контрагента");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const updatedCompany = await companiesService.updateCompany(company._id, {
        name: name.trim(),
        abbreviatedName: abbreviatedName.trim(),
        inn,
        kpp: kpp.trim(),
        roles,
        comment: comment.trim(),
        contactPersons,
      });
      onUpdate(updatedCompany);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось обновить компанию"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Редактирование компании</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Роли компании</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={roles.includes("provider") ? "default" : "outline"}
                onClick={() => toggleRole("provider")}
              >
                Исполнитель
              </Button>
              <Button
                type="button"
                size="sm"
                variant={roles.includes("customer") ? "default" : "outline"}
                onClick={() => toggleRole("customer")}
              >
                Заказчик
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="edit-company-name">
                Название <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-company-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="edit-company-short-name">Короткое название</Label>
              <Input
                id="edit-company-short-name"
                value={abbreviatedName}
                onChange={(event) => setAbbreviatedName(event.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-company-inn">ИНН</Label>
              <Input
                id="edit-company-inn"
                value={inn}
                onChange={(event) => setInn(event.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-company-kpp">КПП</Label>
              <Input
                id="edit-company-kpp"
                value={kpp}
                onChange={(event) => setKpp(event.target.value)}
                disabled={submitting}
              />
            </div>
            {company?.type && (
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="edit-company-type">Тип организации</Label>
                <Input id="edit-company-type" value={company.type} disabled />
              </div>
            )}
          </div>

          {company?.contacts?.length ? (
            <details className="rounded-md border border-border/50 px-3 py-2 text-muted-foreground">
              <summary className="cursor-pointer text-xs font-medium">
                Контакт карточки
              </summary>
              <dl className="mt-2 grid gap-1.5 text-xs">
                {company.contacts.flatMap((contact, contactIndex) =>
                  Object.entries(contact).map(([key, value]) => (
                    <div key={`${contactIndex}-${key}`} className="flex gap-2">
                      <dt className="font-medium">{key}:</dt>
                      <dd>{String(value ?? "")}</dd>
                    </div>
                  ))
                )}
              </dl>
            </details>
          ) : null}

          <ContactPersonsEditor
            value={contactPersons}
            onChange={setContactPersons}
            disabled={submitting}
          />

          <div className="grid gap-1.5">
            <Label htmlFor="edit-company-comment">Комментарий</Label>
            <Textarea
              id="edit-company-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              disabled={submitting}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Отмена
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Сохранение..." : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
