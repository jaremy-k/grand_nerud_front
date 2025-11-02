"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { ru } from "react-day-picker/locale";
import { DealDataFormHook } from "./data-form-hook";

export default function AdditionalInformationSection({
  formData,
}: {
  formData: DealDataFormHook;
}) {
  const [open, setOpen] = useState(false);

  if (!formData.serviceId || !formData.customerId) {
    return null;
  }

  return (
    <FieldSet>
      <FieldLegend>Дополнительно</FieldLegend>
      <FieldDescription>
        Заполните дополнительную информацию о сделке ниже.
      </FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="deadline">Срок выполнения</FieldLabel>
          <div className="flex flex-row gap-4 justify-start">
            <div className="flex flex-row gap-2.5">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date-picker"
                    className="w-40 justify-between font-normal"
                  >
                    {formData.deliveryDate
                      ? formData.deliveryDate.toLocaleDateString()
                      : "Выбрать дату"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    locale={ru}
                    mode="single"
                    onSelect={(date) => {
                      formData.setDeliveryDate(date);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="inline-flex gap-2">
              <Input
                value={formData.deliveryTime}
                onChange={(e) => formData.setDeliveryTime(e.target.value)}
                name="time"
                type="time"
                step="1"
                className="bg-background max-w-[6rem] appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
            </div>
          </div>
        </Field>
      </FieldGroup>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="notes">Примечания</FieldLabel>
          <Textarea
            value={formData.notes}
            onChange={(e) => formData.setNotes(e.target.value)}
            id="notes"
            placeholder="Введите примечания"
          />
        </Field>
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
                {formData.extraExpenses.map((el, idx) => (
                  <TableRow key={`extra-expenses-${idx}`}>
                    <TableCell>
                      <Input
                        type="text"
                        placeholder="Введите наименование"
                        value={el.name}
                        onChange={(e) =>
                          formData.setExtraExpenses(
                            formData.extraExpenses.map((v, i) =>
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

                            formData.setExtraExpenses(
                              formData.extraExpenses.map((v, i) =>
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
                      formData.setExtraExpenses([
                        ...formData.extraExpenses,
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
  );
}
