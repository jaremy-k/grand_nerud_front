import type { AddressDetail } from "@definitions/dto";

export interface CreateAddressRequest {
  companyId: string;
  coordinates: [number, number];
  cityId?: string;
  adressDetail: AddressDetail;
  typeAdress: string;
}

export type UpdateAddressRequest = Partial<
  Omit<CreateAddressRequest, "companyId">
>;
