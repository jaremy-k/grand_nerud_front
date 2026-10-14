import { apiPath } from "@/lib/api";
import { secureDeleteData, secureGetData, securePatchData, securePostData } from "@/lib/fetch";
import type { LeadStageDto } from "@/definitions/dto/lead";

type LeadStageRequest = Pick<LeadStageDto, "name" | "kind"> & { order?: number };
export function getLeadStages() {
  return secureGetData<LeadStageDto[]>(apiPath("/lead-stages"));
}
export function createLeadStage(data: LeadStageRequest) {
  return securePostData<LeadStageDto>(apiPath("/lead-stages"), data);
}
export function updateLeadStage(id: string, data: Partial<LeadStageRequest>) {
  return securePatchData<LeadStageDto>(apiPath(`/lead-stages/${id}`), data);
}
export function deleteLeadStage(id: string) {
  return secureDeleteData<void>(apiPath(`/lead-stages/${id}`));
}
