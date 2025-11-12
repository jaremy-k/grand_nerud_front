"use client";

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

export default function DeliveryInformationSection({
  formData,
}: {
  formData: DealDataFormHook;
}) {
  const { dealFormData, updateField } = formData;

  if (!dealFormData.serviceId || !dealFormData.customerId) {
    return null;
  }

  return (
    <FieldSet>
      <FieldLegend>Доставка</FieldLegend>
      <FieldDescription>Заполните информацию о доставке ниже.</FieldDescription>
      <FieldGroup>
        {dealFormData.serviceId === "687a88e6b6b13b70b6a575f4" && (
          <div className="flex items-center space-x-2">
            <Switch
              checked={dealFormData.ossig}
              onClick={() => updateField("ossig", !dealFormData.ossig)}
              name="ossig"
            />
            <Label htmlFor="ossig">ОССиГ</Label>
          </div>
        )}
        {dealFormData.serviceId === "687a88dfb6b13b70b6a575f3" && (
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-4">
            <Field>
              <FieldLabel htmlFor="receivingMethod">
                Способ получения товара
              </FieldLabel>
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
            </Field>
            {dealFormData.methodReceiving === "доставка" && (
              <Field>
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
      </FieldGroup>
    </FieldSet>
  );
}
