export type CompanyImportError = {
  row: number;
  detail: string;
};

export default interface CompanyImportResult {
  totalRows: number;
  created: number;
  updated: number;
  skipped: number;
  errors: CompanyImportError[];
}
