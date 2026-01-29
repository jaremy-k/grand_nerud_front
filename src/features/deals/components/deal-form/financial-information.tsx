"use client";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DealDataFormHook,
  PaymentMethod,
} from "@features/deals/hooks/deal-form";
import { WalletIcon } from "lucide-react";
import { FormSectionCard } from "./form-section-card";

export default function FinancialInformationSection({
  formData,
}: {
  formData: DealDataFormHook;
}) {
  const { dealFormData, updateField } = formData;

  if (!dealFormData.serviceId || !dealFormData.customerId) {
    return null;
  }

  const inputClass = "h-9 min-w-0";

  return (
    <FormSectionCard
      step={2}
      title="Финансовая информация"
      description="Тип расчёта"
      icon={WalletIcon}
    >
      <FieldGroup className="gap-4">
        <Field className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 transition-colors focus-within:border-primary/40 focus-within:bg-muted/50">
          <FieldLabel
            htmlFor="paymentMethod"
            className="mb-1.5 block text-sm font-medium"
          >
            Тип расчёта
          </FieldLabel>
          <Select
            name="paymentMethod"
            value={dealFormData.paymentMethod}
            onValueChange={(e) =>
              updateField("paymentMethod", e as PaymentMethod)
            }
          >
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder="Выберите тип расчёта" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="наличный расчет">Наличные</SelectItem>
                <SelectItem value="безналичный расчет">Безналичные</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
    </FormSectionCard>
  );
}
