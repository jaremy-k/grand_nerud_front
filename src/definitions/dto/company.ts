export type CompanyRole = "provider" | "customer";

export type ContactPerson = {
  name: string;
  inn?: string;
  position?: string;
  phone?: string;
  email?: string;
  comment?: string;
  isPrimary?: boolean;
};

export default interface CompanyDto {
  _id: string;
  name: string;
  abbreviatedName?: string;
  inn?: string;
  kpp?: string;
  type?: string;
  roles: CompanyRole[];
  contacts: Record<string, unknown>[];
  contactPersons: ContactPerson[];
  phones?: string[];
  emails?: string[];
  websites?: string[];
  source?: string;
  segments?: string[];
  comment?: string;
  deleted_at?: string;
  is_deleted?: boolean;
}
