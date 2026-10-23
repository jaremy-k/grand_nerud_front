import { companiesService } from "@/services";
import { useLatestRequest } from "@/hooks/use-latest-request";

const load = async (key: string, signal: AbortSignal) => {
  const ids = JSON.parse(key) as string[];
  const results = await Promise.allSettled(ids.map((id) => companiesService.getCompany(id, { signal })));
  return Object.fromEntries(results.flatMap((result) => result.status === "fulfilled" ? [[result.value._id, result.value.name]] : [])) as Record<string, string>;
};

export function useCompanyNames(ids: string[]) {
  return useLatestRequest(JSON.stringify([...new Set(ids.filter(Boolean))].sort()), load);
}
