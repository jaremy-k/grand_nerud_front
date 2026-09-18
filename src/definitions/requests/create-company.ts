import type { CompanyRole, ContactPerson } from "@definitions/dto";

export default interface CreateCompanyRequest {
  name: string;
  abbreviatedName?: string;
  inn?: string;
  kpp?: string;
  roles: CompanyRole[];
  contacts: Record<string, unknown>[];
  contactPersons: ContactPerson[];
  comment?: string;
  type?: string;
  deleted_at?: string;
  is_deleted?: boolean;
}
