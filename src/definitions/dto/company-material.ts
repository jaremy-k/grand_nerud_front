import type CompanyDto from "./company";
import type MaterialDto from "./material";

export default interface CompanyMaterialDto {
  _id: string;
  companyId: string;
  materialId: string;
  price: number;
  unit: string;
  comment?: string;
  company?: Pick<CompanyDto, "_id" | "name">;
  material?: Pick<MaterialDto, "_id" | "name">;
}
