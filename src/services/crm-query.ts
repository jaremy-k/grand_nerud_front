export function crmQuery(values: object): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value != null && value !== "") params.set(key, String(value));
  }
  return params.size ? `?${params.toString()}` : "";
}
