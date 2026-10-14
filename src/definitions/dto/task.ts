import type CompanyDto from "./company";
import type LeadDto from "./lead";

export type TaskType = "call" | "meeting" | "email" | "other";
export type TaskStatus = "open" | "completed" | "cancelled";
export default interface TaskDto {
  _id: string;
  title: string;
  dueAt: string;
  type: TaskType;
  status: TaskStatus;
  ownerId: string;
  companyId?: string | null;
  leadId?: string | null;
  dealId?: string | null;
  company?: CompanyDto | null;
  lead?: LeadDto | null;
  comment?: string | null;
  result?: string | null;
  createdAt?: string;
  completedAt?: string | null;
}
