import type LeadDto from "@/definitions/dto/lead";
import type { LeadStageDto, LeadStageKind } from "@/definitions/dto/lead";
import type { UserDto } from "@definitions/dto";

export const LEAD_STAGE_LABELS: Record<LeadStageKind, string> = {
  new: "Новый", in_progress: "В работе", qualified: "Квалифицирован",
  deferred: "Отложен", unqualified: "Нецелевой", converted: "Переведён в сделку",
};
export const PRIORITY_LABELS = { low: "Низкий", normal: "Обычный", high: "Высокий", urgent: "Срочный" };
export const TASK_TYPE_LABELS = { call: "Звонок", meeting: "Встреча", email: "Письмо", other: "Другое" };
export const TASK_STATUS_LABELS = { open: "Открыта", completed: "Завершена", cancelled: "Отменена" };
export const STAGE_COLORS: Record<LeadStageKind, string> = {
  new: "bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  in_progress: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  qualified: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  deferred: "bg-violet-50 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  unqualified: "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200",
  converted: "bg-muted text-muted-foreground",
};
export function sortLeadStages(stages: LeadStageDto[]) {
  return [...stages].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999) || a.name.localeCompare(b.name, "ru"));
}
export function leadIsLocked(lead: LeadDto) {
  return Boolean(lead.convertedAt || lead.conversionPending || lead.stage?.kind === "converted" || lead.status === "converted");
}
export function validateLeadStage(kind: LeadStageKind | undefined, nextContactAt: string | null | undefined, lossReason: string | null | undefined) {
  if (kind === "deferred" && !nextContactAt) return "Для отложенного лида укажите дату следующего контакта";
  if (kind === "unqualified" && !lossReason?.trim()) return "Укажите причину, по которой лид нецелевой";
  if (kind === "converted") return "Перевод в сделку выполняется кнопкой «Создать сделку»";
  return "";
}
export function userName(user: UserDto) {
  return [user.lastName, user.name].filter(Boolean).join(" ") || user.email;
}
export function formatCrmDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Moscow", dateStyle: "short", timeStyle: "short" }).format(date);
}
export function toMoscowInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Moscow", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}
export function fromMoscowInput(value: string): string | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error("Укажите корректную дату и время");
  const iso = `${value}:00+03:00`;
  if (!Number.isFinite(new Date(iso).getTime()) || toMoscowInput(iso) !== value) throw new Error("Укажите корректную дату и время");
  return iso;
}
export function splitContactValues(value: string) {
  return [...new Set(value.split(/[;,\n]/).map((item) => item.trim()).filter(Boolean))];
}
