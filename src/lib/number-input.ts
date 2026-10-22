export function parseDecimalInput(value: string): number | null {
  const trimmed = value.trim();
  if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(trimmed)) return null;
  const number = Number(trimmed.replace(",", "."));
  return Number.isFinite(number) ? number : null;
}

export function parseCoordinates(longitude: string, latitude: string): [number, number] | null {
  const lon = parseDecimalInput(longitude);
  const lat = parseDecimalInput(latitude);
  if (lon === null || lat === null || Math.abs(lon) > 180 || Math.abs(lat) > 90) return null;
  return [lon, lat];
}
