import { apiPath } from "@/lib/api";
import {
  secureGetData,
  securePatchData,
  securePostData,
  securePostFormData,
} from "@/lib/fetch";
import {
  CompanyDto,
  CompanyImportResult,
  CompanyRole,
} from "@definitions/dto";
import {
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from "@definitions/requests";
import { contactValues, normalizeContactPersons } from "@/lib/company-contacts";
import type { PaginatedResult } from "@/definitions/dto/lead";
import { crmQuery } from "./crm-query";

type CompaniesResponse =
  | CompanyDto[]
  | {
      items?: CompanyDto[];
      data?: CompanyDto[];
      companies?: CompanyDto[];
    };

function normalizeCompanies(response: CompaniesResponse): CompanyDto[] {
  if (Array.isArray(response)) return response.map(normalizeCompany);
  if (Array.isArray(response.items)) return response.items.map(normalizeCompany);
  if (Array.isArray(response.data)) return response.data.map(normalizeCompany);
  if (Array.isArray(response.companies)) return response.companies.map(normalizeCompany);
  return [];
}

function normalizeCompany(company: CompanyDto): CompanyDto {
  return { ...company, inn: company.inn == null ? undefined : String(company.inn), kpp: company.kpp == null ? undefined : String(company.kpp),
    roles: company.roles ?? [], contacts: company.contacts ?? [],
    contactPersons: (company.contactPersons ?? []).map((person) => ({ ...person, inn: person.inn == null ? undefined : String(person.inn) })),
  };
}

export type CompanyFilters = {
  role?: CompanyRole;
  includeDetails?: boolean;
  city?: string;
  administrativeDistrict?: string;
  district?: string;
};

export type CompanyPageFilters = CompanyFilters & {
  page?: number; pageSize?: number; search?: string; sortBy?: "recent" | "name";
  materialId?: string; priceUnit?: string; maxPrice?: number; priceSort?: "default" | "asc" | "desc";
};

export async function getCompaniesPage(filters: CompanyPageFilters = {}, options: RequestInit = {}) {
  const response = await secureGetData<PaginatedResult<CompanyDto>>(apiPath(`/companies/page${crmQuery({ page: 1, pageSize: 15, ...filters })}`), options);
  return { ...response, items: response.items.map(normalizeCompany) };
}

export async function importCompanies(
  file: File,
  role?: CompanyRole,
  createLeads = false
): Promise<CompanyImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (createLeads) params.set("createLeads", "true");
  const query = params.size ? `?${params.toString()}` : "";
  return securePostFormData(apiPath(`/companies/import${query}`), formData);
}

export async function getCompanies(
  roleOrFilters?: CompanyRole | CompanyFilters
): Promise<CompanyDto[]> {
  const filters =
    typeof roleOrFilters === "string"
      ? { role: roleOrFilters }
      : roleOrFilters ?? {};
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const query = params.size ? `?${params.toString()}` : "";
  const response = await secureGetData<CompaniesResponse>(
    apiPath(`/companies${query}`)
  );
  const companies = normalizeCompanies(response);

  if (!filters.role || companies.length > 0) return companies;

  const hasAdditionalFilters = Boolean(
    filters.city || filters.administrativeDistrict || filters.district
  );
  if (hasAdditionalFilters) return companies;

  // Compatibility for installations where roles have not been migrated yet.
  const fallbackParams = new URLSearchParams();
  if (filters.includeDetails) fallbackParams.set("includeDetails", "true");
  const fallbackQuery = fallbackParams.size
    ? `?${fallbackParams.toString()}`
    : "";
  const allResponse = await secureGetData<CompaniesResponse>(
    apiPath(`/companies${fallbackQuery}`)
  );
  return normalizeCompanies(allResponse).filter(
    (company) =>
      !company.roles?.length || company.roles.includes(filters.role as CompanyRole)
  );
}

export async function getCompany(id: string, options: RequestInit = {}): Promise<CompanyDto> {
  return normalizeCompany(await secureGetData<CompanyDto>(apiPath(`/companies/${id}`), options));
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
    return `Компания с ИНН ${inn} не найдена. Заполните данные компании вручную.`;
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
    contactPersons: normalizeContactPersons(data.contactPersons),
    phones: data.phones ? contactValues(data.phones) : undefined,
    emails: data.emails ? contactValues(data.emails, true) : undefined,
    inn:
      data.inn != null && data.inn !== ""
        ? data.inn.replace(/\D/g, "")
        : data.inn,
  };
  return normalizeCompany(await securePostData<CompanyDto>(apiPath("/companies"), payload));
}

export async function updateCompany(
  id: string,
  data: UpdateCompanyRequest
): Promise<CompanyDto> {
  const payload: UpdateCompanyRequest = {
    ...data,
    contactPersons: data.contactPersons
      ? normalizeContactPersons(data.contactPersons)
      : undefined,
    phones: data.phones ? contactValues(data.phones) : undefined,
    emails: data.emails ? contactValues(data.emails, true) : undefined,
    inn:
      data.inn != null && data.inn !== ""
        ? data.inn.replace(/\D/g, "")
        : data.inn,
  };
  return normalizeCompany(await securePatchData<CompanyDto>(apiPath(`/companies/${id}`), payload));
}
