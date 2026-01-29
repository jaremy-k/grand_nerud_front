"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
<<<<<<< HEAD
import { DealDataFormHook } from "@features/deals/hooks/deal-form";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { ru } from "react-day-picker/locale";
=======
import { CalendarDaysIcon, ChevronDownIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { ru } from "react-day-picker/locale";
import { DealDataFormHook } from "./data-form-hook";
import { FormSectionCard } from "./form-section-card";
>>>>>>> 266d4ce2dfe6edb8ff22fc65a123ff6f1d7beeba

export default function AdditionalInformationSection({
  formData,
}: {
  formData: DealDataFormHook;
}) {
  const { dealFormData, updateField } = formData;
  const [open, setOpen] = useState(false);

  if (!dealFormData.serviceId || !dealFormData.customerId) {
    return null;
  }

  return (
    <FormSectionCard
      step={4}
      title="Дополнительно"
      description="Срок выполнения, примечания и расходы"
      icon={CalendarDaysIcon}
    >
      <FieldGroup className="gap-6">
        <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
          <Field>
            <FieldLabel htmlFor="deadline" className="mb-2 block text-sm font-medium">
              Срок выполнения
              <span className="ml-0.5 text-destructive" aria-hidden>*</span>
            </FieldLabel>
            <div className="flex flex-wrap items-center gap-3">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date-picker"
                    className="h-10 min-w-[180px] justify-between font-normal"
                  >
<<<<<<< HEAD
                    {dealFormData.deliveryDate
                      ? dealFormData.deliveryDate.toLocaleDateString()
=======
                    {formData.deliveryDate
                      ? formData.deliveryDate.toLocaleDateString("ru-RU")
>>>>>>> 266d4ce2dfe6edb8ff22fc65a123ff6f1d7beeba
                      : "Выбрать дату"}
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    locale={ru}
                    mode="single"
                    onSelect={(date) => {
                      updateField("deliveryDate", date);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
              <Input
                value={dealFormData.deliveryTime}
                onChange={(e) => updateField("deliveryTime", e.target.value)}
                name="time"
                type="time"
                step="60"
                className="h-10 w-[120px] appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>
          </Field>
        </div>

        <Field className="rounded-lg border border-border/60 bg-muted/20 p-4">
          <FieldLabel htmlFor="notes" className="mb-2 block text-sm font-medium">
            Примечания
          </FieldLabel>
          <Textarea
            value={dealFormData.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            id="notes"
            placeholder="Введите примечания к сделке"
            className="min-h-[100px] resize-y"
          />
        </Field>
<<<<<<< HEAD
      </FieldGroup>
    </FieldSet>
=======

        <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
          <FieldLabel className="mb-4 block text-sm font-medium">
            Дополнительные расходы
          </FieldLabel>
          <div className="overflow-hidden rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-medium">Наименование</TableHead>
                  <TableHead className="w-[140px] font-medium">Сумма</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.extraExpenses.map((el, idx) => (
                  <TableRow key={`extra-expenses-${idx}`}>
                    <TableCell>
                      <Input
                        type="text"
                        placeholder="Наименование"
                        value={el.name}
                        className="h-9 border-0 bg-transparent focus-visible:ring-0"
                        onChange={(e) =>
                          formData.setExtraExpenses(
                            formData.extraExpenses.map((v, i) =>
                              i !== idx ? v : { ...v, name: e.target.value }
                            )
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <InputGroup className="h-9 border-0 bg-transparent">
                        <InputGroupAddon>
                          <InputGroupText>₽</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          value={el.amount}
                          className="border-0 bg-transparent focus-visible:ring-0"
                          onChange={(e) => {
                            const formatted = e.target.value
                              .replace(/[^0-9.]/g, "")
                              .replace(/(\..*)\./g, "$1")
                              .replace(/(\.\d{2})\d+$/, "$1");
                            formData.setExtraExpenses(
                              formData.extraExpenses.map((v, i) =>
                                i !== idx ? v : { ...v, amount: formatted }
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
                    className="cursor-pointer bg-muted/30 py-3 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                    onClick={() =>
                      formData.setExtraExpenses([
                        ...formData.extraExpenses,
                        { name: "", amount: "" },
                      ])
                    }
                  >
                    <span className="inline-flex items-center gap-2">
                      <PlusIcon className="h-4 w-4" />
                      Добавить расход
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </FieldGroup>
    </FormSectionCard>
>>>>>>> 266d4ce2dfe6edb8ff22fc65a123ff6f1d7beeba
  );
}
