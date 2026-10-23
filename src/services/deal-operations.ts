import { apiPath } from "@/lib/api";
import { secureGetData, securePatchData, securePostData } from "@/lib/fetch";
import type { DealOperationsDto, OperationResource, PaymentWrite, ShipmentWrite } from "@/definitions/dto/deal-operations";

const root = (dealId: string) => `/deals/${encodeURIComponent(dealId)}`;
export function getDealOperations(dealId: string, historyPage = 1, options: RequestInit = {}) {
  return secureGetData<DealOperationsDto>(apiPath(`${root(dealId)}/operations?historyPage=${historyPage}`), options);
}
export function saveDealPayment(dealId: string, data: PaymentWrite, id?: string) {
  const url = apiPath(`${root(dealId)}/payments${id ? `/${encodeURIComponent(id)}` : ""}`);
  return id ? securePatchData<DealOperationsDto>(url, data) : securePostData<DealOperationsDto>(url, data);
}
export function saveDealShipment(dealId: string, data: ShipmentWrite, id?: string) {
  const url = apiPath(`${root(dealId)}/shipments${id ? `/${encodeURIComponent(id)}` : ""}`);
  return id ? securePatchData<DealOperationsDto>(url, data) : securePostData<DealOperationsDto>(url, data);
}
export function cancelDealOperation(dealId: string, resource: OperationResource, id: string, revision: string, reason: string) {
  return securePostData<DealOperationsDto>(apiPath(`${root(dealId)}/${resource}/${encodeURIComponent(id)}/cancel`), { revision, reason });
}
