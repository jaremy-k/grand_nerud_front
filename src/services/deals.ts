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
import { crmQuery } from "./crm-query";

type DealResponse = Omit<DealDto, "shippingAddress" | "deliveryAddress"> & {
  shippingAddress?: DealDto["shippingAddress"] | string;
  deliveryAddress?: DealDto["deliveryAddress"] | string;
  shipping_address?: DealDto["shippingAddress"];
  delivery_address?: DealDto["deliveryAddress"];
};

function normalizeDeal(deal: DealResponse): DealDto {
  return { ...deal,
    shippingAddress: typeof deal.shippingAddress === "object" && deal.shippingAddress
      ? deal.shippingAddress : deal.shipping_address ?? null,
    deliveryAddress: typeof deal.deliveryAddress === "object" && deal.deliveryAddress
      ? deal.deliveryAddress : deal.delivery_address ?? null,
  };
}

export async function getDeals(
  params: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
    includeDeleted?: boolean;
    includeRelations?: boolean;
    search?: string;
    companyId?: string;
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

  const filters = Object.fromEntries(Object.entries(params.filters ?? {}).filter(([, value]) => value && value !== "all"));
  const response = await secureGetData<{
    items: DealResponse[]; total: number; page: number; pageSize: number; totalPages: number;
  }>(apiPath(`/deals${crmQuery({ ...filters, sortBy, sortOrder, page_size: pageSize, page,
    includeDeleted: params.includeDeleted !== false, includeRelations: Boolean(params.includeRelations),
    search: params.search?.trim() || undefined, companyId: params.companyId || undefined,
  })}`), options);
  return { ...response, items: response.items.map(normalizeDeal) };
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

export async function getDeal(id: string, options: RequestInit = {}): Promise<DealDto> {
  return normalizeDeal(await secureGetData<DealResponse>(apiPath(`/deals/${id}`), options));
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
