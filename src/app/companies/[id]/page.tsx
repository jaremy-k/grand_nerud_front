import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Page, Pagination } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EditingCompanyModal } from "@/components/inputs/company-input/editing-modal";
import AddressesSection from "@/components/inputs/company-input/addresses-section";
import CompanyMaterialsSection from "@/components/inputs/company-input/company-materials-section";
import CompanySummary from "@/features/crm/company-summary";
import RecordTabs from "@/features/crm/record-tabs";
import { useRecordTab } from "@/features/crm/use-record-tab";
import RequestError from "@/features/crm/request-error";
import LeadFormDialog from "@/features/leads/components/lead-form-dialog";
import TaskList from "@/features/tasks/components/task-list";
import { useLatestRequest } from "@/hooks/use-latest-request";
import { companiesService, dealsService } from "@/services";
import { getLeads } from "@/services/leads";
import type LeadDto from "@/definitions/dto/lead";
import type { CompanyDto, DealDto } from "@definitions/dto";
import { formatCurrency } from "@/lib/formatters";
import { LEAD_STAGE_LABELS, formatCrmDate } from "@/features/crm/utils";
import { ChevronDownIcon, FilePlus2Icon, PencilIcon, PlusIcon } from "lucide-react";

const TABS = [ { value: "overview", label: "Компания и контакты" }, { value: "addresses", label: "Адреса" },
  { value: "prices", label: "Материалы и цены" }, { value: "leads", label: "Лиды" },
  { value: "deals", label: "Сделки" }, { value: "tasks", label: "Задачи" } ] as const;
const loadCompany = (id: string, signal: AbortSignal) => companiesService.getCompany(id, { signal });

export default function CompanyDetailPage() {
  const { id = "" } = useParams();
  const request = useLatestRequest(id, loadCompany);
  const listPath = request.data?.roles?.includes("provider") && !request.data.roles.includes("customer") ? "/providers" : "/customers";
  return <Page breadcrumbLinks={[{ label: listPath === "/providers" ? "Исполнители" : "Заказчики", href: listPath }, { label: "Карточка компании", href: `/companies/${id}` }]}>
    {request.loading ? <p role="status" className="py-10 text-sm text-muted-foreground">Загрузка компании...</p>
      : request.error ? <RequestError error={request.error} onRetry={request.retry} />
        : request.data && <CompanyDetail key={id} company={request.data} onChanged={request.retry} />}
  </Page>;
}

function CompanyDetail({ company, onChanged }: { company: CompanyDto; onChanged: () => void }) {
  const tab = useRecordTab(TABS);
  const [editing, setEditing] = useState(false);
  const [creatingLead, setCreatingLead] = useState(false);
  const dealLink = (role: "customer" | "provider") => `/deals/create?${role}Id=${encodeURIComponent(company._id)}`;
  const hasBothRoles = company.roles?.includes("provider") && company.roles.includes("customer");
  return <div className="grid min-w-0 gap-5 py-5">
    <header className="flex min-w-0 flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 space-y-3"><h1 className="break-words text-xl font-semibold">{company.name}</h1>
        <div className="flex flex-wrap items-center gap-2 text-xs"><span className="text-muted-foreground">Статус:</span>
          {company.roles?.includes("provider") && <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-700 dark:bg-red-950 dark:text-red-300">Исполнитель</span>}
          {company.roles?.includes("customer") && <span className="rounded-full bg-green-50 px-2.5 py-1 text-green-700 dark:bg-green-950 dark:text-green-300">Заказчик</span>}
          {!company.roles?.length && <span className="text-muted-foreground">Не указан</span>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}><PencilIcon />Редактировать</Button>
        <Button variant="outline" size="sm" onClick={() => setCreatingLead(true)}><PlusIcon />Новый лид</Button>
        {hasBothRoles ? <DropdownMenu><DropdownMenuTrigger asChild><Button size="sm"><FilePlus2Icon />Создать сделку<ChevronDownIcon /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link to={dealLink("customer")}>Как заказчик</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to={dealLink("provider")}>Как исполнитель</Link></DropdownMenuItem>
        </DropdownMenuContent></DropdownMenu> : <Button size="sm" asChild><Link to={dealLink(company.roles?.includes("provider") ? "provider" : "customer")}><FilePlus2Icon />Создать сделку</Link></Button>}
      </div>
    </header>
    <RecordTabs tabs={TABS} value={tab.value} onChange={tab.change} label="Разделы компании">
      {tab.value === "overview" && <CompanySummary company={company} />}
      {tab.value === "addresses" && <AddressesSection key={company._id} companyId={company._id} />}
      {tab.value === "prices" && <CompanyMaterialsSection key={company._id} companyId={company._id} />}
      {(tab.value === "leads" || tab.value === "deals") && <CompanyRecords key={`${company._id}-${tab.value}`} companyId={company._id} kind={tab.value} onCreateLead={() => setCreatingLead(true)} dealLink={dealLink(company.roles?.includes("provider") && !hasBothRoles ? "provider" : "customer")} />}
      {tab.value === "tasks" && <TaskList filters={{ companyId: company._id }} context={{ companyId: company._id }} />}
    </RecordTabs>
    {editing && <EditingCompanyModal company={company} open onClose={() => setEditing(false)} onUpdate={onChanged} />}
    {creatingLead && <LeadFormDialog open initialCompanyId={company._id} onClose={() => setCreatingLead(false)} onSaved={onChanged} />}
  </div>;
}

type RecordsQuery = { kind: "leads" | "deals"; companyId: string; search: string; page: number };
type RecordPage = { items: Array<LeadDto | DealDto>; total: number; page: number; totalPages: number };
const loadRecords = (query: RecordsQuery, signal: AbortSignal): Promise<RecordPage> => query.kind === "leads"
  ? getLeads({ companyId: query.companyId, search: query.search, page: query.page, pageSize: 20 }, { signal })
  : dealsService.getDeals({ companyId: query.companyId, search: query.search, page: query.page, pageSize: 20, includeDeleted: false, includeRelations: true }, { signal });

function CompanyRecords({ companyId, kind, onCreateLead, dealLink }: { companyId: string; kind: "leads" | "deals"; onCreateLead: () => void; dealLink: string }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const query = useMemo(() => ({ companyId, kind, search, page }), [companyId, kind, search, page]);
  const request = useLatestRequest(query, loadRecords, 300);
  return <div className="grid min-w-0 gap-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{kind === "leads" ? "Лидов" : "Сделок"}: {request.data?.total ?? "..."}</p>
      {kind === "leads" ? <Button size="sm" onClick={onCreateLead}><PlusIcon />Новый лид</Button> : <Button asChild size="sm"><Link to={dealLink}><FilePlus2Icon />Создать сделку</Link></Button>}
    </div>
    <Input aria-label={kind === "leads" ? "Поиск лидов компании" : "Поиск сделок компании"} value={search} maxLength={200} placeholder={kind === "leads" ? "Поиск по потребности" : "Компания, ИНН или материал"} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
    {request.loading ? <p role="status" className="py-8 text-sm text-muted-foreground">Загрузка...</p>
      : request.error ? <RequestError error={request.error} onRetry={request.retry} />
        : <div className="divide-y border-y">{request.data?.items.map((item) => "title" in item
          ? <LeadRow key={item._id} lead={item} /> : <DealRow key={item._id} deal={item} />)}
          {request.data?.total === 0 && <p className="py-8 text-center text-sm text-muted-foreground">{search ? "Не найдено" : kind === "leads" ? "Лидов компании пока нет" : "Сделок компании пока нет"}</p>}
        </div>}
    {request.data && <Pagination total={request.data.totalPages} current={page} onClick={setPage} />}
  </div>;
}
function LeadRow({ lead }: { lead: LeadDto }) {
  return <article className="grid min-w-0 gap-1 py-4"><Link to={`/leads/${lead._id}`} className="break-words text-sm font-medium text-primary hover:underline">{lead.title}</Link>
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span>{lead.stage?.name || (lead.status ? LEAD_STAGE_LABELS[lead.status] : "Без этапа")}</span>
      {lead.quantity != null && <span>{lead.quantity.toLocaleString("ru-RU")} {lead.unitMeasurement}</span>}
      {lead.nextContactAt && <span>Следующий контакт: {formatCrmDate(lead.nextContactAt)}</span>}
    </div>
    {lead.dealId && <Link to={`/deals/${lead.dealId}`} className="text-xs text-primary hover:underline">Открыть связанную сделку</Link>}
  </article>;
}
function DealRow({ deal }: { deal: DealDto }) {
  return <article className="grid min-w-0 gap-1 py-4"><Link to={`/deals/${deal._id}`} className="break-words text-sm font-medium text-primary hover:underline">{deal.number ? `${deal.number} · ` : ""}{deal.material?.name || "Сделка без материала"} · {deal.customer?.name || "Заказчик"}</Link>
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span>{deal.stage?.name || "Без этапа"}</span><span>{deal.quantity?.toLocaleString("ru-RU") ?? "Объём не указан"} {deal.unitMeasurement}</span><span>{deal.amountSalesTotal == null ? "Сумма не указана" : formatCurrency(deal.amountSalesTotal)}</span>
      {deal.provider?.name && <span>Исполнитель: {deal.provider.name}</span>}
    </div>
  </article>;
}
