import { describe, expect, it } from "vitest";
import { parseCoordinates, parseDecimalInput } from "@/lib/number-input";
import { compareCompanyPrices, createCompanyMaterialPayload, getComparablePrice, getMaterialUnits } from "@/lib/company-materials";
import { changeDealField, createDealFormData, formatDeliveredQuantity, isFormDataEqual } from "@features/deals/hooks/deal-form/model";
import type { CompanyDto } from "@definitions/dto";
import { deal, services } from "./fixtures";

describe("Координаты и цены", () => {
  it.each(["", " ", "NaN", "Infinity", "0x10", "1e3", "1.2.3"])("не превращает %j в допустимую цену", (value) => {
    expect(parseDecimalInput(value)).toBeNull();
  });
  it.each([["", ""], ["", "55"], ["37", " "], ["181", "55"], ["37", "-91"]])("отклоняет координаты %j, %j", (lon, lat) => {
    expect(parseCoordinates(lon, lat)).toBeNull();
  });
  it("принимает настоящие нули, границы диапазона и запятую", () => {
    expect(parseCoordinates("0", "0")).toEqual([0, 0]);
    expect(parseCoordinates("-180", "90")).toEqual([-180, 90]);
    expect(parseCoordinates("37,6176", "55,7558")).toEqual([37.6176, 55.7558]);
  });
  const form = { materialId: "sand", price: "1250,50", unit: " т ", comment: "" };
  it("отправляет очищенный комментарий и десятичную цену", () => {
    expect(createCompanyMaterialPayload("company", form)).toEqual({ companyId: "company", materialId: "sand", price: 1250.5, unit: "т", comment: "" });
  });
  it.each(["", " ", "-1", "abc"])("не сохраняет ошибочную цену %j", (price) => {
    expect(() => createCompanyMaterialPayload("company", { ...form, price })).toThrow();
  });
  it("разрешает явно введённую нулевую цену", () => {
    expect(createCompanyMaterialPayload("company", { ...form, price: "0" }).price).toBe(0);
  });
});

describe("Сопоставимость прайс-листов", () => {
  const company = { materialsWithPrices: [
    { materialId: "sand", price: 1000, unit: "тонна" },
    { materialId: "sand", price: 200, unit: "м³" },
    { materialId: "gravel", price: 100, unit: "т" },
  ] } as CompanyDto;
  const empty = { materialsWithPrices: [] } as unknown as CompanyDto;
  it("сравнивает один материал и одну единицу, распознаёт только алиасы", () => {
    expect(getComparablePrice(company, "sand", "т")).toBe(1000);
    expect(getComparablePrice(company, "sand", "куб.м")).toBe(200);
    expect(getComparablePrice(company, "", "т")).toBeNull();
    expect(getComparablePrice(company, "sand", "")).toBeNull();
    expect(getMaterialUnits([company], "sand")).toEqual(["м³", "т"]);
  });
  it.each(["asc", "desc"])("оставляет отсутствующую цену в конце: %s", (direction) => {
    expect([empty, company].sort((a, b) => compareCompanyPrices(a, b, "sand", "т", direction))).toEqual([company, empty]);
    expect(compareCompanyPrices(empty, empty, "sand", "т", direction)).toBe(0);
  });
});

describe("Изменения формы сделки", () => {
  it("сохраняет единицу и дату каждой доставки при обычном редактировании", () => {
    const form = createDealFormData(deal);
    const edited = changeDealField(form, "notes", "Новый комментарий", services, true);
    expect(formatDeliveredQuantity(edited.deliveredQuantity, "куб.м")).toEqual(deal.deliveredQuantity);
    expect(isFormDataEqual(form, edited)).toBe(false);
    expect(isFormDataEqual(form, createDealFormData(deal))).toBe(true);
  });
  it("не меняет основную единицу при фактических доставках", () => {
    const form = createDealFormData(deal);
    expect(changeDealField(form, "unitMeasurement", "куб.м", services, true)).toBe(form);
  });
  it("не подменяет доставки с разными единицами общей единицей сделки", () => {
    const form = createDealFormData({ ...deal, deliveredQuantity: [...deal.deliveredQuantity!, { quantity: 5, unit: "м³", date: "2026-10-21 00:00" }] });
    expect(formatDeliveredQuantity(form.deliveredQuantity, "тонна").map((item) => item.unit)).toEqual(["т", "м³"]);
  });
  it("учитывает изменение единицы в признаке изменений", () => {
    const form = createDealFormData(deal);
    expect(isFormDataEqual(form, { ...form, deliveredQuantity: form.deliveredQuantity.map((item) => ({ ...item, unit: "м³" })) })).toBe(false);
  });
  it("переключение услуги сохраняет совместимые данные", () => {
    const form = createDealFormData(deal);
    const next = changeDealField(form, "serviceId", "transport", services, true);
    expect(next).toMatchObject({ materialId: "sand", quantity: "100", stageId: "stage", shippingAddressId: "shipping", deliveryAddressId: "object", methodReceiving: "доставка", amountSalesUnit: "0", amountPurchaseUnit: "0" });
    expect(next.deliveredQuantity).toEqual(form.deliveredQuantity);
  });
});
