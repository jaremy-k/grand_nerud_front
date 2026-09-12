import { apiPath } from "@/lib/api";
import { secureGetData, securePostData } from "@/lib/fetch";
import { CompanyDto } from "@definitions/dto";
import { CreateCompanyRequest } from "@definitions/requests";

export async function getCompanies(): Promise<CompanyDto[]> {
  return secureGetData(apiPath("/companies"));
}

export async function getCompany(id: string): Promise<CompanyDto> {
  return secureGetData(apiPath(`/companies/${id}`));
}

function innLookupErrorMessage(inn: string): string {
  return `Организация с ИНН ${inn} не найдена. Проверьте номер.`;
}

export async function getCompanyInfoByINN(inn: string): Promise<CompanyDto> {
  const cleanedInn = inn.replace(/\D/g, "");
  if (cleanedInn.length !== 10 && cleanedInn.length !== 12) {
    throw new Error(innLookupErrorMessage(cleanedInn || inn));
  }
  try {
    return await secureGetData(apiPath(`/companies/fns/${cleanedInn}`));
  } catch {
    throw new Error(innLookupErrorMessage(cleanedInn));
  }
}

export async function createCompany(
  data: CreateCompanyRequest
): Promise<CompanyDto> {
  const payload: CreateCompanyRequest = {
    ...data,
    inn:
      data.inn != null && data.inn !== ""
        ? data.inn.replace(/\D/g, "")
        : data.inn,
  };
  return securePostData(apiPath("/companies"), payload);
}
