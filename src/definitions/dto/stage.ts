export default interface StageDto {
  _id: string;
  name: string;
  order?: number;
  deleted_at?: string;
  is_deleted?: boolean;
}
