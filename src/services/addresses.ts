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

export async function getAddresses(companyId?: string): Promise<AddressDto[]> {
  const query = companyId
    ? `?companyId=${encodeURIComponent(companyId)}`
    : "";
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
