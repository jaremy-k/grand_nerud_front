import { apiPath } from "@/lib/api";
import { secureGetData, securePatchData, securePostData } from "@/lib/fetch";
import { UserDto } from "@definitions/dto";

export type UserProfit = NonNullable<UserDto["profit"]>;

export type CreateUserRequest = {
  email: string;
  password: string;
  name?: string;
  lastName?: string;
  fatherName?: string;
  admin?: boolean;
  profit?: UserProfit;
};

export type UpdateUserRequest = {
  email?: string;
  password?: string;
  name?: string;
  lastName?: string;
  fatherName?: string;
  admin?: boolean;
  profit?: UserProfit;
};

function normalizeUser(data: Record<string, unknown>): UserDto {
  const id = String(data.id ?? data._id ?? "");
  return {
    ...(data as unknown as UserDto),
    id,
    _id: id,
  };
}

export async function getUsers(): Promise<UserDto[]> {
  const users = await secureGetData<Record<string, unknown>[]>(
    apiPath("/auth/all")
  );
  return users.map(normalizeUser);
}

export async function createUser(body: CreateUserRequest): Promise<UserDto> {
  const data = await securePostData<Record<string, unknown>>(
    apiPath("/auth/users"),
    body
  );
  return normalizeUser(data);
}

export async function updateUser(
  id: string,
  body: UpdateUserRequest
): Promise<UserDto> {
  const data = await securePatchData<Record<string, unknown>>(
    apiPath(`/auth/users/${id}`),
    body
  );
  return normalizeUser(data);
}

export const DEFAULT_USER_PROFIT: UserProfit = {
  cash: { alone: 0.1, withPartners: 0.1 },
  nonCash: { alone: 0.1, withPartners: 0.1 },
};
