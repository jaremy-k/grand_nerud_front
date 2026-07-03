export default interface UserDto {
  id?: string;
  _id?: string;
  email: string;
  admin: boolean | null;

  name?: string | null;
  lastName?: string | null;
  fatherName?: string | null;
  hashed_password?: string;
  deletedAt?: string | null;
  deleted_at?: string | null;
  isDeleted?: boolean | null;
  is_deleted?: boolean | null;
  profit?: {
    cash: {
      alone: number;
      withPartners: number;
    };
    nonCash: {
      alone: number;
      withPartners: number;
    };
  };
}
