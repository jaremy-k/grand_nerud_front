export default interface UserDto {
  _id: string;
  email: string;
  admin: boolean | null;

  name?: string | null;
  lastName?: string | null;
  fatherName?: string | null;
  hashed_password?: string;
  deleted_at?: string | null;
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
