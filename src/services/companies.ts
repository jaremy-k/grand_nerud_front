import { secureGetData, securePostData } from "@/lib/fetch";
import { CompanyDto } from "@definitions/dto";
import { CreateCompanyRequest } from "@definitions/requests";

export async function getCompanies(): Promise<CompanyDto[]> {
  return secureGetData("https://appgrand.worldautogroup.ru/companies");
}

export async function getCompany(id: string): Promise<CompanyDto> {
  return secureGetData(`https://appgrand.worldautogroup.ru/companies/${id}`);
}

export async function getCompanyInfoByINN(inn: string): Promise<CompanyDto> {
  return secureGetData(
    `https://appgrand.worldautogroup.ru/companies/get_company_info/${inn}`
  );
}

export async function createCompany(
  data: CreateCompanyRequest
): Promise<CompanyDto> {
  return securePostData("https://appgrand.worldautogroup.ru/companies", data);
}
