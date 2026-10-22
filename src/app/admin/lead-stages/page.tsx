import { Page } from "@/components/blocks";
import FunnelNavigation from "@/features/crm/funnel-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createLeadStage, deleteLeadStage, getLeadStages, updateLeadStage } from "@/services/lead-stages";
import type { LeadStageDto, LeadStageKind } from "@/definitions/dto/lead";
import { LEAD_STAGE_LABELS, sortLeadStages } from "@/features/crm/utils";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function LeadStagesPage() {
  const [stages, setStages] = useState<LeadStageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LeadStageDto | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<LeadStageKind>("in_progress");
  const [order, setOrder] = useState("0");
  const [deleting, setDeleting] = useState<LeadStageDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try { setStages(sortLeadStages(await getLeadStages())); }
    catch (err) { setError(err instanceof Error ? err.message : "Не удалось загрузить этапы"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const start = (stage?: LeadStageDto) => {
    setEditing(stage ?? null); setName(stage?.name ?? ""); setKind(stage?.kind ?? "in_progress");
    setOrder(String(stage?.order ?? Math.max(-1, ...stages.map((item) => item.order ?? -1)) + 1)); setError(""); setOpen(true);
  };
  const save = async () => {
    if (!name.trim() || !Number.isInteger(Number(order)) || Number(order) < 0 || order === "") { setError("Укажите название и целый неотрицательный порядок"); return; }
    setSaving(true); setError("");
    try {
      const body = { name: name.trim(), order: Number(order), ...(editing?.kind !== kind ? { kind } : {}) };
      if (editing) await updateLeadStage(editing._id, body); else await createLeadStage({ ...body, kind });
      setOpen(false); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Не удалось сохранить этап"); }
    finally { setSaving(false); }
  };
  const remove = async () => {
    if (!deleting) return; setSaving(true); setError("");
    try { await deleteLeadStage(deleting._id); setDeleting(null); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : "Не удалось удалить этап"); setDeleting(null); }
    finally { setSaving(false); }
  };
  return <Page breadcrumbLinks={[{ label: "Воронки", href: "/admin/funnels" }, { label: "Этапы лидов", href: "/admin/lead-stages" }]}>
    <FunnelNavigation />
    <div className="grid gap-4 py-4"><Button className="justify-self-start" onClick={() => start()}><PlusIcon />Добавить этап</Button>{error && !open && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {loading ? <p className="py-10 text-center text-muted-foreground">Загрузка...</p> : <Table><TableHeader><TableRow><TableHead>Порядок</TableHead><TableHead>Название</TableHead><TableHead>Тип этапа</TableHead><TableHead className="w-24">Действия</TableHead></TableRow></TableHeader><TableBody>{stages.map((stage) => <TableRow key={stage._id}><TableCell>{stage.order ?? "—"}</TableCell><TableCell className="font-medium">{stage.name}</TableCell><TableCell>{LEAD_STAGE_LABELS[stage.kind]}</TableCell><TableCell><div className="flex gap-1"><Button size="icon-sm" variant="ghost" title="Редактировать этап" aria-label="Редактировать этап" onClick={() => start(stage)}><PencilIcon /></Button><Button size="icon-sm" variant="ghost" title="Удалить этап" aria-label="Удалить этап" disabled={(stage.kind === "new" || stage.kind === "converted") && stages.filter((item) => item.kind === stage.kind).length === 1} onClick={() => setDeleting(stage)}><Trash2Icon /></Button></div></TableCell></TableRow>)}</TableBody></Table>}
    </div>
    <Dialog open={open} onOpenChange={(value) => !saving && setOpen(value)}><DialogContent><DialogHeader><DialogTitle>{editing ? "Редактировать этап лида" : "Новый этап лида"}</DialogTitle></DialogHeader><Label htmlFor="lead-stage-name">Название</Label><Input id="lead-stage-name" value={name} disabled={saving} onChange={(e) => setName(e.target.value)} /><Label htmlFor="lead-stage-kind">Тип этапа</Label><Select value={kind} disabled={saving || editing?.isSystem} onValueChange={(value) => setKind(value as LeadStageKind)}><SelectTrigger id="lead-stage-kind"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(LEAD_STAGE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select><Label htmlFor="lead-stage-order">Порядок</Label><Input id="lead-stage-order" type="number" min="0" step="1" value={order} disabled={saving} onChange={(e) => setOrder(e.target.value)} />{error && <p className="text-sm text-destructive" role="alert">{error}</p>}<DialogFooter><Button variant="outline" disabled={saving} onClick={() => setOpen(false)}>Отмена</Button><Button disabled={saving} onClick={save}>{saving ? "Сохранение..." : "Сохранить"}</Button></DialogFooter></DialogContent></Dialog>
    <AlertDialog open={Boolean(deleting)} onOpenChange={(value) => !value && !saving && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Удалить этап «{deleting?.name}»?</AlertDialogTitle><AlertDialogDescription>Этап можно удалить, если он не используется лидами.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={saving}>Отмена</AlertDialogCancel><Button variant="destructive" disabled={saving} onClick={remove}>Удалить</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </Page>;
}
