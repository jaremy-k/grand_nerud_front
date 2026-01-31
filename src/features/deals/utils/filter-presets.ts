import type { DealFilters } from "@features/deals/definitions";

const STORAGE_KEY = "deals-filter-presets";
const LAST_USED_KEY = "deals-filter-last-used";

export interface FilterPreset {
  id: string;
  name: string;
  filters: DealFilters;
  createdAt: number;
}

export function getFilterPresets(): FilterPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFilterPreset(name: string, filters: DealFilters): FilterPreset {
  const presets = getFilterPresets();
  const preset: FilterPreset = {
    id: crypto.randomUUID(),
    name,
    filters: { ...filters },
    createdAt: Date.now(),
  };
  presets.push(preset);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  return preset;
}

export function deleteFilterPreset(id: string): void {
  const presets = getFilterPresets().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

export function getLastUsedFilters(): DealFilters | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_USED_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DealFilters;
  } catch {
    return null;
  }
}

export function saveLastUsedFilters(filters: DealFilters): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_USED_KEY, JSON.stringify(filters));
}
