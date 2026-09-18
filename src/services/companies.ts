import { apiPath } from "@/lib/api";
import { secureGetData, securePatchData, securePostData } from "@/lib/fetch";
import { CompanyDto, CompanyRole } from "@definitions/dto";
import {
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from "@definitions/requests";

type CompaniesResponse =
  | CompanyDto[]
  | {
      items?: CompanyDto[];
      data?: CompanyDto[];
      companies?: CompanyDto[];
    };

function normalizeCompanies(response: CompaniesResponse): CompanyDto[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.companies)) return response.companies;
  return [];
}

export async function getCompanies(role?: CompanyRole): Promise<CompanyDto[]> {
  const query = role ? `?role=${encodeURIComponent(role)}` : "";
  const response = await secureGetData<CompaniesResponse>(
    apiPath(`/companies${query}`)
  );
  const companies = normalizeCompanies(response);

  if (!role || companies.length > 0) return companies;

  // Compatibility for installations where roles have not been migrated yet.
  const allResponse = await secureGetData<CompaniesResponse>(
    apiPath("/companies")
  );
  return normalizeCompanies(allResponse).filter(
    (company) => !company.roles?.length || company.roles.includes(role)
  );
}

export async function getCompany(id: string): Promise<CompanyDto> {
  return secureGetData(apiPath(`/companies/${id}`));
}

function innLookupErrorMessage(err: unknown, inn: string): string {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  const lower = raw.toLowerCase();
  const notFound =
    !raw ||
    raw === "Not Found" ||
    lower.includes("not found") ||
    lower.includes("не найден") ||
    /http error! status: (404|422|400)/.test(lower);

  if (notFound) {
    return `Компания с ИНН ${inn} не найдена. Проверьте номер или добавьте клиента как физическое лицо.`;
  }
  return raw;
}

export async function getCompanyInfoByINN(inn: string): Promise<CompanyDto> {
  const cleanedInn = inn.replace(/\D/g, "");
  if (cleanedInn.length !== 10 && cleanedInn.length !== 12) {
    throw new Error(
      "ИНН должен содержать 10 цифр для юрлица или 12 цифр для ИП"
    );
  }
  try {
    return await secureGetData(apiPath(`/companies/fns/${cleanedInn}`));
  } catch (err) {
    throw new Error(innLookupErrorMessage(err, cleanedInn));
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

export async function updateCompany(
  id: string,
  data: UpdateCompanyRequest
): Promise<CompanyDto> {
  const payload: UpdateCompanyRequest = {
    ...data,
    inn:
      data.inn != null && data.inn !== ""
        ? data.inn.replace(/\D/g, "")
        : data.inn,
  };
  return securePatchData(apiPath(`/companies/${id}`), payload);
}
