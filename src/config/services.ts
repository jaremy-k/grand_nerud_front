import ServiceDto from "@definitions/dto/service";

export type ServiceKind =
  | "sales"
  | "sales_with_delivery"
  | "utilization"
  | "transport";

export function getServiceKind(
  services: ServiceDto[],
  serviceId?: string
): ServiceKind | undefined {
  if (!serviceId) return undefined;
  return services.find((service) => service._id === serviceId)?.kind;
}

export function isSalesKind(kind?: ServiceKind): boolean {
  return (
    kind === "sales" ||
    kind === "sales_with_delivery" ||
    kind === "utilization"
  );
}

export function isTransportKind(kind?: ServiceKind): boolean {
  return kind === "transport";
}

export function isSalesService(
  serviceId: string | undefined,
  services: ServiceDto[] = []
): boolean {
  return isSalesKind(getServiceKind(services, serviceId));
}

export function isTransportService(
  serviceId: string | undefined,
  services: ServiceDto[] = []
): boolean {
  return isTransportKind(getServiceKind(services, serviceId));
}
