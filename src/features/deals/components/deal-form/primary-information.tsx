"use client";

import { CompanyCombobox } from "@/components/inputs/company-combobox";
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
import { capitalizeFirstLetter } from "@/lib/typography";
import {
  companiesService,
  materialsService,
  servicesService,
  stagesService,
} from "@/services";
import {
  CompanyDto,
  DealDto,
  MaterialDto,
  ServiceDto,
  StageDto,
} from "@definitions/dto";
import { FileTextIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { DealDataFormHook, MeasurementUnit } from "./data-form-hook";
import { numberInputFormatter } from "@/lib/input-formatters";
import { FormSectionCard } from "./form-section-card";

export default function PrimaryInformationSection({
  formData,
  defaultDeal,
}: {
  formData: DealDataFormHook;
  defaultDeal?: DealDto;
}) {
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [stages, setStages] = useState<StageDto[]>([]);
  const [materials, setMaterials] = useState<MaterialDto[]>([]);

  useEffect(() => {
    Promise.all([
      servicesService.getServices(),
      stagesService.getStages(),
      materialsService.getMaterials(),
      companiesService.getCompanies(),
    ]).then(([servicesData, stagesData, materialsData, companiesData]) => {
      setServices(servicesData);
      setStages(stagesData);
      setMaterials(materialsData);
      setCompanies(companiesData);
    });
  }, []);

  const handleCompanyCreate = (company: CompanyDto) => {
    setCompanies((c) => [...c, company]);
  };

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
            <FieldLabel htmlFor="customer" className="mb-2 block text-sm font-medium">
              Заказчик{labelRequired}
            </FieldLabel>
            <CompanyCombobox
              disabled={!!defaultDeal}
              value={formData.customerId}
              onChange={formData.setCustomerId}
              onCompanyCreate={handleCompanyCreate}
              companies={companies || []}
            />
          </Field>
          <Field className="rounded-lg border border-border/60 bg-muted/30 p-4 transition-colors focus-within:border-primary/40 focus-within:bg-muted/50">
            <FieldLabel htmlFor="service" className="mb-2 block text-sm font-medium">
              Услуга{labelRequired}
            </FieldLabel>
            <Select
              value={formData.serviceId}
              onValueChange={formData.setServiceId}
              name="service"
              disabled={!!defaultDeal}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Выберите услугу" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {services.map((service) => (
                    <SelectItem key={`service-${service._id}`} value={service._id}>
                      {capitalizeFirstLetter(service.name)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>

        {!!formData.serviceId && !!formData.customerId && (
          <>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Детали сделки
              </p>
              <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="stage" className="mb-2 block text-sm font-medium">
                    Этап сделки{labelRequired}
                  </FieldLabel>
                  <Select
                    name="stage"
                    value={formData.stageId}
                    onValueChange={formData.setStageId}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Выберите этап" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {stages.map((stage) => (
                          <SelectItem key={`stage-${stage._id}`} value={stage._id}>
                            {capitalizeFirstLetter(stage.name)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="material" className="mb-2 block text-sm font-medium">
                    Материал{labelRequired}
                  </FieldLabel>
                  <Select
                    name="material"
                    value={formData.materialId}
                    onValueChange={formData.setMaterialId}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Выберите материал" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {materials.map((material) => (
                          <SelectItem key={`material-${material._id}`} value={material._id}>
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
                  <FieldLabel htmlFor="measurementUnit" className="mb-2 block text-sm font-medium">
                    Единица измерения
                  </FieldLabel>
                  <Select
                    name="measurementUnit"
                    value={formData.unitMeasurement}
                    onValueChange={(e) =>
                      formData.setUnitMeasurement(e as MeasurementUnit)
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
                  <FieldLabel htmlFor="quantity" className="mb-2 block text-sm font-medium">
                    Количество
                  </FieldLabel>
                  <Input
                    type="number"
                    name="quantity"
                    placeholder="0"
                    value={formData.quantity}
                    min={1}
                    step={1}
                    className="h-10"
                    onChange={(e) => {
                      formData.setQuantity(
                        numberInputFormatter(e.target.value, { integerOnly: true })
                      );
                    }}
                  />
                </Field>
                {formData.serviceId === "687a88dfb6b13b70b6a575f3" && (
                  <Field>
                    <FieldLabel htmlFor="amountPerUnit" className="mb-2 block text-sm font-medium">
                      Цена за единицу, ₽
                    </FieldLabel>
                    <InputGroup className="h-10">
                      <InputGroupAddon>
                        <InputGroupText>₽</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        name="amountPerUnit"
                        value={formData.amountPurchaseUnit}
                        onChange={(e) => {
                          formData.setAmountPurchaseUnit(
                            numberInputFormatter(e.target.value)
                          );
                        }}
                        placeholder="0.00"
                      />
                    </InputGroup>
                  </Field>
                )}
                {formData.serviceId === "687a88dfb6b13b70b6a575f3" && (
                  <Field>
                    <FieldLabel htmlFor="purchaseTotal" className="mb-2 block text-sm font-medium text-muted-foreground">
                      Итоговая сумма закупки
                    </FieldLabel>
                    <InputGroup className="h-10 bg-muted/50">
                      <InputGroupAddon>
                        <InputGroupText>₽</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        name="purchaseTotal"
                        value={formData.calculatedData.amountPurchaseTotal}
                        readOnly
                        disabled
                        placeholder="0.00"
                      />
                    </InputGroup>
                  </Field>
                )}
              </div>
            </div>

            {formData.serviceId === "687a88dfb6b13b70b6a575f3" && (
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Продажа
                </p>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <Field>
                    <FieldLabel htmlFor="amountSale" className="mb-2 block text-sm font-medium">
                      Сумма продажи, ₽
                    </FieldLabel>
                    <InputGroup className="h-10">
                      <InputGroupAddon>
                        <InputGroupText>₽</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        name="amountSale"
                        value={formData.amountSalesUnit}
                        onChange={(e) => {
                          formData.setAmountSalesUnit(
                            numberInputFormatter(e.target.value)
                          );
                        }}
                        placeholder="0.00"
                      />
                    </InputGroup>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="salesTotal" className="mb-2 block text-sm font-medium text-muted-foreground">
                      Итоговая сумма продажи
                    </FieldLabel>
                    <InputGroup className="h-10 bg-muted/50">
                      <InputGroupAddon>
                        <InputGroupText>₽</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        name="salesTotal"
                        value={formData.calculatedData.amountSalesTotal}
                        readOnly
                        disabled
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
