"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
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
import { DealDataFormHook } from "@features/deals/hooks/deal-form";
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  Minus,
  Plus,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { ru } from "react-day-picker/locale";
import { format } from "date-fns";
import { FormSectionCard } from "./form-section-card";
import { numberInputFormatter } from "@/lib/input-formatters";

export default function AdditionalInformationSection({
  formData,
}: {
  formData: DealDataFormHook;
}) {
  const { dealFormData, updateField } = formData;
  const [datePickerOpen, setDatePickerOpen] = useState<number | null>(null);

  if (!dealFormData.serviceId || !dealFormData.customerId) {
    return null;
  }

  return (
    <FormSectionCard
      step={4}
      title="Дополнительно"
      description="Примечания, расходы и доставленные количества"
      icon={CalendarDaysIcon}
    >
      <FieldGroup className="gap-4">

        <Field className="rounded-lg border border-border/60 bg-muted/20 p-3">
          <FieldLabel
            htmlFor="notes"
            className="mb-1.5 block text-sm font-medium"
          >
            Примечания
          </FieldLabel>
          <Textarea
            value={dealFormData.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            id="notes"
            placeholder="Введите примечания к сделке"
            className="min-h-[80px] resize-y text-sm"
          />
        </Field>

        <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
          <FieldLabel className="mb-3 block text-sm font-medium">
            Дополнительные расходы
          </FieldLabel>
          <div className="overflow-hidden rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-medium">Наименование</TableHead>
                  <TableHead className="w-[140px] font-medium">
                    Сумма
                  </TableHead>
                  <TableHead className="w-[52px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dealFormData.extraExpenses.map((el, idx) => (
                  <TableRow key={`extra-expenses-${idx}`}>
                    <TableCell>
                      <Input
                        type="text"
                        placeholder="Наименование"
                        value={el.name}
                        className="h-9 border-0 bg-transparent focus-visible:ring-0"
                        onChange={(e) =>
                          updateField(
                            "extraExpenses",
                            dealFormData.extraExpenses.map((v, i) =>
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
                            updateField(
                              "extraExpenses",
                              dealFormData.extraExpenses.map((v, i) =>
                                i !== idx ? v : { ...v, amount: formatted }
                              )
                            );
                          }}
                          placeholder="0.00"
                        />
                      </InputGroup>
                    </TableCell>
                    <TableCell className="w-[52px] p-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          updateField(
                            "extraExpenses",
                            dealFormData.extraExpenses.filter(
                              (_, i) => i !== idx
                            )
                          )
                        }
                        title="Удалить"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="cursor-pointer bg-muted/30 py-3 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                    onClick={() =>
                      updateField("extraExpenses", [
                        ...dealFormData.extraExpenses,
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

        <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
          <FieldLabel className="mb-3 block text-sm font-medium">
            Доставленные количества
          </FieldLabel>
          <div className="overflow-hidden rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-medium">Количество</TableHead>
                  <TableHead className="font-medium">Единица</TableHead>
                  <TableHead className="font-medium">Сумма закупки</TableHead>
                  <TableHead className="font-medium">Дата доставки</TableHead>
                  <TableHead className="w-[52px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dealFormData.deliveredQuantity.map((el, idx) => (
                  <TableRow key={`delivered-quantity-${idx}`}>
                    <TableCell className="p-2">
                      <div className="inline-flex h-9 w-full max-w-[140px] items-stretch overflow-hidden rounded-lg border border-input bg-background shadow-sm transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <button
                          type="button"
                          aria-label="Уменьшить"
                          disabled={Number(el.quantity || 0) <= 0}
                          onClick={() => {
                            const n = Number(el.quantity || 0);
                            updateField(
                              "deliveredQuantity",
                              dealFormData.deliveredQuantity.map((v, i) =>
                                i !== idx
                                  ? v
                                  : { ...v, quantity: String(Math.max(0, n - 1)) }
                              )
                            );
                          }}
                          className="flex h-full min-w-9 flex-1 items-center justify-center border-r border-input bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40 active:bg-muted/80"
                        >
                          <Minus className="size-4" strokeWidth={2.5} />
                        </button>
                        <input
                          type="number"
                          placeholder="0"
                          value={el.quantity}
                          min={0}
                          step={1}
                          onChange={(e) =>
                            updateField(
                              "deliveredQuantity",
                              dealFormData.deliveredQuantity.map((v, i) =>
                                i !== idx
                                  ? v
                                  : {
                                      ...v,
                                      quantity: numberInputFormatter(
                                        e.target.value,
                                        { integerOnly: true }
                                      ),
                                    }
                              )
                            )
                          }
                          className="min-w-0 flex-1 border-0 bg-transparent px-2 py-0 text-center text-sm font-semibold tabular-nums outline-none placeholder:text-muted-foreground/80 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          aria-label="Увеличить"
                          onClick={() => {
                            const n = Number(el.quantity || 0);
                            updateField(
                              "deliveredQuantity",
                              dealFormData.deliveredQuantity.map((v, i) =>
                                i !== idx
                                  ? v
                                  : { ...v, quantity: String(Math.max(0, n + 1)) }
                              )
                            );
                          }}
                          className="flex h-full min-w-9 flex-1 items-center justify-center border-l border-input bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted/80"
                        >
                          <Plus className="size-4" strokeWidth={2.5} />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-9 flex items-center px-2 text-sm text-muted-foreground">
                        {dealFormData.unitMeasurement === "тонна"
                          ? "тонн"
                          : dealFormData.unitMeasurement === "куб.м"
                            ? "куб.м"
                            : dealFormData.unitMeasurement === "шт"
                              ? "шт"
                              : dealFormData.unitMeasurement}
                      </div>
                    </TableCell>
                    <TableCell className="p-2">
                      <InputGroup className="h-9 max-w-[120px]">
                        <InputGroupAddon>
                          <InputGroupText>₽</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          value={el.amountPurchase ?? ""}
                          className="h-9"
                          onChange={(e) => {
                            const formatted = e.target.value
                              .replace(/[^0-9.]/g, "")
                              .replace(/(\..*)\./g, "$1")
                              .replace(/(\.\d{2})\d+$/, "$1");
                            updateField(
                              "deliveredQuantity",
                              dealFormData.deliveredQuantity.map((v, i) =>
                                i !== idx ? v : { ...v, amountPurchase: formatted }
                              )
                            );
                          }}
                          placeholder="0"
                        />
                      </InputGroup>
                    </TableCell>
                    <TableCell>
                      <Popover
                        open={datePickerOpen === idx}
                        onOpenChange={(open) =>
                          setDatePickerOpen(open ? idx : null)
                        }
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-9 w-full justify-between border-0 bg-transparent font-normal shadow-none hover:bg-muted/50"
                          >
                            {el.date
                              ? format(el.date, "d MMM yyyy", {
                                  locale: ru,
                                })
                              : "Выбрать дату"}
                            <ChevronDownIcon className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="start"
                        >
                          <Calendar
                            locale={ru}
                            mode="single"
                            selected={el.date}
                            onSelect={(date) => {
                              updateField(
                                "deliveredQuantity",
                                dealFormData.deliveredQuantity.map((v, i) =>
                                  i !== idx ? v : { ...v, date }
                                )
                              );
                              setDatePickerOpen(null);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="w-[52px] p-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          updateField(
                            "deliveredQuantity",
                            dealFormData.deliveredQuantity.filter(
                              (_, i) => i !== idx
                            )
                          )
                        }
                        title="Удалить"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="cursor-pointer bg-muted/30 py-3 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                    onClick={() =>
                      updateField("deliveredQuantity", [
                        ...dealFormData.deliveredQuantity,
                        { quantity: "", date: undefined, amountPurchase: "" },
                      ])
                    }
                  >
                    <span className="inline-flex items-center gap-2">
                      <PlusIcon className="h-4 w-4" />
                      Добавить доставку
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </FieldGroup>
    </FormSectionCard>
  );
}
