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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { DealDataFormHook } from "@features/deals/hooks/deal-form";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { ru } from "react-day-picker/locale";

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
    <FieldSet>
      <FieldLegend>Дополнительно</FieldLegend>
      <FieldDescription>
        Заполните дополнительную информацию о сделке ниже.
      </FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="deadline" className="gap-0.5">
            Срок выполнения
            <span className="text-red-600">*</span>
          </FieldLabel>
          <div className="flex flex-row gap-4 justify-start">
            <div className="flex flex-row gap-2.5">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date-picker"
                    className="w-40 justify-between font-normal"
                  >
                    {dealFormData.deliveryDate
                      ? dealFormData.deliveryDate.toLocaleDateString()
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
                      updateField("deliveryDate", date);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="inline-flex gap-2">
              <Input
                value={dealFormData.deliveryTime}
                onChange={(e) => updateField("deliveryTime", e.target.value)}
                name="time"
                type="time"
                step="60"
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
            value={dealFormData.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            id="notes"
            placeholder="Введите примечания"
          />
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
