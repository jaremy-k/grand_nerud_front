import { useMemo, useState } from "react";
import { companiesService } from "@/services";
import { useLatestRequest } from "@/hooks/use-latest-request";
import type { CompanyDto, CompanyRole } from "@definitions/dto";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ChevronsUpDownIcon, PlusIcon, XIcon } from "lucide-react";
import CompanyOptions from "./company-options";
import { CreatingModal } from "./creating-modal";
import { EditingCompanyModal } from "./editing-modal";

const loadSelected = (key: { value: string }, signal: AbortSignal) => key.value ? companiesService.getCompany(key.value, { signal }) : Promise.resolve(null);

export function CompanyCombobox({ value = "", disabled = false, onChange = () => {}, role = "customer", allowCreate = true,
  clearable = false, placeholder = "Выберите компанию", id, onSelect }: {
  value?: string; disabled?: boolean; onChange?: (value: string) => void; role?: CompanyRole | "all";
  allowCreate?: boolean; clearable?: boolean; placeholder?: string; id?: string; onSelect?: (company: CompanyDto | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CompanyDto | null>(null);
  const [revision, setRevision] = useState(0);
  const selectedKey = useMemo(() => ({ value, revision }), [value, revision]);
  const selected = useLatestRequest(selectedKey, loadSelected);
  const select = (company: CompanyDto | null) => { onChange(company?._id ?? ""); onSelect?.(company); setOpen(false); };
  const add = () => { setOpen(false); setCreating(true); };
  return <>
    <Button type="button" id={id} variant="outline" role="combobox" aria-expanded={open} disabled={disabled}
      title={selected.data?.name} className="h-9 w-full min-w-0 justify-between px-3 font-normal"
      onClick={() => { setSearch(""); setOpen(true); }}>
      <span className="min-w-0 truncate">{value ? selected.data?.name || (selected.error ? "Не удалось загрузить компанию" : "Загрузка компании...") : placeholder}</span><ChevronsUpDownIcon className="shrink-0 text-muted-foreground" />
    </Button>
    {selected.error && value && <button type="button" className="text-left text-xs text-destructive" onClick={selected.retry}>Повторить загрузку компании</button>}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"><DialogHeader>
      <DialogTitle>{role === "all" ? "Выбор компании" : role === "provider" ? "Выбор исполнителя" : "Выбор заказчика"}</DialogTitle><DialogDescription className="sr-only">Компании</DialogDescription>
    </DialogHeader>
      <div className="grid min-w-0 gap-3">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row"><Input aria-label="Поиск компаний" maxLength={200} placeholder="Название, ИНН или контакт" value={search} onChange={(event) => setSearch(event.target.value)} autoFocus className="min-w-0" />
          {allowCreate && <Button type="button" onClick={add}><PlusIcon />Добавить компанию</Button>}
        </div>
        {clearable && value && <Button type="button" variant="ghost" size="sm" className="justify-self-start" onClick={() => select(null)}><XIcon />{placeholder}</Button>}
        <CompanyOptions key={JSON.stringify([role, search, revision])} role={role === "all" ? undefined : role} search={search} value={value} onSelect={select}
          onEdit={allowCreate ? (company) => { setOpen(false); setEditing(company); } : undefined} onEmptyCreate={allowCreate ? add : undefined} />
      </div>
    </DialogContent></Dialog>
    {creating && <CreatingModal open initialRole={role === "provider" ? "provider" : "customer"} onCancel={() => { setCreating(false); setOpen(true); }} onClose={() => setCreating(false)} onCreate={(company) => { setRevision((current) => current + 1); select(company); }} />}
    {editing && <EditingCompanyModal open company={editing} onClose={() => { setEditing(null); setOpen(true); }} onUpdate={() => { setRevision((current) => current + 1); selected.retry(); }} />}
  </>;
}
