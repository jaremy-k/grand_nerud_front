import { Page, Pagination } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LeadFormDialog from "@/features/leads/components/lead-form-dialog";
import ReferenceSelect from "@/features/crm/reference-select";
import { useCrmReferences } from "@/features/crm/use-references";
import { formatCrmDate, PRIORITY_LABELS, STAGE_COLORS, userName } from "@/features/crm/utils";
import { useDebounce } from "@/lib/debouncer";
import { getLeads } from "@/services/leads";
import type LeadDto from "@/definitions/dto/lead";
import type { LeadPriority, PaginatedResult } from "@/definitions/dto/lead";
import { Columns3Icon, ListIcon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function LeadsPage() {
  const refs = useCrmReferences();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [stageId, setStageId] = useState("");
  const [priority, setPriority] = useState("");
  const [companyId, setCompanyId] = useState(searchParams.get("companyId") ?? "");
  const [ownerId, setOwnerId] = useState("");
  const [mode, setMode] = useState<"kanban" | "table">(() => {
    try { return localStorage.getItem("leads-view-mode") === "table" ? "table" : "kanban"; }
    catch { return "kanban"; }
  });
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<PaginatedResult<LeadDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(searchParams.get("create") === "true");
  const filterKey = JSON.stringify({ search: debouncedSearch, stageId, priority: priority || undefined, companyId, ownerId: refs.elevated ? ownerId : undefined });
  useEffect(() => { setPage(1); }, [filterKey]);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError("");
    getLeads({ ...JSON.parse(filterKey), page, pageSize: 50 }, { signal: controller.signal }).then((data) => {
      if (!controller.signal.aborted) {
        setResult(data);
        if (page > Math.max(1, data.totalPages)) setPage(Math.max(1, data.totalPages));
      }
    }).catch((err) => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Не удалось загрузить лиды"); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filterKey, page, revision]);
  const changeMode = (value: "table" | "kanban") => { setMode(value); try { localStorage.setItem("leads-view-mode", value); } catch { /* Storage may be unavailable. */ } };
  const ownerName = (id: string) => { const owner = refs.owners.find((item) => (item.id ?? item._id) === id); return owner ? userName(owner) : ""; };
  const companyName = (lead: LeadDto) => lead.company?.name || refs.companies.find((item) => item._id === lead.companyId)?.name || "Без компании";
  const columns = refs.stages.map((stage) => ({ id: stage._id, name: stage.name, kind: stage.kind, leads: (result?.items ?? []).filter((lead) => lead.stageId === stage._id) }));
  const other = (result?.items ?? []).filter((lead) => !refs.stages.some((stage) => stage._id === lead.stageId));
  if (other.length) columns.push({ id: "other", name: "Без этапа", kind: "new", leads: other });
  return (
    <Page breadcrumbLinks={[{ label: "Лиды", href: "/leads" }]}>
      <div className="grid min-w-0 gap-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button onClick={() => setCreating(true)}><PlusIcon />Новый лид</Button>
          <div role="group" aria-label="Отображение лидов" className="flex rounded-md border p-0.5">
            <Button size="sm" variant={mode === "table" ? "secondary" : "ghost"} aria-pressed={mode === "table"} onClick={() => changeMode("table")}><ListIcon />Таблица</Button>
            <Button size="sm" variant={mode === "kanban" ? "secondary" : "ghost"} aria-pressed={mode === "kanban"} onClick={() => changeMode("kanban")}><Columns3Icon />Канбан</Button>
          </div>
        </div>
        <div className="grid gap-3 border-y py-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="grid gap-1.5"><Label htmlFor="leads-search">Поиск</Label><Input id="leads-search" placeholder="Потребность или компания" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="leads-stage">Этап</Label><ReferenceSelect id="leads-stage" value={stageId} onChange={setStageId} placeholder="Все этапы" options={refs.stages.map((stage) => ({ value: stage._id, label: stage.name }))} /></div>
          <div className="grid gap-1.5"><Label htmlFor="leads-priority">Приоритет</Label><Select value={priority || "all"} onValueChange={(value) => setPriority(value === "all" ? "" : value)}><SelectTrigger id="leads-priority"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Все приоритеты</SelectItem>{Object.entries(PRIORITY_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid gap-1.5"><Label htmlFor="leads-company">Компания</Label><ReferenceSelect id="leads-company" value={companyId} onChange={setCompanyId} placeholder="Все компании" options={refs.companies.map((item) => ({ value: item._id, label: item.name }))} /></div>
          {refs.elevated && <div className="grid gap-1.5"><Label htmlFor="leads-owner">Ответственный</Label><ReferenceSelect id="leads-owner" value={ownerId} onChange={setOwnerId} placeholder="Все ответственные" options={refs.owners.map((item) => ({ value: item.id ?? item._id ?? "", label: userName(item) }))} /></div>}
        </div>
        <p className="text-xs text-muted-foreground">Лидов: {result?.total ?? 0}{result && result.totalPages > 1 ? ` · Страница ${page} из ${result.totalPages}` : ""}</p>
        {(error || refs.error) && <p className="text-sm text-destructive" role="alert">{error || refs.error}</p>}
        {loading ? <p className="py-10 text-center text-muted-foreground">Загрузка...</p> : mode === "kanban" ? (
          <div className="max-w-full overflow-x-auto pb-3"><div className="flex items-start gap-4">
            {columns.map((column) => <section key={column.id} aria-label={column.name} className="w-72 shrink-0">
              <h2 className={`mb-3 flex items-center justify-between gap-3 border-b px-2 py-2 text-sm font-medium ${STAGE_COLORS[column.kind]}`}><span>{column.name}</span><span className="text-xs">{column.leads.length}</span></h2>
              <div className="grid gap-2">{column.leads.map((lead) => <Link key={lead._id} to={`/leads/${lead._id}`} className="grid gap-2 rounded-md border bg-card p-3 hover:border-primary/50 focus-visible:outline-primary">
                <p className="break-words text-sm font-medium">{lead.title}</p><p className="text-xs text-muted-foreground">{companyName(lead)}</p>
                <p className="text-xs">{lead.materials?.map((item) => item.name).join(", ") || "Материал не указан"}</p>
                <div className="flex flex-wrap justify-between gap-2 text-xs"><span className={lead.priority === "urgent" ? "font-medium text-red-700 dark:text-red-300" : "text-muted-foreground"}>{PRIORITY_LABELS[lead.priority]}</span>{lead.budget != null && <span>{lead.budget.toLocaleString("ru-RU")} руб.</span>}</div>
                {lead.nextContactAt && <p className="border-t pt-2 text-xs text-muted-foreground">Контакт: {formatCrmDate(lead.nextContactAt)}</p>}
                {ownerName(lead.ownerId) && <p className="text-xs text-muted-foreground">{ownerName(lead.ownerId)}</p>}
              </Link>)}{!column.leads.length && <p className="px-2 py-5 text-center text-xs text-muted-foreground">Нет лидов</p>}</div>
            </section>)}
          </div></div>
        ) : (
          <Table><TableHeader><TableRow><TableHead>Потребность / компания</TableHead><TableHead>Этап</TableHead><TableHead>Приоритет</TableHead><TableHead>Материалы</TableHead><TableHead>Следующий контакт</TableHead><TableHead>Ответственный</TableHead></TableRow></TableHeader><TableBody>
            {result?.items.map((lead) => { const stage = lead.stage ?? refs.stages.find((item) => item._id === lead.stageId); return <TableRow key={lead._id}><TableCell><Link to={`/leads/${lead._id}`} className="font-medium hover:underline">{lead.title}</Link><p className="text-xs text-muted-foreground">{companyName(lead)}</p></TableCell><TableCell><span className={`rounded px-2 py-1 text-xs ${stage ? STAGE_COLORS[stage.kind] : "bg-muted"}`}>{stage?.name || "Без этапа"}</span></TableCell><TableCell>{PRIORITY_LABELS[lead.priority as LeadPriority]}</TableCell><TableCell>{lead.materials?.map((item) => item.name).join(", ") || "—"}</TableCell><TableCell>{formatCrmDate(lead.nextContactAt)}</TableCell><TableCell>{ownerName(lead.ownerId) || "—"}</TableCell></TableRow>; })}
            {!result?.items.length && <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Лиды не найдены</TableCell></TableRow>}
          </TableBody></Table>
        )}
        {result && <Pagination total={result.totalPages} current={page} onClick={setPage} />}
      </div>
      {creating && <LeadFormDialog open initialCompanyId={companyId || undefined} onClose={() => setCreating(false)} onSaved={() => setRevision((value) => value + 1)} />}
    </Page>
  );
}
