export interface CreateCompanyMaterialRequest {
  companyId: string;
  materialId: string;
  price: number;
  unit: string;
  comment?: string;
}

export type UpdateCompanyMaterialRequest =
  Partial<CreateCompanyMaterialRequest>;
