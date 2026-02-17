"use client";

import { CompanyCombobox } from "@/components/inputs/company-input/company-combobox";
import { isSalesService } from "@/config/services";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
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
import { FileTextIcon, Minus, Plus } from "lucide-react";
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
    ])
      .then(([servicesData, stagesData, materialsData]) => {
        setServices(servicesData);
        setStages(stagesData);
        setMaterials(materialsData);
      })
      .catch(() => {
        setServices([]);
        setStages([]);
        setMaterials([]);
      });
  }, []);

  const labelRequired = (
    <span className="ml-0.5 text-destructive" aria-hidden>*</span>
  );
  const inputClass = "h-9 min-w-0";

  return (
    <FormSectionCard
      step={1}
      title="Основная информация"
      description="Заказчик, услуга, этап и материал"
      icon={FileTextIcon}
    >
      <FieldGroup className="gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 transition-colors focus-within:border-primary/40 focus-within:bg-muted/50">
            <FieldLabel
              htmlFor="customer"
              className="mb-1.5 block text-sm font-medium"
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
              className="mb-1.5 block text-sm font-medium"
            >
              Услуга{labelRequired}
            </FieldLabel>
            <Select
              value={dealFormData.serviceId}
              onValueChange={(val) => updateField("serviceId", val)}
              name="service"
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
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Детали сделки
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel
                    htmlFor="stage"
                    className="mb-1.5 block text-sm font-medium"
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
                    className="mb-1.5 block text-sm font-medium"
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

            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Объём и единицы
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field>
                  <FieldLabel
                    htmlFor="measurementUnit"
                    className="mb-1.5 block text-sm font-medium"
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
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Количество
                  </FieldLabel>
                  <div className="inline-flex h-10 w-full max-w-[160px] items-stretch overflow-hidden rounded-lg border border-input bg-background shadow-sm transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <button
                      type="button"
                      aria-label="Уменьшить"
                      disabled={Number(dealFormData.quantity || 0) <= 1}
                      onClick={() => {
                        const n = Number(dealFormData.quantity || 0);
                        updateField("quantity", String(Math.max(1, n - 1)));
                      }}
                      className="flex h-full min-w-10 flex-1 items-center justify-center border-r border-input bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40 active:bg-muted/80"
                    >
                      <Minus className="size-4" strokeWidth={2.5} />
                    </button>
                    <input
                      type="number"
                      name="quantity"
                      id="quantity"
                      placeholder="0"
                      value={dealFormData.quantity}
                      min={1}
                      step={1}
                      onChange={(e) => {
                        updateField(
                          "quantity",
                          numberInputFormatter(e.target.value, {
                            integerOnly: true,
                          })
                        );
                      }}
                      className="min-w-0 flex-1 border-0 bg-transparent px-2 py-0 text-center text-base font-semibold tabular-nums outline-none placeholder:text-muted-foreground/80 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      aria-label="Увеличить"
                      onClick={() => {
                        const n = Number(dealFormData.quantity || 0);
                        updateField("quantity", String(Math.max(1, n + 1)));
                      }}
                      className="flex h-full min-w-10 flex-1 items-center justify-center border-l border-input bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted/80"
                    >
                      <Plus className="size-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </Field>
              </div>
            </div>

            {isSalesService(dealFormData.serviceId) && (
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Продажа
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field>
                    <FieldLabel
                      htmlFor="amountSale"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      <span className="font-semibold text-primary">
                        Цена клиента
                      </span>{" "}
                      (за ед.), ₽
                    </FieldLabel>
                    <InputGroup className="h-9">
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
                  <Field>
                    <FieldLabel
                      htmlFor="amountPerUnit"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Закупка (за ед.), ₽
                    </FieldLabel>
                    <InputGroup className="h-9">
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
                  <Field className="flex flex-col justify-end">
                    <FieldLabel className="mb-1.5 block text-sm font-medium text-muted-foreground">
                      Маржа
                    </FieldLabel>
                    <p className="text-sm font-semibold tabular-nums text-primary">
                      {(
                        Number(dealFormData.amountSalesUnit || 0) -
                        Number(dealFormData.amountPurchaseUnit || 0)
                      ).toLocaleString("ru-RU")}{" "}
                      ₽/ед.
                      {Number(dealFormData.quantity || 0) > 0 && (
                        <span className="ml-1 font-normal text-muted-foreground">
                          (итого:{" "}
                          {(
                            (Number(dealFormData.amountSalesUnit || 0) -
                              Number(dealFormData.amountPurchaseUnit || 0)) *
                            Number(dealFormData.quantity || 0)
                          ).toLocaleString("ru-RU")}{" "}
                          ₽)
                        </span>
                      )}
                    </p>
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
