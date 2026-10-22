import type LeadDto from "./lead";
import type TaskDto from "./task";

export type WorkspacePreview<T> = { items: T[]; total: number; hasMore: boolean };
export type WorkspaceMeta = {
  generatedAt: string;
  timezone: string;
  localDate: string;
  scope: "mine" | "team" | "owner";
  ownerId: string | null;
  limit: number;
};
export type WorkspaceTasksDto = WorkspaceMeta & {
  overdue: WorkspacePreview<TaskDto>;
  today: WorkspacePreview<TaskDto>;
  upcoming: WorkspacePreview<TaskDto>;
};
export type WorkspaceLeadsDto = WorkspaceMeta & { newLeads: WorkspacePreview<LeadDto> };
