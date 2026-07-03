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

export async function getCompanyInfoByINN(inn: string): Promise<CompanyDto> {
  const cleanedInn = inn.replace(/\D/g, "");
  return secureGetData(apiPath(`/companies/fns/${cleanedInn}`));
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
