import type CompanyDto from "./company";
import type DealDto from "./deal";
import type MaterialDto from "./material";

export type LeadStageKind = "new" | "in_progress" | "qualified" | "deferred" | "unqualified" | "converted";
export type LeadPriority = "low" | "normal" | "high" | "urgent";
export interface LeadStageDto {
  _id: string;
  name: string;
  kind: LeadStageKind;
  order?: number;
  isSystem?: boolean;
}
export interface LeadContactPerson {
  name: string;
  position?: string;
  phones?: string[];
  emails?: string[];
}
export default interface LeadDto {
  _id: string;
  title: string;
  ownerId: string;
  stageId: string;
  status?: LeadStageKind;
  priority: LeadPriority;
  companyId?: string | null;
  company?: CompanyDto | null;
  stage?: LeadStageDto | null;
  contactPerson?: LeadContactPerson | null;
  source?: string | null;
  materialIds: string[];
  materials?: MaterialDto[];
  quantity?: number | null;
  unitMeasurement?: string | null;
  objectAddressId?: string | null;
  objectAddress?: string | null;
  budget?: number | null;
  expectedPurchaseAt?: string | null;
  nextContactAt?: string | null;
  followUpTaskId?: string | null;
  lossReason?: string | null;
  notes?: string | null;
  dealId?: string | null;
  convertedAt?: string | null;
  conversionPending?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export interface LeadActivityDto {
  _id: string;
  userId: string;
  createdAt: string;
  type: string;
  comment?: string | null;
  details?: Record<string, unknown>;
}
export interface LeadConversionResult {
  lead: LeadDto;
  deal: DealDto;
}
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
