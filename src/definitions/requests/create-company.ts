import type { CompanyRole } from "@definitions/dto";

export default interface CreateCompanyRequest {
  name: string;
  abbreviatedName?: string;
  inn?: string;
  kpp?: string;
  roles: CompanyRole[];
  contacts: Record<string, unknown>[];
  comment?: string;
  type?: string;
  deleted_at?: string;
  is_deleted?: boolean;
}
