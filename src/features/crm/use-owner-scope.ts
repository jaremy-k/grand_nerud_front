import useAuthContext from "@/contexts/auth-context";
import { useSearchParams } from "react-router-dom";
import { resolveOwnerScope, updateCrmParams } from "./owner-scope";

export function useOwnerScope() {
  const { user } = useAuthContext();
  const [params, setParams] = useSearchParams();
  const scope = resolveOwnerScope(user, params);
  const changeScope = (value: string) => {
    if (!scope.elevated) return;
    setParams(updateCrmParams(params, {
      scope: value === "team" ? "team" : undefined,
      ownerId: value.startsWith("owner:") ? value.slice(6) : undefined,
    }));
  };
  return { scope, changeScope };
}
