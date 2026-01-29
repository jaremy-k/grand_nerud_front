"use client";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
<<<<<<< HEAD
import { numberInputFormatter } from "@/lib/input-formatters";
import {
  DealDataFormHook,
  ReceivingMethod,
} from "@features/deals/hooks/deal-form";
=======
import { TruckIcon } from "lucide-react";
import { DealDataFormHook, ReceivingMethod } from "./data-form-hook";
import { numberInputFormatter } from "@/lib/input-formatters";
import { FormSectionCard } from "./form-section-card";
>>>>>>> 266d4ce2dfe6edb8ff22fc65a123ff6f1d7beeba

export default function DeliveryInformationSection({
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
      <FieldLegend>Доставка</FieldLegend>
      <FieldDescription>Заполните информацию о доставке ниже.</FieldDescription>
      <FieldGroup>
        {dealFormData.serviceId === "687a88e6b6b13b70b6a575f4" && (
          <div className="flex items-center space-x-2">
=======
    <FormSectionCard
      step={3}
      title="Доставка"
      description="Способ получения, адреса и стоимость"
      icon={TruckIcon}
    >
      <FieldGroup className="gap-6">
        {formData.serviceId === "687a88e6b6b13b70b6a575f4" && (
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-4">
>>>>>>> 266d4ce2dfe6edb8ff22fc65a123ff6f1d7beeba
            <Switch
              checked={dealFormData.ossig}
              onClick={() => updateField("ossig", !dealFormData.ossig)}
              name="ossig"
            />
            <Label htmlFor="ossig" className="text-sm font-medium cursor-pointer">
              ОССиГ
            </Label>
          </div>
        )}
<<<<<<< HEAD
        {dealFormData.serviceId === "687a88dfb6b13b70b6a575f3" && (
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-4">
=======
        {formData.serviceId === "687a88dfb6b13b70b6a575f3" && (
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Способ получения
            </p>
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
              <Field className="rounded-lg border border-border/60 bg-muted/30 p-4 transition-colors focus-within:border-primary/40 focus-within:bg-muted/50">
                <FieldLabel htmlFor="receivingMethod" className="mb-2 block text-sm font-medium">
                  Способ получения товара
                </FieldLabel>
                <Select
                  name="receivingMethod"
                  value={formData.methodReceiving}
                  onValueChange={(e) =>
                    formData.setMethodReceiving(e as ReceivingMethod)
                  }
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Выберите способ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="доставка">Доставка</SelectItem>
                      <SelectItem value="самовывоз">Самовывоз</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              {formData.methodReceiving === "доставка" && (
                <Field className="rounded-lg border border-border/60 bg-muted/30 p-4 transition-colors focus-within:border-primary/40 focus-within:bg-muted/50">
                  <FieldLabel htmlFor="amountDelivery" className="mb-2 block text-sm font-medium">
                    Стоимость доставки, ₽
                  </FieldLabel>
                  <InputGroup className="h-10">
                    <InputGroupAddon>
                      <InputGroupText>₽</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      name="amountDelivery"
                      value={formData.amountDelivery}
                      onChange={(e) => {
                        formData.setAmountDelivery(
                          numberInputFormatter(e.target.value)
                        );
                      }}
                      placeholder="0.00"
                    />
                  </InputGroup>
                </Field>
              )}
            </div>
          </div>
        )}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Адреса
          </p>
          <div className="grid gap-6 sm:grid-cols-1">
>>>>>>> 266d4ce2dfe6edb8ff22fc65a123ff6f1d7beeba
            <Field>
              <FieldLabel htmlFor="shippingAddress" className="mb-2 block text-sm font-medium">
                Адрес отгрузки
              </FieldLabel>
<<<<<<< HEAD
              <Select
                name="receivingMethod"
                value={dealFormData.methodReceiving}
                onValueChange={(e) =>
                  updateField("methodReceiving", e as ReceivingMethod)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Выберите способ получения" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="доставка">Доставка</SelectItem>
                    <SelectItem value="самовывоз">Самовывоз</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
=======
              <Input
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={(e) => formData.setShippingAddress(e.target.value)}
                type="text"
                placeholder="Введите адрес отгрузки"
                className="h-10"
              />
>>>>>>> 266d4ce2dfe6edb8ff22fc65a123ff6f1d7beeba
            </Field>
            {dealFormData.methodReceiving === "доставка" && (
              <Field>
<<<<<<< HEAD
                <FieldLabel htmlFor="amountDelivery">
                  Оплата перевозщику
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>₽</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    name="amountDelivery"
                    value={dealFormData.amountDelivery}
                    onChange={(e) => {
                      updateField(
                        "amountDelivery",
                        numberInputFormatter(e.target.value)
                      );
                    }}
                    placeholder="0.00"
                  />
                </InputGroup>
              </Field>
            )}
          </div>
        )}
        <Field>
          <FieldLabel htmlFor="shippingAddress">Адрес отгрузки</FieldLabel>
          <Input
            name="shippingAddress"
            value={dealFormData.shippingAddress}
            onChange={(e) => updateField("shippingAddress", e.target.value)}
            type="text"
            placeholder="Введите адрес отгрузки"
          />
        </Field>
        {dealFormData.methodReceiving === "доставка" && (
          <Field>
            <FieldLabel htmlFor="shippingAddress">Адрес доставки</FieldLabel>
            <Input
              name="shippingAddress"
              value={dealFormData.deliveryAddress}
              onChange={(e) => updateField("deliveryAddress", e.target.value)}
              type="text"
              placeholder="Введите адрес доставки"
            />
          </Field>
        )}
=======
                <FieldLabel htmlFor="deliveryAddress" className="mb-2 block text-sm font-medium">
                  Адрес доставки
                </FieldLabel>
                <Input
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={(e) => formData.setDeliveryAddress(e.target.value)}
                  type="text"
                  placeholder="Введите адрес доставки"
                  className="h-10"
                />
              </Field>
            )}
          </div>
        </div>
>>>>>>> 266d4ce2dfe6edb8ff22fc65a123ff6f1d7beeba
      </FieldGroup>
    </FormSectionCard>
  );
}
