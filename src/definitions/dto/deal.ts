import { CompanyDto, MaterialDto, ServiceDto, StageDto, UserDto } from "./";

export default interface DealDto {
  _id: string;

  userId: string;
  serviceId: string;
  customerId: string;
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

  paymentMethod: string;

  shippingAddress: string | null;
  methodReceiving: string;
  deliveryAddress: string | null;

  deadline: string | null;
  notes: string;
  OSSIG: boolean;

  addExpenses: Array<{ name: string; amount: number }>;

  // Populated fields
  user: UserDto | null;
  service: ServiceDto | null;
  customer: CompanyDto | null;
  stage: StageDto | null;
  material: MaterialDto | null;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
