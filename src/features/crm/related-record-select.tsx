import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLead, getLeads } from "@/services/leads";
import { dealsService } from "@/services";
import type LeadDto from "@/definitions/dto/lead";
import type { DealDto } from "@definitions/dto";
import { useEffect, useMemo, useState } from "react";
import { useLatestRequest } from "@/hooks/use-latest-request";
import RequestError from "./request-error";
import { CheckIcon, XIcon } from "lucide-react";

type Props = {
  kind: "lead" | "deal"; value: string; companyId?: string; ownerId?: string; disabled?: boolean;
  onChange: (id: string, companyId?: string | null, ownerId?: string) => void;
};
type Record = LeadDto | DealDto;
type RecordPage = { items: Record[]; total: number; page: number; totalPages: number };
type Query = { kind: Props["kind"]; companyId?: string; ownerId?: string; search: string; page: number };
const label = (item: Record) => "title" in item ? item.title
  : `${item.customer?.name || "Сделка"} · ${item.material?.name || "Без материала"}${item.provider?.name ? ` · ${item.provider.name}` : ""}`;
const loadRecords = (query: Query, signal: AbortSignal): Promise<RecordPage> => query.kind === "lead"
  ? getLeads({ page: query.page, pageSize: 20, search: query.search, companyId: query.companyId, ownerId: query.ownerId }, { signal })
  : dealsService.getDeals({ page: query.page, pageSize: 20, search: query.search,
    includeRelations: true, includeDeleted: false, filters: { userId: query.ownerId, customerId: query.companyId } }, { signal });
const loadSelected = (key: { kind: Props["kind"]; value: string }, signal: AbortSignal): Promise<Record | null> => !key.value
  ? Promise.resolve(null) : key.kind === "lead" ? getLead(key.value, { signal }) : dealsService.getDeal(key.value, { signal });

export default function RelatedRecordSelect(props: Props) {
  const [search, setSearch] = useState("");
  const { kind, value, onChange, disabled } = props;
  const selectedKey = useMemo(() => ({ kind, value }), [kind, value]);
  const selected = useLatestRequest(selectedKey, loadSelected);
  const title = kind === "lead" ? "Лид" : "Сделка";
  return <div className="grid min-w-0 gap-2">
    <div className="flex items-center justify-between gap-2"><Label>{title}</Label>{value && !disabled && <Button type="button" variant="ghost" size="icon-sm" aria-label="Убрать привязку" onClick={() => onChange("")}><XIcon /></Button>}</div>
    {selected.data && <p className="break-words text-xs font-medium">{label(selected.data)}</p>}
    {value && selected.loading && <p className="text-xs text-muted-foreground">Загрузка привязки...</p>}
    {selected.error && <RequestError error={selected.error} onRetry={selected.retry} />}
    <Input aria-label={`Поиск: ${title.toLowerCase()}`} maxLength={200} value={search} onChange={(e) => setSearch(e.target.value)} placeholder={kind === "lead" ? "Поиск лида" : "Компания, ИНН или материал"} disabled={disabled} />
    <RecordOptions key={JSON.stringify([kind, props.companyId, props.ownerId, search])} {...props} search={search} />
  </div>;
}

function RecordOptions({ kind, value, onChange, companyId, ownerId, disabled = false, search }: Props & {
  search: string;
}) {
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState<Map<number, Record[]>>(() => new Map());
  const query = useMemo(() => ({ kind, companyId, ownerId, search, page }), [kind, companyId, ownerId, search, page]);
  const request = useLatestRequest(query, loadRecords, 300);
  useEffect(() => {
    if (request.data) setPages((previous) => new Map(previous).set(page, request.data!.items));
  }, [request.data, page]);
  const records = [...new Map([...pages.entries()].sort(([a], [b]) => a - b)
    .flatMap(([, items]) => items).map((item) => [item._id, item])).values()];
  return (
    <div className="grid min-w-0 gap-2">
      <div className="max-h-48 overflow-y-auto divide-y border-y" aria-busy={request.loading}>
        {records.map((item) => <button key={item._id} type="button" disabled={disabled} className="flex w-full items-center gap-2 px-2 py-2 text-left text-xs hover:bg-muted disabled:opacity-50" onClick={() => onChange(item._id, "title" in item ? item.companyId : item.customerId, "title" in item ? item.ownerId : item.userId)}><CheckIcon className={`size-3.5 shrink-0 ${value === item._id ? "opacity-100" : "opacity-0"}`} /><span className="min-w-0 break-words">{label(item)}</span></button>)}
        {!request.loading && !request.error && !records.length && <p className="py-3 text-center text-xs text-muted-foreground">Не найдено</p>}
      </div>
      {request.error && <RequestError error={request.error} onRetry={request.retry} />}
      {!request.error && request.data && request.data.page < request.data.totalPages && <Button type="button" size="sm" variant="ghost" disabled={request.loading || disabled} onClick={() => setPage((current) => current + 1)}>Ещё</Button>}
      {request.loading && <p role="status" className="text-xs text-muted-foreground">Загрузка...</p>}
    </div>
  );
}
