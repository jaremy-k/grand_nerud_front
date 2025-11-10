export default interface CompanyDto {
  _id: string;
  name: string;
  abbreviatedName: string;
  inn: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contacts: Record<string, any>[];
  deleted_at: string;
  is_deleted: boolean;
}
