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
  ContactPerson,
} from "@definitions/dto";
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

export type CompanyFilters = {
  role?: CompanyRole;
  includeDetails?: boolean;
  city?: string;
  administrativeDistrict?: string;
  district?: string;
};

function normalizeContactPersons(
  contactPersons: ContactPerson[]
): ContactPerson[] {
  return contactPersons.map((person) => {
    const optionalFields = {
      position: person.position?.trim() || undefined,
      inn: person.inn?.replace(/\D/g, "") || undefined,
      phone: person.phone?.trim() || undefined,
      email: person.email?.trim() || undefined,
      comment: person.comment?.trim() || undefined,
      isPrimary: person.isPrimary || undefined,
    };

    return {
      name: person.name.trim(),
      ...optionalFields,
    };
  });
}

export async function importCompanies(
  file: File,
  role?: CompanyRole
): Promise<CompanyImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  const query = role ? `?role=${encodeURIComponent(role)}` : "";
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
    contactPersons: normalizeContactPersons(data.contactPersons),
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
    contactPersons: data.contactPersons
      ? normalizeContactPersons(data.contactPersons)
      : undefined,
    inn:
      data.inn != null && data.inn !== ""
        ? data.inn.replace(/\D/g, "")
        : data.inn,
  };
  return securePatchData(apiPath(`/companies/${id}`), payload);
}
