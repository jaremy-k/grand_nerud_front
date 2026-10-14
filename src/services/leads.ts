import { apiPath } from "@/lib/api";
import { secureDeleteData, secureGetData, securePatchData, securePostData } from "@/lib/fetch";
import type LeadDto from "@/definitions/dto/lead";
import type { LeadActivityDto, LeadConversionResult, LeadPriority, PaginatedResult } from "@/definitions/dto/lead";
import type { CreateLeadRequest, UpdateLeadRequest } from "@/definitions/requests/lead";
import type { CreateDealRequest } from "@definitions/requests";
import { crmQuery } from "./crm-query";

export type LeadFilters = {
  page?: number; pageSize?: number; search?: string; stageId?: string;
  status?: string; priority?: LeadPriority; companyId?: string; ownerId?: string;
};
export function getLeads(filters: LeadFilters = {}, options: RequestInit = {}) {
  return secureGetData<PaginatedResult<LeadDto>>(apiPath(`/leads${crmQuery(filters)}`), options);
}
export function getLead(id: string, options: RequestInit = {}) {
  return secureGetData<LeadDto>(apiPath(`/leads/${id}`), options);
}
export function createLead(data: CreateLeadRequest) {
  return securePostData<LeadDto>(apiPath("/leads"), data);
}
export function updateLead(id: string, data: UpdateLeadRequest) {
  return securePatchData<LeadDto>(apiPath(`/leads/${id}`), data);
}
export function deleteLead(id: string) {
  return secureDeleteData<void>(apiPath(`/leads/${id}`));
}
export function getLeadActivities(id: string, page = 1, options: RequestInit = {}) {
  return secureGetData<PaginatedResult<LeadActivityDto>>(
    apiPath(`/leads/${id}/activities${crmQuery({ page, pageSize: 30 })}`), options
  );
}
export function createLeadActivity(id: string, data: { type: "note" | "call" | "meeting" | "email"; comment: string }) {
  return securePostData<LeadActivityDto>(apiPath(`/leads/${id}/activities`), data);
}
export function convertLead(id: string, data: Partial<CreateDealRequest>) {
  return securePostData<LeadConversionResult>(apiPath(`/leads/${id}/convert`), data);
}
