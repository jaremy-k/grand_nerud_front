import {
  AddressDto,
  CompanyDto,
  MaterialDto,
  ServiceDto,
  StageDto,
  UserDto,
} from "./";

export default interface DealDto {
  _id: string;

  userId: string;
  serviceId: string;
  customerId: string;
  providerId?: string | null;
  stageId: string;
  materialId: string | null;

  unitMeasurement: string;

  quantity: number;

  amountPurchaseUnit: number;
  amountPurchaseTotal: number;

  amountSalesUnit: number;
  amountSalesTotal: number;

  amountDelivery: number;
  companyProfit: number;

  ndsAmount: number;
  ndsPercent: number;

  totalAmount: number;
  managerProfit: number;

  actualCompanyProfit?: number;
  actualAmountSalesTotal?: number;
  actualAmountPurchaseTotal?: number;
  totalDeliveredQuantity?: number;
  managerShare?: number;

  paymentMethod: string;

  shippingAddressId: string | null;
  shippingAddress: AddressDto | null;
  methodReceiving: string;
  deliveryAddressId: string | null;
  deliveryAddress: AddressDto | null;

  notes: string;
  OSSIG: boolean;

  addExpenses: Array<{ name: string; amount: number }>;
  deliveredQuantity?: Array<{
    quantity: number;
    unit: string;
    date: string;
    amountPurchase?: number;
  }>;

  // Populated fields
  user: UserDto | null;
  service: ServiceDto | null;
  customer: CompanyDto | null;
  provider: CompanyDto | null;
  stage: StageDto | null;
  material: MaterialDto | null;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
