"use client";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { isSalesService, isTransportService } from "@/config/services";
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
import { numberInputFormatter } from "@/lib/input-formatters";
import {
  DealDataFormHook,
  ReceivingMethod,
} from "@features/deals/hooks/deal-form";
import { TruckIcon } from "lucide-react";
import { FormSectionCard } from "./form-section-card";

export default function DeliveryInformationSection({
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
      step={3}
      title="Доставка"
      description="Способ получения, адреса и стоимость"
      icon={TruckIcon}
    >
      <FieldGroup className="gap-4">
        {isTransportService(dealFormData.serviceId) && (
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
            <Switch
              checked={dealFormData.ossig}
              onClick={() => updateField("ossig", !dealFormData.ossig)}
              name="ossig"
            />
            <Label
              htmlFor="ossig"
              className="cursor-pointer text-sm font-medium"
            >
              ОССиГ
            </Label>
          </div>
        )}
        {isSalesService(dealFormData.serviceId) && (
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Способ получения
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 transition-colors focus-within:border-primary/40 focus-within:bg-muted/50">
                <FieldLabel
                  htmlFor="receivingMethod"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Способ получения товара
                </FieldLabel>
                <Select
                  name="receivingMethod"
                  value={dealFormData.methodReceiving}
                  onValueChange={(e) =>
                    updateField("methodReceiving", e as ReceivingMethod)
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
              {dealFormData.methodReceiving === "доставка" && (
                <Field className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 transition-colors focus-within:border-primary/40 focus-within:bg-muted/50">
                  <FieldLabel
                    htmlFor="amountDelivery"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Стоимость доставки, ₽
                  </FieldLabel>
                  <InputGroup className="h-9">
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
          </div>
        )}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Адреса
          </p>
          <div className="grid gap-4 sm:grid-cols-1">
            <Field>
              <FieldLabel
                htmlFor="shippingAddress"
                className="mb-1.5 block text-sm font-medium"
              >
                Адрес отгрузки
              </FieldLabel>
              <Input
                name="shippingAddress"
                value={dealFormData.shippingAddress}
                onChange={(e) =>
                  updateField("shippingAddress", e.target.value)
                }
                type="text"
                placeholder="Введите адрес отгрузки"
                className="h-9"
              />
            </Field>
            {(dealFormData.methodReceiving === "доставка" ||
              isTransportService(dealFormData.serviceId)) && (
              <Field>
                <FieldLabel
                  htmlFor="deliveryAddress"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Адрес доставки
                </FieldLabel>
                <Input
                  name="deliveryAddress"
                  value={dealFormData.deliveryAddress}
                  onChange={(e) =>
                    updateField("deliveryAddress", e.target.value)
                  }
                  type="text"
                  placeholder="Введите адрес доставки"
                  className="h-9"
                />
              </Field>
            )}
          </div>
        </div>
        {isTransportService(dealFormData.serviceId) && (
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Стоимость доставки
            </p>
            <Field>
              <FieldLabel
                htmlFor="amountDelivery"
                className="mb-1.5 block text-sm font-medium"
              >
                Стоимость доставки, ₽
              </FieldLabel>
              <InputGroup className="h-9">
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
          </div>
        )}
      </FieldGroup>
    </FormSectionCard>
  );
}
