export function formatCurrency(amount: number): string {
  if (isNaN(amount)) {
    return "0,00 ₽";
  }

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatINN(inn: string) {
  const cleaned = inn.toString().replace(/\D/g, "");

  // Individual INN (12 digits)
  if (cleaned.length === 12) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{6})(\d{2})/, "$1 $2 $3 $2");
  }

  // Legal entity INN (10 digits)
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{6})/, "$1 $2");
  }

  // Invalid length
  return cleaned;
}
