import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { companiesService } from "@/services";
import { CompanyDto } from "@definitions/dto";
import type { CompanyRole } from "@definitions/dto";
import { CreateCompanyRequest } from "@definitions/requests";
import { useEffect, useState } from "react";
import InnProviderForm from "./inn-provider-form";
import ManualForm from "./manual-form";
import TypeSelector, { IP_AND_LEGAL_TYPE } from "./type";
import CompanyRoleSelector from "./company-role-selector";

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
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>Добавление компании</DialogTitle>
        </DialogHeader>
        <CompanyRoleSelector
          value={roles}
          onChange={setRoles}
          disabled={submitting}
        />
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
