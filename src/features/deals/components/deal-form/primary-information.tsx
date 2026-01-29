"use client";

<<<<<<< HEAD
import { CompanyCombobox } from "@/components/inputs/company-input/company-combobox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
=======
import { CompanyCombobox } from "@/components/inputs/company-combobox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
>>>>>>> 266d4ce2dfe6edb8ff22fc65a123ff6f1d7beeba
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
<<<<<<< HEAD
import { numberInputFormatter } from "@/lib/input-formatters";
import { capitalizeFirstLetter } from "@/lib/typography";
import { materialsService, servicesService, stagesService } from "@/services";
import { DealDto, MaterialDto, ServiceDto, StageDto } from "@definitions/dto";
import {
  DealDataFormHook,
  MeasurementUnit,
} from "@features/deals/hooks/deal-form";
import { useEffect, useState } from "react";
=======
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
>>>>>>> 266d4ce2dfe6edb8ff22fc65a123ff6f1d7beeba

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

<<<<<<< HEAD
  return (
    <FieldSet>
      <FieldLegend>Основная информация</FieldLegend>
      <FieldDescription>
        Заполните основную информацию о сделке ниже.
      </FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="customer" className="gap-0.5">
            Заказчик<span className="text-red-600">*</span>
          </FieldLabel>
          <CompanyCombobox
            disabled={!!defaultDeal}
            value={dealFormData.customerId}
            onChange={(val) => updateField("customerId", val)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="service" className="gap-0.5">
            Услуга
            <span className="text-red-600">*</span>
          </FieldLabel>
          <Select
            value={dealFormData.serviceId}
            onValueChange={(val) => updateField("serviceId", val)}
            name="service"
            disabled={!!defaultDeal}
          >
            <SelectTrigger className="w-[180px]">
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
        {!!dealFormData.serviceId && !!dealFormData.customerId && (
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-4">
            <Field>
              <FieldLabel htmlFor="stage" className="gap-0.5">
                Этап сделки<span className="text-red-600">*</span>
              </FieldLabel>
              <Select
                name="stage"
                value={dealFormData.stageId}
                onValueChange={(val) => updateField("stageId", val)}
              >
                <SelectTrigger className="w-[180px]">
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
              <FieldLabel htmlFor="material" className="gap-0.5">
                Материал
                <span className="text-red-600">*</span>
              </FieldLabel>
              <Select
                name="material"
                value={dealFormData.materialId}
                onValueChange={(val) => updateField("materialId", val)}
              >
                <SelectTrigger className="w-[180px]">
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
        )}
        {!!dealFormData.serviceId && !!dealFormData.customerId && (
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-4">
            <div className="grid grid-cols-2 gap-2.5">
              <Field>
                <FieldLabel htmlFor="measurementUnit">
                  Единица измерения
                </FieldLabel>
                <Select
                  name="measurementUnit"
                  value={dealFormData.unitMeasurement}
                  onValueChange={(e) =>
                    updateField("unitMeasurement", e as MeasurementUnit)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Выберите единицу измерения" />
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
                <FieldLabel htmlFor="quantity">Количество</FieldLabel>
                <Input
                  type="number"
                  name="quantity"
                  placeholder="Введите количество"
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
                />
              </Field>
            </div>
            {dealFormData.serviceId === "687a88dfb6b13b70b6a575f3" && (
              <Field>
                <FieldLabel htmlFor="amountPerUnit">
                  Цена за еденицу (закупка)
                </FieldLabel>
                <InputGroup>
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
=======
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
>>>>>>> 266d4ce2dfe6edb8ff22fc65a123ff6f1d7beeba
                      );
                    }}
                  />
<<<<<<< HEAD
                </InputGroup>
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="purchaseTotal">
                Цена за еденицу (продажа)
              </FieldLabel>
              <InputGroup>
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
=======
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
>>>>>>> 266d4ce2dfe6edb8ff22fc65a123ff6f1d7beeba
        )}
      </FieldGroup>
    </FormSectionCard>
  );
}
