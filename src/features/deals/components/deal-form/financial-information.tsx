"use client";

<<<<<<< HEAD
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
=======
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
>>>>>>> 266d4ce2dfe6edb8ff22fc65a123ff6f1d7beeba
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
<<<<<<< HEAD
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DealDataFormHook,
  PaymentMethod,
} from "@features/deals/hooks/deal-form";
import { PlusIcon } from "lucide-react";
=======
import { DealDataFormHook } from "./data-form-hook";
import { FormSectionCard } from "./form-section-card";
import { WalletIcon } from "lucide-react";
>>>>>>> 266d4ce2dfe6edb8ff22fc65a123ff6f1d7beeba

export default function FinancialInformationSection({
  formData,
}: {
  formData: DealDataFormHook;
}) {
  const { dealFormData, updateField } = formData;

  if (!dealFormData.serviceId || !dealFormData.customerId) {
    return null;
  }

  const inputClass = "h-10 min-w-[200px]";

  return (
<<<<<<< HEAD
    <FieldSet>
      <FieldLegend>Финансовая информация</FieldLegend>
      <FieldDescription>
        Заполните финансовую информацию о сделке ниже.
      </FieldDescription>
      <FieldGroup>
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-4">
          <Field>
            <FieldLabel htmlFor="paymentMethod">Тип расчета</FieldLabel>
            <Select
              name="paymentMethod"
              value={dealFormData.paymentMethod}
              onValueChange={(e) => {
                updateField("paymentMethod", e as PaymentMethod);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Выберите тип расчета" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="наличный расчет">Наличные</SelectItem>
                  <SelectItem value="безналичный расчет">
                    Безналичные
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="managerShare">Доход менеджера</FieldLabel>
            <Select
              name="managerShare"
              value={dealFormData.managerShare}
              onValueChange={(e) => {
                updateField("managerShare", e);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Выберите долю менеджера" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="0.05">5%</SelectItem>
                  <SelectItem value="0.1">10%</SelectItem>
                  <SelectItem value="0.15">15%</SelectItem>
                  <SelectItem value="0.2">20%</SelectItem>
                  <SelectItem value="0.25">25%</SelectItem>
                  <SelectItem value="0.3">30%</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </FieldGroup>
      <FieldGroup>
        <Field>
          <FieldLabel>Дополнительные расходы</FieldLabel>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Наименование</TableHead>
                  <TableHead>Сумма</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dealFormData.extraExpenses.map((el, idx) => (
                  <TableRow key={`extra-expenses-${idx}`}>
                    <TableCell>
                      <Input
                        type="text"
                        placeholder="Введите наименование"
                        value={el.name}
                        onChange={(e) =>
                          updateField(
                            "extraExpenses",
                            dealFormData.extraExpenses.map((v, i) =>
                              i !== idx
                                ? v
                                : {
                                    ...v,
                                    name: e.target.value,
                                  }
                            )
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <InputGroup>
                        <InputGroupAddon>
                          <InputGroupText>₽</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          value={el.amount}
                          onChange={(e) => {
                            const formatted = e.target.value
                              .replace(/[^0-9.]/g, "")
                              .replace(/(\..*)\./g, "$1")
                              .replace(/(\.\d{2})\d+$/, "$1");

                            updateField(
                              "extraExpenses",
                              dealFormData.extraExpenses.map((v, i) =>
                                i !== idx
                                  ? v
                                  : {
                                      ...v,
                                      amount: formatted,
                                    }
                              )
                            );
                          }}
                          placeholder="0.00"
                        />
                      </InputGroup>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center cursor-pointer py-2.5"
                    onClick={() =>
                      updateField("extraExpenses", [
                        ...dealFormData.extraExpenses,
                        { name: "", amount: "" },
                      ])
                    }
                  >
                    <div className="inline-flex items-center gap-4">
                      Добавить
                      <PlusIcon />
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Field>
      </FieldGroup>
    </FieldSet>
=======
    <FormSectionCard
      step={2}
      title="Финансовая информация"
      description="Тип расчёта и расчётные суммы"
      icon={WalletIcon}
    >
      <FieldGroup className="gap-6">
        <Field className="rounded-lg border border-border/60 bg-muted/30 p-4 transition-colors focus-within:border-primary/40 focus-within:bg-muted/50">
          <FieldLabel htmlFor="paymentMethod" className="mb-2 block text-sm font-medium">
            Тип расчёта
          </FieldLabel>
          <Select
            name="paymentMethod"
            value={formData.paymentMethod}
            onValueChange={(e) =>
              formData.setPaymentMethod(
                e as "безналичный расчет" | "наличный расчет"
              )
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
              <FieldLabel htmlFor="profit" className="mb-2 block text-sm font-medium text-muted-foreground">
                Маржа фирмы
              </FieldLabel>
              <InputGroup className="h-10 bg-muted/50">
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
              <FieldLabel htmlFor="managerProfit" className="mb-2 block text-sm font-medium text-muted-foreground">
                Доход менеджера
              </FieldLabel>
              <InputGroup className="h-10 bg-muted/50">
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
        </div>
      </FieldGroup>
    </FormSectionCard>
>>>>>>> 266d4ce2dfe6edb8ff22fc65a123ff6f1d7beeba
  );
}
