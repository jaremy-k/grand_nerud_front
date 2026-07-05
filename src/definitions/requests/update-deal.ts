import CreateDealRequest from "./create-deal";

export default interface UpdateDealRequest extends Omit<
  CreateDealRequest,
  "serviceId" | "customerId"
> {}
