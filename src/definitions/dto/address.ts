export type AddressDetail = {
  address: string;
  entrance?: string;
  [key: string]: unknown;
};

export default interface AddressDto {
  _id: string;
  companyId: string;
  coordinates: [number, number];
  cityId?: string;
  city?: string;
  administrativeDistrict?: string;
  district?: string;
  adressDetail: AddressDetail;
  typeAdress: string;
  deletedAt: string | null;
}
