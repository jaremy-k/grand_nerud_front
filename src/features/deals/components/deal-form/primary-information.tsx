"use client";

import { CompanyCombobox } from "@/components/inputs/company-input/company-combobox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import { numberInputFormatter } from "@/lib/input-formatters";
import { capitalizeFirstLetter } from "@/lib/typography";
import { getStageDotClass } from "@features/deals/utils/stage-colors";
import {
  materialsService,
  servicesService,
  stagesService,
} from "@/services";
import { DealDto, MaterialDto, ServiceDto, StageDto } from "@definitions/dto";
import {
  DealDataFormHook,
  MeasurementUnit,
} from "@features/deals/hooks/deal-form";
import { FileTextIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { FormSectionCard } from "./form-section-card";

export default function PrimaryInformationSection({
  formData,
  defaultDeal,
}: {
  formData: DealDataFormHook;
  defaultDeal?: DealDto;
}) {
  const { dealFormData, updateField } = formData;
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [stages, setStages] = useState<StageDto[]>([]);
  const [materials, setMaterials] = useState<MaterialDto[]>([]);

  useEffect(() => {
    Promise.all([
      servicesService.getServices(),
      stagesService.getStages(),
      materialsService.getMaterials(),
    ]).then(([servicesData, stagesData, materialsData]) => {
      setServices(servicesData);
      setStages(stagesData);
      setMaterials(materialsData);
    });
  }, []);

  const labelRequired = (
    <span className="ml-0.5 text-destructive" aria-hidden>*</span>
  );
  const inputClass = "h-10 min-w-[200px]";

  return (
    <FormSectionCard
      step={1}
      title="Основная информация"
      description="Заказчик, услуга, этап и материал"
      icon={FileTextIcon}
    >
      <FieldGroup className="gap-6">
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          <Field className="rounded-lg border border-border/60 bg-muted/30 p-4 transition-colors focus-within:border-primary/40 focus-within:bg-muted/50">
            <FieldLabel
              htmlFor="customer"
              className="mb-2 block text-sm font-medium"
            >
              Заказчик{labelRequired}
            </FieldLabel>
            <CompanyCombobox
              disabled={!!defaultDeal}
              value={dealFormData.customerId ?? ""}
              onChange={(val) => updateField("customerId", val)}
            />
          </Field>
          <Field className="rounded-lg border border-border/60 bg-muted/30 p-4 transition-colors focus-within:border-primary/40 focus-within:bg-muted/50">
            <FieldLabel
              htmlFor="service"
              className="mb-2 block text-sm font-medium"
            >
              Услуга{labelRequired}
            </FieldLabel>
            <Select
              value={dealFormData.serviceId}
              onValueChange={(val) => updateField("serviceId", val)}
              name="service"
              disabled={!!defaultDeal}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Выберите услугу" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {services.map((service) => (
                    <SelectItem
                      key={`service-${service._id}`}
                      value={service._id}
                    >
                      {capitalizeFirstLetter(service.name)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>

        {!!dealFormData.serviceId && !!dealFormData.customerId && (
          <>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Детали сделки
              </p>
              <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                <Field>
                  <FieldLabel
                    htmlFor="stage"
                    className="mb-2 block text-sm font-medium"
                  >
                    Этап сделки{labelRequired}
                  </FieldLabel>
                  <Select
                    name="stage"
                    value={dealFormData.stageId}
                    onValueChange={(val) => updateField("stageId", val)}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Выберите этап">
                        {dealFormData.stageId && stages.find((s) => s._id === dealFormData.stageId) && (
                          <span className="flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 shrink-0 rounded-full ${getStageDotClass(dealFormData.stageId)}`}
                            />
                            {capitalizeFirstLetter(
                              stages.find((s) => s._id === dealFormData.stageId)!.name
                            )}
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {stages.map((stage) => (
                          <SelectItem
                            key={`stage-${stage._id}`}
                            value={stage._id}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={`h-2.5 w-2.5 shrink-0 rounded-full ${getStageDotClass(stage._id)}`}
                              />
                              {capitalizeFirstLetter(stage.name)}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel
                    htmlFor="material"
                    className="mb-2 block text-sm font-medium"
                  >
                    Материал{labelRequired}
                  </FieldLabel>
                  <Select
                    name="material"
                    value={dealFormData.materialId}
                    onValueChange={(val) => updateField("materialId", val)}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Выберите материал" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {materials.map((material) => (
                          <SelectItem
                            key={`material-${material._id}`}
                            value={material._id}
                          >
                            {capitalizeFirstLetter(material.name)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Объём и единицы
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Field>
                  <FieldLabel
                    htmlFor="measurementUnit"
                    className="mb-2 block text-sm font-medium"
                  >
                    Единица измерения
                  </FieldLabel>
                  <Select
                    name="measurementUnit"
                    value={dealFormData.unitMeasurement}
                    onValueChange={(e) =>
                      updateField("unitMeasurement", e as MeasurementUnit)
                    }
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Ед. измерения" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="тонна">Тонна</SelectItem>
                        <SelectItem value="куб.м">Кубический метр</SelectItem>
                        <SelectItem value="шт">Штука</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel
                    htmlFor="quantity"
                    className="mb-2 block text-sm font-medium"
                  >
                    Количество
                  </FieldLabel>
                  <Input
                    type="number"
                    name="quantity"
                    placeholder="0"
                    value={dealFormData.quantity}
                    min={1}
                    step={1}
                    className="h-10"
                    onChange={(e) => {
                      updateField(
                        "quantity",
                        numberInputFormatter(e.target.value, {
                          integerOnly: true,
                        })
                      );
                    }}
                  />
                </Field>
                {dealFormData.serviceId === "687a88dfb6b13b70b6a575f3" && (
                  <Field>
                    <FieldLabel
                      htmlFor="amountPerUnit"
                      className="mb-2 block text-sm font-medium"
                    >
                      Цена за единицу, ₽
                    </FieldLabel>
                    <InputGroup className="h-10">
                      <InputGroupAddon>
                        <InputGroupText>₽</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        name="amountPerUnit"
                        value={dealFormData.amountPurchaseUnit}
                        onChange={(e) => {
                          updateField(
                            "amountPurchaseUnit",
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

            {dealFormData.serviceId === "687a88dfb6b13b70b6a575f3" && (
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Продажа
                </p>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <Field>
                    <FieldLabel
                      htmlFor="amountSale"
                      className="mb-2 block text-sm font-medium"
                    >
                      Сумма продажи, ₽
                    </FieldLabel>
                    <InputGroup className="h-10">
                      <InputGroupAddon>
                        <InputGroupText>₽</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        name="amountSale"
                        value={dealFormData.amountSalesUnit}
                        onChange={(e) => {
                          updateField(
                            "amountSalesUnit",
                            numberInputFormatter(e.target.value)
                          );
                        }}
                        placeholder="0.00"
                      />
                    </InputGroup>
                  </Field>
                </div>
              </div>
            )}
          </>
        )}
      </FieldGroup>
    </FormSectionCard>
  );
}
