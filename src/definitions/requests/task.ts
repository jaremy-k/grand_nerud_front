import type { TaskStatus, TaskType } from "../dto/task";

export interface CreateTaskRequest {
  title: string;
  dueAt: string;
  type?: TaskType;
  ownerId?: string;
  companyId?: string | null;
  leadId?: string | null;
  dealId?: string | null;
  comment?: string | null;
}
export type UpdateTaskRequest = Partial<CreateTaskRequest> & {
  status?: TaskStatus;
  result?: string | null;
};
