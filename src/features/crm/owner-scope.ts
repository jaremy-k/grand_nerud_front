import type { UserDto } from "@definitions/dto";

export type CrmOwnerScope = {
  value: string;
  ownerId?: string;
  elevated: boolean;
  error: string | null;
};

export function resolveOwnerScope(user: UserDto | null, params: URLSearchParams): CrmOwnerScope {
  const elevated = Boolean(user?.admin || user?.manager);
  const currentId = user?.id || user?._id;
  if (elevated && params.get("scope") === "team") {
    return { value: "team", elevated, error: null };
  }
  const requestedId = elevated ? params.get("ownerId") : null;
  const ownerId = requestedId || currentId;
  return {
    value: ownerId && ownerId !== currentId ? `owner:${ownerId}` : "mine",
    ownerId,
    elevated,
    error: ownerId ? null : "Не удалось определить текущего сотрудника",
  };
}

export function updateCrmParams(params: URLSearchParams, values: Record<string, string | undefined>): URLSearchParams {
  const next = new URLSearchParams(params);
  next.delete("page");
  for (const [key, value] of Object.entries(values)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  return next;
}

export function ownerScopeParams(scope: CrmOwnerScope): Record<string, string | undefined> {
  return { scope: scope.value === "team" ? "team" : undefined, ownerId: scope.ownerId };
}

export function crmScopeLink(path: string, scope: CrmOwnerScope, filters: Record<string, string> = {}): string {
  const params = updateCrmParams(new URLSearchParams(), { ...filters, ...ownerScopeParams(scope) });
  return `${path}?${params.toString()}`;
}

export function crmPage(params: URLSearchParams): number {
  const page = Number(params.get("page"));
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}
