"use client";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
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
import { DealDataFormHook } from "./data-form-hook";

export default function FinancialInformationSection({
  formData,
}: {
  formData: DealDataFormHook;
}) {
  if (!formData.serviceId || !formData.customerId) {
    return null;
  }

  return (
    <FieldSet>
      <FieldLegend>Финансовая информация</FieldLegend>
      <FieldDescription>
        Заполните финансовую информацию о сделке ниже.
      </FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="paymentMethod">Тип расчета</FieldLabel>
          <Select
            name="paymentMethod"
            value={formData.paymentMethod}
            onValueChange={(e) =>
              formData.setPaymentMethod(
                e as "безналичный расчет" | "наличный расчет"
              )
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Выберите тип расчета" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="наличный расчет">Наличные</SelectItem>
                <SelectItem value="безналичный расчет">Безналичные</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-4">
          <Field>
            <FieldLabel htmlFor="profit">Маржа фирмы</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>₽</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                name="profit"
                value={formData.calculatedData.companyProfit}
                disabled
                readOnly
                placeholder="0.00"
              />
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="managerProfit">Доход менеджера</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>₽</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                name="managerProfit"
                value={formData.calculatedData.managerProfit}
                disabled
                readOnly
                placeholder="0.00"
              />
            </InputGroup>
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  );
}
