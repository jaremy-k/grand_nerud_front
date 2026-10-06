import { apiPath } from "@/lib/api";
import {
  secureDeleteData,
  secureGetData,
  securePatchData,
  securePostData,
} from "@/lib/fetch";
import { AddressDto } from "@definitions/dto";
import {
  CreateAddressRequest,
  UpdateAddressRequest,
} from "@definitions/requests";

export type AddressFilters = {
  companyId?: string;
  city?: string;
  administrativeDistrict?: string;
  district?: string;
};

export async function getAddresses(
  companyIdOrFilters?: string | AddressFilters
): Promise<AddressDto[]> {
  const filters =
    typeof companyIdOrFilters === "string"
      ? { companyId: companyIdOrFilters }
      : companyIdOrFilters;
  const params = new URLSearchParams();
  Object.entries(filters ?? {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.size ? `?${params.toString()}` : "";
  return secureGetData(apiPath(`/adresses${query}`));
}

export async function getAddress(id: string): Promise<AddressDto> {
  return secureGetData(apiPath(`/adresses/${id}`));
}

export async function createAddress(
  data: CreateAddressRequest
): Promise<AddressDto> {
  return securePostData(apiPath("/adresses"), data);
}

export async function updateAddress(
  id: string,
  data: UpdateAddressRequest
): Promise<AddressDto> {
  return securePatchData(apiPath(`/adresses/${id}`), data);
}

export async function deleteAddress(id: string): Promise<void> {
  return secureDeleteData(apiPath(`/adresses/${id}`));
}
