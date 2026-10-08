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
import TypeSelector from "./type";
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

  const [type, setType] = useState<string>("Юридическое лицо");
  const [roles, setRoles] = useState<CompanyRole[]>([initialRole]);
  const [formVersion, setFormVersion] = useState(0);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (open) {
      setType("Юридическое лицо");
      setRoles([initialRole]);
      setFormVersion((version) => version + 1);
      setSubmitError("");
    }
  }, [initialRole, open]);

  const hanleCancel = () => {
    onCancel();
  };

  const handleSubmit = async (data: CreateCompanyRequest) => {
    if (roles.length === 0) {
      setSubmitError("Выберите хотя бы одну роль компании");
      return;
    }
    setSubmitting(true);
    setSubmitError("");

    try {
      const createdCompany = await companiesService.createCompany(data);
      onClose();

      // Callback
      onCreate(createdCompany);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Не удалось создать компанию"
      );
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
        {submitError && (
          <p className="text-sm text-destructive" role="alert">
            {submitError}
          </p>
        )}
        {type === "Физическое лицо" && (
          <ManualForm
            key={`person-${formVersion}`}
            onSubmit={handleSubmit}
            onCancel={hanleCancel}
            disabled={submitting}
            roles={roles}
          />
        )}
        {type === "Юридическое лицо" && (
          <InnProviderForm
            key={`legal-${formVersion}`}
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
