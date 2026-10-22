import type { CompanyDto } from "@definitions/dto";
import type { CreateCompanyMaterialRequest } from "@/definitions/requests/company-material";
import { parseDecimalInput } from "./number-input";

export function createCompanyMaterialPayload(companyId: string, form: {
  materialId: string; price: string; unit: string; comment: string;
}): CreateCompanyMaterialRequest {
  const price = parseDecimalInput(form.price);
  if (!form.materialId || !form.unit.trim() || price === null || price < 0) {
    throw new Error("Выберите материал, укажите неотрицательную цену и единицу измерения");
  }
  return { companyId, materialId: form.materialId, price, unit: form.unit.trim(), comment: form.comment.trim() };
}

export function normalizeMaterialUnit(unit: string): string {
  const value = unit.trim().toLowerCase();
  const aliases: Record<string, string> = {
    "т": "т", "тонна": "т", "тонн": "т", "тонны": "т",
    "м³": "м³", "м3": "м³", "куб.м": "м³", "куб. м": "м³",
    "шт.": "шт", "штука": "шт", "штук": "шт",
  };
  return aliases[value] || value;
}

export function getMaterialUnits(companies: CompanyDto[], materialId: string): string[] {
  if (!materialId) return [];
  return [...new Set(companies.flatMap((company) => (company.materialsWithPrices ?? [])
    .filter((item) => item.materialId === materialId)
    .map((item) => normalizeMaterialUnit(item.unit)).filter(Boolean)))].sort((a, b) => a.localeCompare(b, "ru"));
}

export function getComparablePrice(company: CompanyDto, materialId: string, unit: string): number | null {
  if (!materialId || !unit) return null;
  const prices = (company.materialsWithPrices ?? [])
    .filter((item) => item.materialId === materialId && normalizeMaterialUnit(item.unit) === normalizeMaterialUnit(unit))
    .map((item) => item.price).filter((price) => Number.isFinite(price) && price >= 0);
  return prices.length ? Math.min(...prices) : null;
}

export function compareCompanyPrices(left: CompanyDto, right: CompanyDto, materialId: string, unit: string, direction: string): number {
  const a = getComparablePrice(left, materialId, unit);
  const b = getComparablePrice(right, materialId, unit);
  if (a === null) return b === null ? 0 : 1;
  if (b === null) return -1;
  return direction === "desc" ? b - a : a - b;
}
