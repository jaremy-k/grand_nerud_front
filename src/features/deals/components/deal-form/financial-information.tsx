"use client";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
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
  const { dealFormData, updateField, calculatedData } = formData;

  if (!dealFormData.serviceId || !dealFormData.customerId) {
    return null;
  }

  const inputClass = "h-10 min-w-[200px]";

  return (
    <FormSectionCard
      step={2}
      title="Финансовая информация"
      description="Тип расчёта и расчётные суммы"
      icon={WalletIcon}
    >
      <FieldGroup className="gap-6">
        <Field className="rounded-lg border border-border/60 bg-muted/30 p-4 transition-colors focus-within:border-primary/40 focus-within:bg-muted/50">
          <FieldLabel
            htmlFor="paymentMethod"
            className="mb-2 block text-sm font-medium"
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
        <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Расчётные показатели
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Field>
              <FieldLabel
                htmlFor="profit"
                className="mb-2 block text-sm font-medium text-muted-foreground"
              >
                Маржа фирмы
              </FieldLabel>
              <InputGroup className="h-10 bg-muted/50">
                <InputGroupAddon>
                  <InputGroupText>₽</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  name="profit"
                  value={String(calculatedData.companyProfit)}
                  disabled
                  readOnly
                  placeholder="0.00"
                />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel
                htmlFor="managerProfit"
                className="mb-2 block text-sm font-medium text-muted-foreground"
              >
                Доход менеджера
              </FieldLabel>
              <InputGroup className="h-10 bg-muted/50">
                <InputGroupAddon>
                  <InputGroupText>₽</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  name="managerProfit"
                  value={String(calculatedData.managerProfit)}
                  disabled
                  readOnly
                  placeholder="0.00"
                />
              </InputGroup>
            </Field>
          </div>
        </div>
      </FieldGroup>
    </FormSectionCard>
  );
}
