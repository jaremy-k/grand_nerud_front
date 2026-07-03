import { apiPath } from "@/lib/api";
import { setAccessToken } from "@/lib/cookies";
import { postData, secureGetData } from "@/lib/fetch";
import { UserDto } from "@definitions/dto";

function normalizeUser(data: Record<string, unknown>): UserDto {
  const id = String(data.id ?? data._id ?? "");
  return {
    ...(data as unknown as UserDto),
    id,
    _id: id,
  };
}

export async function login(email: string, password: string): Promise<void> {
  const response = await postData<{ access_token: string }>(
    apiPath("/auth/login"),
    { email, password }
  );
  setAccessToken(response.access_token);
}

export async function getMe(): Promise<UserDto> {
  const data = await secureGetData<Record<string, unknown>>(apiPath("/auth/me"));
  return normalizeUser(data);
}
