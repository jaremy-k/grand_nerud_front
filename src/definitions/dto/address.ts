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
  adressDetail: AddressDetail;
  typeAdress: string;
  deletedAt: string | null;
}
