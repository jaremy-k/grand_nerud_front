import { useEffect, useMemo, useRef, useState } from "react";
import { companiesService } from "@/services";
import { useLatestRequest } from "@/hooks/use-latest-request";
import type { CompanyDto, CompanyRole } from "@definitions/dto";
import { Button } from "@/components/ui/button";
import RequestError from "@/features/crm/request-error";
import CompanyButton from "./company-card";
import { PencilIcon } from "lucide-react";

type Query = { page: number; search: string; role?: CompanyRole };
const load = (query: Query, signal: AbortSignal) => companiesService.getCompaniesPage({ ...query, pageSize: 15, sortBy: "recent" }, { signal });

export default function CompanyOptions({ search, role, value, onSelect, onEdit, onEmptyCreate }: {
  search: string; role?: CompanyRole; value: string; onSelect: (company: CompanyDto) => void; onEdit?: (company: CompanyDto) => void;
  onEmptyCreate?: () => void;
}) {
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState<Map<number, CompanyDto[]>>(() => new Map());
  const requested = useRef(0);
  const query = useMemo(() => ({ page, search, role }), [page, search, role]);
  const request = useLatestRequest(query, load, 300);
  useEffect(() => {
    if (request.data) setPages((current) => new Map(current).set(page, request.data!.items));
  }, [request.data, page]);
  const visiblePages = new Map(pages);
  if (request.data) visiblePages.set(page, request.data.items);
  const items = [...new Map([...visiblePages.entries()].sort(([a], [b]) => a - b).flatMap(([, values]) => values).map((item) => [item._id, item])).values()];
  const nextPage = () => {
    if (request.loading || !request.data?.hasNext || request.data.page !== page || requested.current === page + 1) return;
    requested.current = page + 1;
    setPage(page + 1);
  };
  return <div className="grid min-w-0 gap-2">
    <p className="text-xs text-muted-foreground">Компаний: {request.data?.total ?? "..."}</p>
    <div className="max-h-[50dvh] min-h-24 overflow-y-auto border-y py-1" aria-label="Найденные компании" aria-busy={request.loading}
      onScroll={(event) => { const list = event.currentTarget; if (list.scrollHeight - list.scrollTop - list.clientHeight < 80) nextPage(); }}>
      {items.map((company) => <div key={company._id} className="flex min-w-0 items-center gap-1"><CompanyButton company={company} selected={value === company._id} onClick={() => onSelect(company)} />
        {onEdit && <Button type="button" size="icon-sm" variant="ghost" title="Редактировать компанию" aria-label={`Редактировать ${company.name}`} onClick={() => onEdit(company)}><PencilIcon /></Button>}
      </div>)}
      {request.loading && <p role="status" className="py-4 text-center text-sm text-muted-foreground">Загрузка...</p>}
      {!request.loading && !request.error && items.length === 0 && <p className="py-5 text-center text-sm text-muted-foreground">Не найдено</p>}
    </div>
    {request.error && <RequestError error={request.error} onRetry={request.retry} />}
    {!request.loading && !request.error && items.length === 0 && onEmptyCreate && <Button type="button" variant="outline" className="justify-self-center" onClick={onEmptyCreate}>Добавить компанию</Button>}
    {request.data?.hasNext && <Button type="button" variant="ghost" size="sm" disabled={request.loading} onClick={nextPage}>Ещё</Button>}
  </div>;
}
