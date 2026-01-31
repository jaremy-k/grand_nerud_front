/**
 * Идентификаторы услуг (при необходимости обновляются при изменении бэкенда).
 * Используются для условной логики в формах (продажа, перевозка и т.д.).
 */
export const SERVICE_IDS = {
  /** Продажа — показываются цены закупки/продажи, способ получения */
  SALES: "687a88dfb6b13b70b6a575f3",
  /** Перевозка — показывается чекбокс ОССиГ */
  TRANSPORT: "687a88e6b6b13b70b6a575f4",
} as const;

export function isSalesService(serviceId: string | undefined): boolean {
  return serviceId === SERVICE_IDS.SALES;
}

export function isTransportService(serviceId: string | undefined): boolean {
  return serviceId === SERVICE_IDS.TRANSPORT;
}
