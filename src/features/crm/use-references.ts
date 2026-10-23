import useAuthContext from "@/contexts/auth-context";
import { materialsService, usersService } from "@/services";
import { getLeadStages } from "@/services/lead-stages";
import type { MaterialDto, UserDto } from "@definitions/dto";
import type { LeadStageDto } from "@/definitions/dto/lead";
import { useEffect, useState } from "react";
import { sortLeadStages } from "./utils";

export function useCrmReferences() {
  const { user } = useAuthContext();
  const elevated = Boolean(user?.admin || user?.manager);
  const [materials, setMaterials] = useState<MaterialDto[]>([]);
  const [owners, setOwners] = useState<UserDto[]>([]);
  const [stages, setStages] = useState<LeadStageDto[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.allSettled([
      materialsService.getMaterials(), getLeadStages(),
      elevated ? usersService.getUsers() : Promise.resolve([] as UserDto[]),
    ]).then(([materialResult, stageResult, ownerResult]) => {
      if (!active) return;
      if (materialResult.status === "fulfilled") setMaterials(materialResult.value.filter((item) => !item.is_deleted));
      if (stageResult.status === "fulfilled") setStages(sortLeadStages(stageResult.value));
      if (ownerResult.status === "fulfilled") setOwners((elevated ? ownerResult.value : user ? [user] : []).filter((item) => !item.is_deleted && !item.isDeleted));
      const failure = [materialResult, stageResult, ownerResult].find((item) => item.status === "rejected");
      if (failure?.status === "rejected") setError(failure.reason instanceof Error ? failure.reason.message : "Не удалось загрузить справочники");
    });
    return () => { active = false; };
  }, [elevated, user]);
  return { materials, owners, stages, elevated, user, error };
}
