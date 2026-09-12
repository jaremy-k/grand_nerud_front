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
