import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLead, getLeads } from "@/services/leads";
import { dealsService } from "@/services";
import type LeadDto from "@/definitions/dto/lead";
import type { DealDto } from "@definitions/dto";
import { useEffect, useState } from "react";
import { useDebounce } from "@/lib/debouncer";
import { CheckIcon, XIcon } from "lucide-react";

export default function RelatedRecordSelect({ kind, value, onChange, companyId, ownerId, disabled = false }: {
  kind: "lead" | "deal"; value: string; companyId?: string; ownerId?: string; disabled?: boolean;
  onChange: (id: string, companyId?: string | null, ownerId?: string) => void;
}) {
  const [records, setRecords] = useState<Array<LeadDto | DealDto>>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<LeadDto | DealDto | null>(null);
  useEffect(() => {
    let active = true;
    setSelectedRecord(null);
    if (value) (kind === "lead" ? getLead(value) : dealsService.getDeal(value)).then((item) => { if (active) setSelectedRecord(item); }).catch((err) => { if (active) setError(err instanceof Error ? err.message : "Не удалось загрузить привязку"); });
    return () => { active = false; };
  }, [value, kind]);
  useEffect(() => { setPage(1); setRecords([]); }, [companyId, ownerId, debouncedSearch]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    const request = kind === "lead"
      ? getLeads({ page, pageSize: 20, search: debouncedSearch, companyId, ownerId }, { signal: controller.signal })
      : dealsService.getDeals({ page, pageSize: 20, includeRelations: true, includeDeleted: false, filters: ownerId ? { userId: ownerId } : undefined }, { signal: controller.signal });
    request.then((response) => {
      if (controller.signal.aborted) return;
      setRecords((items) => page === 1 ? response.items : [...items, ...response.items]);
      setHasNext(response.page < response.totalPages);
    }).catch((err) => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Не удалось загрузить записи"); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [kind, companyId, ownerId, page, debouncedSearch]);
  const label = (item: LeadDto | DealDto) => "title" in item ? item.title : `${item.customer?.name || "Сделка"} · ${item.material?.name || "Без материала"}`;
  const visible = records.filter((item) => kind === "lead" || (!companyId || ("customerId" in item && item.customerId === companyId)) && label(item).toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2"><Label>{kind === "lead" ? "Лид" : "Сделка"}</Label>{value && !disabled && <Button type="button" variant="ghost" size="icon-sm" aria-label="Убрать привязку" onClick={() => onChange("")}><XIcon /></Button>}</div>
      {selectedRecord && <p className="text-xs font-medium">{label(selectedRecord)}</p>}
      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={kind === "lead" ? "Поиск лида" : "Поиск сделки по компании или материалу"} disabled={disabled} />
      <div className="max-h-40 overflow-y-auto divide-y border-y">
        {visible.map((item) => <button key={item._id} type="button" disabled={disabled} className="flex w-full items-center gap-2 px-2 py-2 text-left text-xs hover:bg-muted disabled:opacity-50" onClick={() => onChange(item._id, "title" in item ? item.companyId : item.customerId, "title" in item ? item.ownerId : item.userId)}><CheckIcon className={`size-3.5 shrink-0 ${value === item._id ? "opacity-100" : "opacity-0"}`} /><span>{label(item)}</span></button>)}
        {!loading && !visible.length && <p className="py-3 text-center text-xs text-muted-foreground">Не найдено</p>}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {hasNext && <Button type="button" size="sm" variant="ghost" disabled={loading || disabled} onClick={() => setPage((value) => value + 1)}>Ещё</Button>}
      {loading && <p className="text-xs text-muted-foreground">Загрузка...</p>}
    </div>
  );
}
