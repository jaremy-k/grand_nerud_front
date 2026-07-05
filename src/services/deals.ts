import { apiPath } from "@/lib/api";
import {
  secureDeleteData,
  secureGetData,
  securePatchData,
  securePostData,
} from "@/lib/fetch";
import { DealDto } from "@definitions/dto";
import {
  CreateDealRequest,
  PreviewDealRequest,
  PreviewDealResult,
  UpdateDealRequest,
} from "@definitions/requests";
import { DealFilters } from "@features/deals/definitions";

export async function getDeals(
  params: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
    includeDeleted?: boolean;
    includeRelations?: boolean;
    filters?: DealFilters;
  } = {},
  options: RequestInit = {}
): Promise<{
  items: DealDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const pageSize = params?.pageSize || 25;
  const page = params?.page || 1;
  const sortBy = params?.sortBy || "createdAt";
  const sortOrder = params?.sortOrder || "desc";

  const filters = Object.entries(params.filters || {}).reduce(
    (pv, [key, val]) => (val === "all" ? pv : `${pv}&${key}=${val}`),
    ""
  );

  return secureGetData(
    apiPath(
      `/deals?sortBy=${sortBy}&sortOrder=${sortOrder}&page_size=${pageSize}&page=${page}&includeDeleted=${
        params.includeDeleted === false ? "false" : "true"
      }&includeRelations=${params.includeRelations ? "true" : "false"}${filters}`
    ),
    options
  );
}

export async function getDealsAdmin(): Promise<DealDto[]> {
  return secureGetData(apiPath("/deals/admin/all"));
}

export async function previewDeal(
  body: PreviewDealRequest,
  options: RequestInit = {}
): Promise<PreviewDealResult> {
  return securePostData(apiPath("/deals/preview"), body, options);
}

export async function createDeal(
  dealData: CreateDealRequest
): Promise<DealDto> {
  return securePostData(apiPath("/deals"), dealData);
}

export async function getDeal(id: string): Promise<DealDto> {
  return secureGetData(apiPath(`/deals/${id}`));
}

export async function updateDeal(id: string, body: UpdateDealRequest) {
  return securePatchData(apiPath(`/deals/${id}`), body);
}

export async function updateDealStage(id: string, stageId: string) {
  return securePatchData(apiPath(`/deals/${id}/stage`), { stageId });
}

export async function deleteDeal(id: string) {
  return secureDeleteData(apiPath(`/deals/${id}`));
}
