import type { DealFilters } from "@features/deals/definitions";
import { normalizeDealListState, type DealListState } from "./list-state";

export interface FilterPreset { id: string; name: string; view: DealListState; createdAt: number }
const key = (base: string, user?: string) => user ? `${base}:${user}` : base;
const read = (name: string): unknown => { try { const raw = localStorage.getItem(name); return raw ? JSON.parse(raw) : null; } catch { return null; } };

export function getFilterPresets(user?: string): FilterPreset[] {
  const value = read(key("deals-filter-presets", user));
  if (!Array.isArray(value)) return [];
  return value.slice(0, 30).flatMap((item) => {
    if (!item || typeof item !== "object" || typeof item.id !== "string" || typeof item.name !== "string" || !item.name.trim()) return [];
    return [{ id: item.id, name: item.name.trim().slice(0, 80), view: normalizeDealListState(item.view ?? { filters: item.filters }), createdAt: typeof item.createdAt === "number" ? item.createdAt : 0 }];
  });
}

export function saveFilterPreset(name: string, view: DealListState, user?: string): FilterPreset {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 80) throw new Error("Укажите название до 80 символов");
  const presets = getFilterPresets(user);
  const existing = presets.find((item) => item.name.toLowerCase() === trimmed.toLowerCase());
  if (!existing && presets.length >= 30) throw new Error("Можно сохранить до 30 представлений");
  const preset = { id: existing?.id ?? crypto.randomUUID(), name: trimmed, view: normalizeDealListState(view), createdAt: existing?.createdAt ?? Date.now() };
  localStorage.setItem(key("deals-filter-presets", user), JSON.stringify(existing ? presets.map((item) => item.id === existing.id ? preset : item) : [...presets, preset]));
  return preset;
}

export function deleteFilterPreset(id: string, user?: string): void {
  localStorage.setItem(key("deals-filter-presets", user), JSON.stringify(getFilterPresets(user).filter((item) => item.id !== id)));
}

export function getLastUsedView(user?: string): DealListState | null {
  const value = read(key("deals-filter-last-used", user));
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return normalizeDealListState("filters" in value ? value : { filters: value });
}
export function saveLastUsedView(view: DealListState, user?: string): void {
  try { localStorage.setItem(key("deals-filter-last-used", user), JSON.stringify(view)); } catch { /* Filtering remains available without browser storage. */ }
}
export function getLastUsedFilters(): DealFilters | null { return getLastUsedView()?.filters ?? null; }
export function saveLastUsedFilters(filters: DealFilters): void { saveLastUsedView(normalizeDealListState({ filters })); }
