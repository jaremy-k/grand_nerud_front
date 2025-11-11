export default interface CreateCompanyRequest {
  name: string;
  abbreviatedName?: string;
  inn?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contacts: any[];
  type: string;
  deleted_at?: string;
  is_deleted?: boolean;
}
