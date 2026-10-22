import { Button } from "@/components/ui/button";
import { RotateCwIcon } from "lucide-react";

export default function RequestError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return <div className="space-y-3 py-6" role="alert">
    <p className="break-words text-sm text-destructive">{error}</p>
    <Button type="button" size="sm" variant="outline" onClick={onRetry}><RotateCwIcon />Повторить загрузку</Button>
  </div>;
}
