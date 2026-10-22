import { useCallback, useEffect, useMemo, useState } from "react";
import { useLatestRequest } from "@/hooks/use-latest-request";
import type { CrmOwnerScope } from "@/features/crm/owner-scope";
import { getWorkspaceLeads, getWorkspaceTasks, WorkspaceFilters } from "@/services/workspace";
import { usersService } from "@/services";

type WorkspaceQuery = { filters: WorkspaceFilters; error: string | null; revision: number };
const loadTasks = (query: WorkspaceQuery, signal: AbortSignal) => {
  if (query.error) return Promise.reject(new Error(query.error));
  return getWorkspaceTasks(query.filters, { signal });
};
const loadNewLeads = (query: WorkspaceQuery, signal: AbortSignal) => {
  if (query.error) return Promise.reject(new Error(query.error));
  return getWorkspaceLeads(query.filters, { signal });
};
const loadOwners = async (elevated: boolean) => elevated
  ? (await usersService.getUsers()).filter((user) => !user.is_deleted && !user.isDeleted)
  : [];

export function useWorkspaceData(scope: CrmOwnerScope) {
  const [clock, setClock] = useState(() => ({ now: Date.now(), revision: 0 }));
  const refresh = useCallback(() => setClock((current) => ({ now: Date.now(), revision: current.revision + 1 })), []);
  useEffect(() => {
    const refreshIfVisible = () => { if (document.visibilityState === "visible") refresh(); };
    const timer = setInterval(refreshIfVisible, 60_000);
    document.addEventListener("visibilitychange", refreshIfVisible);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", refreshIfVisible); };
  }, [refresh]);
  const query = useMemo<WorkspaceQuery>(() => ({
    filters: { ownerId: scope.ownerId, scope: scope.value === "team" ? "team" : "mine" },
    error: scope.error, revision: clock.revision,
  }), [scope.ownerId, scope.value, scope.error, clock.revision]);
  const tasks = useLatestRequest(query, loadTasks);
  const leads = useLatestRequest(query, loadNewLeads);
  const owners = useLatestRequest(scope.elevated, loadOwners);
  const serverNow = tasks.data ? new Date(tasks.data.generatedAt).getTime() : clock.now;
  return {
    overdue: { ...tasks, data: tasks.data?.overdue ?? null },
    today: { ...tasks, data: tasks.data?.today ?? null },
    upcoming: { ...tasks, data: tasks.data?.upcoming ?? null },
    newLeads: { ...leads, data: leads.data?.newLeads ?? null },
    owners, now: Number.isFinite(serverNow) ? serverNow : clock.now, refresh,
  };
}
