import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { companiesService } from "@/services";
import { CompanyDto } from "@definitions/dto";
import type { CompanyRole } from "@definitions/dto";
import { CreateCompanyRequest } from "@definitions/requests";
import { useEffect, useState } from "react";
import InnProviderForm from "./inn-provider-form";
import ManualForm from "./manual-form";
import TypeSelector, { IP_AND_LEGAL_TYPE } from "./type";

export function CreatingModal({
  open,
  onClose = () => {},
  onCancel = () => {},
  onCreate = () => {},
  initialRole = "customer",
}: {
  open: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onCreate?: (comapny: CompanyDto) => void;
  initialRole?: CompanyRole;
}) {
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [type, setType] = useState<string>(IP_AND_LEGAL_TYPE);
  const [roles, setRoles] = useState<CompanyRole[]>([initialRole]);

  useEffect(() => {
    if (open) setRoles([initialRole]);
  }, [initialRole, open]);

  const toggleRole = (role: CompanyRole) => {
    setRoles((current) =>
      current.includes(role)
        ? current.length > 1
          ? current.filter((item) => item !== role)
          : current
        : [...current, role]
    );
  };

  const hanleCancel = () => {
    onCancel();
  };

  const handleSubmit = async (data: CreateCompanyRequest) => {
    setSubmitting(true);

    try {
      const createdCompany = await companiesService.createCompany(data);
      onClose();

      // Callback
      onCreate(createdCompany);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Добавление компании</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <p className="text-sm font-medium">Роли компании</p>
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
        <div className="flex pb-2.5">
          <TypeSelector value={type} onChange={setType} withoutAny />
        </div>
        {type === "Физическое лицо" && (
          <ManualForm
            onSubmit={handleSubmit}
            onCancel={hanleCancel}
            disabled={submitting}
            roles={roles}
          />
        )}
        {(type === IP_AND_LEGAL_TYPE ||
          type === "Индивидуальный предприниматель" ||
          type === "Юридическое лицо") && (
          <InnProviderForm
            withShortName
            onSubmit={handleSubmit}
            onCancel={hanleCancel}
            disabled={submitting}
            roles={roles}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
