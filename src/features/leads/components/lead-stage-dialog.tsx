import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReferenceSelect from "@/features/crm/reference-select";
import { fromMoscowInput, leadIsLocked, toMoscowInput, validateLeadStage } from "@/features/crm/utils";
import type LeadDto from "@/definitions/dto/lead";
import type { LeadStageDto } from "@/definitions/dto/lead";
import { updateLead } from "@/services/leads";
import { useState } from "react";

export default function LeadStageDialog({ lead, stages, onClose, onSaved }: {
  lead: LeadDto; stages: LeadStageDto[]; onClose: () => void; onSaved: () => void;
}) {
  const [stageId, setStageId] = useState(lead.stageId);
  const [date, setDate] = useState(toMoscowInput(lead.nextContactAt));
  const [reason, setReason] = useState(lead.lossReason ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const kind = stages.find((stage) => stage._id === stageId)?.kind;
  const save = async () => {
    if (leadIsLocked(lead)) return;
    const message = validateLeadStage(kind, date, reason);
    if (!stageId || message) { setError(message || "Выберите этап"); return; }
    setSaving(true); setError("");
    try {
      await updateLead(lead._id, { stageId,
        ...(kind === "deferred" ? { nextContactAt: fromMoscowInput(date) } : {}),
        ...(kind === "unqualified" ? { lossReason: reason.trim(), nextContactAt: null } : {}),
      }); onSaved(); onClose();
    } catch (err) { setError(err instanceof Error ? err.message : "Не удалось изменить этап"); }
    finally { setSaving(false); }
  };
  return <Dialog open onOpenChange={(open) => !open && !saving && onClose()}><DialogContent><DialogHeader><DialogTitle>Изменить этап</DialogTitle></DialogHeader><Label htmlFor="change-lead-stage">Этап</Label><ReferenceSelect id="change-lead-stage" value={stageId} disabled={saving} onChange={setStageId} options={stages.filter((stage) => stage.kind !== "converted").map((stage) => ({ value: stage._id, label: stage.name }))} />
    {kind === "deferred" && <div className="grid gap-1.5"><Label htmlFor="deferred-date">Следующий контакт (МСК) *</Label><Input id="deferred-date" type="datetime-local" value={date} disabled={saving} onChange={(e) => setDate(e.target.value)} /></div>}
    {kind === "unqualified" && <div className="grid gap-1.5"><Label htmlFor="unqualified-reason">Причина *</Label><Input id="unqualified-reason" value={reason} disabled={saving} onChange={(e) => setReason(e.target.value)} /></div>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<DialogFooter><Button variant="outline" disabled={saving} onClick={onClose}>Отмена</Button><Button disabled={saving} onClick={save}>{saving ? "Сохранение..." : "Сохранить"}</Button></DialogFooter></DialogContent></Dialog>;
}
