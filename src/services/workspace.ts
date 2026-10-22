import { apiPath } from "@/lib/api";
import { secureGetData } from "@/lib/fetch";
import type { WorkspaceLeadsDto, WorkspaceTasksDto } from "@/definitions/dto/workspace";
import { crmQuery } from "./crm-query";

export type WorkspaceFilters = { scope?: "mine" | "team"; ownerId?: string; timezone?: string; limit?: number };
const query = (filters: WorkspaceFilters) => crmQuery({ scope: "mine", timezone: "Europe/Moscow", limit: 6, ...filters });

export function getWorkspaceTasks(filters: WorkspaceFilters = {}, options: RequestInit = {}) {
  return secureGetData<WorkspaceTasksDto>(apiPath(`/workspace/tasks${query(filters)}`), options);
}
export function getWorkspaceLeads(filters: WorkspaceFilters = {}, options: RequestInit = {}) {
  return secureGetData<WorkspaceLeadsDto>(apiPath(`/workspace/leads${query(filters)}`), options);
}
