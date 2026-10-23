import { useCallback, type RefObject } from "react";
import { useBeforeUnload, useBlocker, type BlockerFunction } from "react-router-dom";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function UnsavedChangesGuard({ when, bypass }: { when: boolean; bypass: RefObject<boolean> }) {
  const blocker = useBlocker(useCallback<BlockerFunction>(({ currentLocation, nextLocation }) => when && !bypass.current
    && (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search), [when, bypass]));
  useBeforeUnload(useCallback((event) => {
    if (!when || bypass.current) return;
    event.preventDefault();
    event.returnValue = "";
  }, [when, bypass]));
  return <AlertDialog open={blocker.state === "blocked"} onOpenChange={(open) => {
    if (!open && blocker.state === "blocked") blocker.reset();
  }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Есть несохранённые изменения</AlertDialogTitle>
    <AlertDialogDescription>При выходе изменения в форме сделки будут потеряны.</AlertDialogDescription></AlertDialogHeader>
    <AlertDialogFooter><AlertDialogCancel onClick={() => blocker.state === "blocked" && blocker.reset()}>Остаться</AlertDialogCancel>
      <Button variant="destructive" onClick={() => blocker.state === "blocked" && blocker.proceed()}>Выйти без сохранения</Button>
    </AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
