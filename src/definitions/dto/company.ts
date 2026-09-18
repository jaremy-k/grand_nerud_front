export type CompanyRole = "provider" | "customer";

export default interface CompanyDto {
  _id: string;
  name: string;
  abbreviatedName?: string;
  inn?: string;
  kpp?: string;
  type?: string;
  roles: CompanyRole[];
  contacts: Record<string, unknown>[];
  comment?: string;
  deleted_at?: string;
  is_deleted?: boolean;
}
