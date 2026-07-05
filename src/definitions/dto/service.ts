export default interface ServiceDto {
  _id: string;
  name: string;
  kind?: "sales" | "sales_with_delivery" | "utilization" | "transport";
  deleted_at?: string;
  is_deleted?: boolean;
}
