import type { AddressDetail } from "@definitions/dto";

export interface CreateAddressRequest {
  companyId: string;
  coordinates: [number, number];
  cityId?: string;
  city?: string;
  administrativeDistrict?: string;
  district?: string;
  adressDetail: AddressDetail;
  typeAdress: string;
}

export type UpdateAddressRequest = Partial<
  Omit<CreateAddressRequest, "companyId">
>;
