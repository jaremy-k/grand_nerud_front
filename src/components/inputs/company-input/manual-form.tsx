import { CompanyRole } from "@definitions/dto";
import { CreateCompanyRequest } from "@definitions/requests";
import { useState } from "react";
import { Button } from "../../ui/button";
import { DialogClose, DialogFooter } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";

export default function ManualForm({
  disabled = false,
  onSubmit = () => {},
  onCancel = () => {},
  roles,
}: {
  disabled?: boolean;
  onSubmit?: (data: CreateCompanyRequest) => void;
  onCancel?: () => void;
  roles: CompanyRole[];
}) {
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [comment, setComment] = useState<string>("");

  const handleSubmit = () => {
    if (!name) return;

    onSubmit({
      type: "Физическое лицо",
      name,
      roles,
      contacts: phone ? [{ phone }] : [],
      comment,
    });
  };

  return (
    <>
      <div className="grid gap-4">
        <div className="grid gap-3">
          <Label htmlFor="name" className="gap-0.5">
            ФИО <span className="text-red-600">*</span>
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={disabled}
            name="name"
            autoComplete="off"
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="phone" className="gap-0.5">
            Телефон
          </Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={disabled}
            name="phone"
            autoComplete="off"
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="comment">Комментарий</Label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={disabled}
            name="comment"
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
        <Button disabled={disabled} type="button" onClick={handleSubmit}>
          Добавить
        </Button>
      </DialogFooter>
    </>
  );
}
