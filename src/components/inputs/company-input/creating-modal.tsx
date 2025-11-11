import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { companiesService } from "@/services";
import { CompanyDto } from "@definitions/dto";
import { CreateCompanyRequest } from "@definitions/requests";
import { useState } from "react";
import InnProviderForm from "./inn-provider-form";
import ManualForm from "./manual-form";
import TypeSelector from "./type";

export function CreatingModal({
  open,
  onClose = () => {},
  onCancel = () => {},
  onCreate = () => {},
}: {
  open: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onCreate?: (comapny: CompanyDto) => void;
}) {
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [type, setType] = useState<string>("Юридическое лицо");

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
          <DialogTitle>Добавление клиента</DialogTitle>
        </DialogHeader>
        <div className="flex pb-2.5">
          <TypeSelector value={type} onChange={setType} withoutAny />
        </div>
        {type === "Физическое лицо" && (
          <ManualForm
            onSubmit={handleSubmit}
            onCancel={hanleCancel}
            disabled={submitting}
          />
        )}
        {type === "Индивидуальный предприниматель" && (
          <InnProviderForm
            onSubmit={handleSubmit}
            onCancel={hanleCancel}
            disabled={submitting}
          />
        )}
        {type === "Юридическое лицо" && (
          <InnProviderForm
            withShortName
            onSubmit={handleSubmit}
            onCancel={hanleCancel}
            disabled={submitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
