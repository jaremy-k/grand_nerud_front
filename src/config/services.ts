/**
 * Идентификаторы услуг (при необходимости обновляются при изменении бэкенда).
 * Используются для условной логики в формах (продажа, перевозка и т.д.).
 */
export const SERVICE_IDS = {
  /** Продажа — показываются цены закупки/продажи, способ получения */
  SALES: "687a88dfb6b13b70b6a575f3",
  /** Продажа с доставкой — показываются те же поля, что и в продаже сырья */
  SALES_WITH_DELIVERY: "698de8bf1c3ac72cbdc1ff5b",
  /** Доставка — показывается чекбокс ОССиГ, стоимость доставки и адрес доставки */
  TRANSPORT: "687a88e9b6b13b70b6a575f5",
} as const;

export function isSalesService(serviceId: string | undefined): boolean {
  return (
    serviceId === SERVICE_IDS.SALES ||
    serviceId === SERVICE_IDS.SALES_WITH_DELIVERY
  );
}

export function isTransportService(serviceId: string | undefined): boolean {
  return serviceId === SERVICE_IDS.TRANSPORT;
}
