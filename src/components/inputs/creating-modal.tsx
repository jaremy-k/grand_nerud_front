import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { numberInputFormatter } from "@/lib/input-formatters";
import { companiesService } from "@/services";
import { CompanyDto } from "@definitions/dto";
import { CreateCompanyRequest } from "@definitions/requests";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function CreatingModal({
  open,
  onClose = () => {},
  onCreate = () => {},
}: {
  open: boolean;
  onClose?: () => void;
  onCreate?: (comapny: CompanyDto) => void;
}) {
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [abbreviatedName, setAbbreviatedName] = useState<string>("");
  const [inn, setInn] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [director, setDirector] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  const resetFields = () => {
    setName("");
    setAbbreviatedName("");
    setInn("");
    setType("");
    setDirector("");
    setAddress("");
  };

  const hanleCancel = () => {
    onClose();
    resetFields();
  };

  const handleSubmit = async () => {
    console.log("aa", inn.length);

    if (!name || !abbreviatedName || !inn || !type) return;
    if (type === "Физическое лицо" && inn.length !== 12) return;
    if (type === "Юридическое лицо" && inn.length !== 10) return;

    setSubmitting(true);

    const requestData: CreateCompanyRequest = {
      name,
      abbreviatedName,
      inn,
      type,
      contacts: [
        {
          address,
        },
        {
          director,
        },
      ],
    };

    try {
      const createdCompany = await companiesService.createCompany(requestData);
      onClose();
      resetFields();

      // Callback
      onCreate(createdCompany);
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Добавление клиента</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="name" className="gap-0.5">
              Название <span className="text-red-600">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              name="name"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="abbreviatedName" className="gap-0.5">
              Короткое название <span className="text-red-600">*</span>
            </Label>
            <Input
              value={abbreviatedName}
              onChange={(e) => setAbbreviatedName(e.target.value)}
              disabled={submitting}
              name="abbreviatedName"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="type" className="gap-0.5">
              Тип клиента <span className="text-red-600">*</span>
            </Label>
            <Select
              name="paymentMethod"
              disabled={submitting}
              value={type}
              onValueChange={(val) => setType(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип клиента" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Физическое лицо">
                    Физическое лицо
                  </SelectItem>
                  <SelectItem value="Юридическое лицо">
                    Юридическое лицо
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="inn" className="gap-0.5">
              ИНН <span className="text-red-600">*</span>
            </Label>
            <Input
              value={inn}
              onChange={(e) =>
                setInn(
                  numberInputFormatter(e.target.value, {
                    integerOnly: true,
                    allowStartPad: true,
                  })
                )
              }
              disabled={submitting}
              name="inn"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="director">Директор</Label>
            <Input
              value={director}
              onChange={(e) => setDirector(e.target.value)}
              disabled={submitting}
              name="director"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="address">Адрес</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={submitting}
              name="address"
              autoComplete="off"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              disabled={submitting}
              onClick={hanleCancel}
              type="button"
              variant="outline"
            >
              Отмена
            </Button>
          </DialogClose>
          <Button disabled={submitting} type="button" onClick={handleSubmit}>
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
