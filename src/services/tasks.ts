import { apiPath } from "@/lib/api";
import { secureDeleteData, secureGetData, securePatchData, securePostData } from "@/lib/fetch";
import type TaskDto from "@/definitions/dto/task";
import type { TaskStatus, TaskType } from "@/definitions/dto/task";
import type { PaginatedResult } from "@/definitions/dto/lead";
import type { CreateTaskRequest, UpdateTaskRequest } from "@/definitions/requests/task";
import { crmQuery } from "./crm-query";

export type TaskFilters = {
  page?: number; pageSize?: number; bucket?: "today" | "overdue" | "upcoming";
  status?: TaskStatus; type?: TaskType; ownerId?: string; companyId?: string;
  leadId?: string; dealId?: string; dateFrom?: string; dateTo?: string;
};
export function getTasks(filters: TaskFilters = {}, options: RequestInit = {}) {
  return secureGetData<PaginatedResult<TaskDto>>(
    apiPath(`/tasks${crmQuery({ timezone: "Europe/Moscow", ...filters })}`), options
  );
}
export function getTask(id: string) {
  return secureGetData<TaskDto>(apiPath(`/tasks/${id}`));
}
export function createTask(data: CreateTaskRequest) {
  return securePostData<TaskDto>(apiPath("/tasks"), data);
}
export function updateTask(id: string, data: UpdateTaskRequest) {
  return securePatchData<TaskDto>(apiPath(`/tasks/${id}`), data);
}
export function deleteTask(id: string) {
  return secureDeleteData<void>(apiPath(`/tasks/${id}`));
}
