/**
 * Цвета для этапов сделки. Один и тот же stageId всегда получает один и тот же цвет.
 */
const STAGE_PALETTE = [
  { dot: "bg-blue-500", badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
  { dot: "bg-amber-500", badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  { dot: "bg-violet-500", badge: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300" },
  { dot: "bg-rose-500", badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300" },
  { dot: "bg-cyan-500", badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300" },
  { dot: "bg-orange-500", badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  { dot: "bg-slate-500", badge: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300" },
] as const;

function hashStageId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getStageDotClass(stageId: string): string {
  const index = hashStageId(stageId) % STAGE_PALETTE.length;
  return STAGE_PALETTE[index].dot;
}

export function getStageBadgeClass(stageId: string): string {
  const index = hashStageId(stageId) % STAGE_PALETTE.length;
  return STAGE_PALETTE[index].badge;
}
