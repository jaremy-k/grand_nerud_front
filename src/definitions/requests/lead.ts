import type { LeadContactPerson, LeadPriority } from "../dto/lead";

export interface CreateLeadRequest {
  title: string;
  ownerId?: string;
  stageId?: string;
  priority?: LeadPriority;
  companyId?: string | null;
  contactPerson?: LeadContactPerson | null;
  source?: string | null;
  materialIds?: string[];
  quantity?: number | null;
  unitMeasurement?: string | null;
  objectAddressId?: string | null;
  objectAddress?: string | null;
  budget?: number | null;
  expectedPurchaseAt?: string | null;
  nextContactAt?: string | null;
  lossReason?: string | null;
  notes?: string | null;
}
export type UpdateLeadRequest = Partial<CreateLeadRequest>;
