import { apiPath } from "@/lib/api";
import {
  secureDeleteData,
  secureGetData,
  securePatchData,
  securePostData,
} from "@/lib/fetch";
import { CompanyMaterialDto } from "@definitions/dto";
import {
  CreateCompanyMaterialRequest,
  UpdateCompanyMaterialRequest,
} from "@definitions/requests";

export async function getCompanyMaterials(
  companyId?: string
): Promise<CompanyMaterialDto[]> {
  const query = companyId
    ? `?companyId=${encodeURIComponent(companyId)}`
    : "";
  return secureGetData(apiPath(`/company-materials${query}`));
}

export async function getCompanyMaterial(
  id: string
): Promise<CompanyMaterialDto> {
  return secureGetData(apiPath(`/company-materials/${id}`));
}

export async function createCompanyMaterial(
  data: CreateCompanyMaterialRequest
): Promise<CompanyMaterialDto> {
  return securePostData(apiPath("/company-materials"), data);
}

export async function updateCompanyMaterial(
  id: string,
  data: UpdateCompanyMaterialRequest
): Promise<CompanyMaterialDto> {
  return securePatchData(apiPath(`/company-materials/${id}`), data);
}

export async function deleteCompanyMaterial(id: string): Promise<void> {
  return secureDeleteData(apiPath(`/company-materials/${id}`));
}
