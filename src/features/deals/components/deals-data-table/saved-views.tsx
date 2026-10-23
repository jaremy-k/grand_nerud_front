import { useState } from "react";
import { BookmarkPlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deleteFilterPreset, getFilterPresets, saveFilterPreset, type FilterPreset } from "@features/deals/utils/filter-presets";
import type { DealListState } from "@features/deals/utils/list-state";

export default function SavedViews({ view, onApply, userKey }: { view: DealListState; onApply: (view: DealListState) => void; userKey?: string }) {
  const [presets, setPresets] = useState(() => getFilterPresets(userKey));
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<FilterPreset | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const current = presets.find((item) => JSON.stringify(item.view) === JSON.stringify(view));
  const save = () => {
    try { saveFilterPreset(name, view, userKey); setPresets(getFilterPresets(userKey)); setOpen(false); setError(""); }
    catch (err) { setError(err instanceof Error ? err.message : "Не удалось сохранить представление"); }
  };
  const remove = () => {
    if (!deleting) return;
    try { deleteFilterPreset(deleting.id, userKey); setPresets(getFilterPresets(userKey)); setDeleting(null); setError(""); }
    catch { setError("Не удалось удалить представление"); setDeleting(null); }
  };
  return <div className="grid min-w-0 gap-1">
    <div className="flex min-w-0 items-center gap-1">
      <Select value={current?.id ?? "none"} onValueChange={(id) => { const preset = presets.find((item) => item.id === id); if (preset) onApply(preset.view); }}>
        <SelectTrigger aria-label="Представления сделок" className="w-48 min-w-0"><SelectValue /></SelectTrigger><SelectContent>
          <SelectItem value="none">Представления</SelectItem>{presets.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Button type="button" size="icon-sm" variant="ghost" title="Сохранить представление" aria-label="Сохранить представление" onClick={() => { setName(current?.name ?? ""); setError(""); setOpen(true); }}><BookmarkPlusIcon /></Button>
      {current && <Button type="button" size="icon-sm" variant="ghost" title="Удалить представление" aria-label="Удалить представление" onClick={() => setDeleting(current)}><Trash2Icon /></Button>}
    </div>
    {!open && error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="sm:max-w-md" aria-describedby={undefined}><DialogHeader><DialogTitle>Сохранить представление</DialogTitle></DialogHeader><Label htmlFor="view-name">Название</Label><Input id="view-name" value={name} maxLength={80} onChange={(event) => setName(event.target.value)} autoFocus />
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button><Button onClick={save}>{presets.some((item) => item.name.toLowerCase() === name.trim().toLowerCase()) ? "Обновить" : "Сохранить"}</Button></DialogFooter>
    </DialogContent></Dialog>
    <AlertDialog open={Boolean(deleting)} onOpenChange={(value) => !value && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Удалить представление?</AlertDialogTitle><AlertDialogDescription>{deleting?.name}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><Button variant="destructive" onClick={remove}>Удалить</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
