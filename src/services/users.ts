import { apiPath } from "@/lib/api";
import { secureGetData } from "@/lib/fetch";
import { UserDto } from "@definitions/dto";

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
