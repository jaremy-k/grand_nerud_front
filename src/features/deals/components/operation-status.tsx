import type { OperationSummary } from "@/definitions/dto/deal-operations";
import { EXECUTION_LABELS, PAYMENT_LABELS } from "@features/deals/utils/operations";

export default function OperationStatus({ summary, kind }: { summary?: OperationSummary; kind: "payment" | "execution" }) {
  if (!summary) return <span className="text-xs text-muted-foreground">Нет данных</span>;
  const status = kind === "payment" ? summary.paymentStatus : summary.executionStatus;
  const label = kind === "payment" ? PAYMENT_LABELS[summary.paymentStatus] : EXECUTION_LABELS[summary.executionStatus];
  const color = status === "paid" || status === "completed" || status === "not_required" ? "bg-emerald-50 text-emerald-800" : status === "partial" ? "bg-amber-50 text-amber-900" : status === "unpaid" || status === "unknown" ? "bg-red-50 text-red-800" : "bg-sky-50 text-sky-800";
  return <span className={`inline-block max-w-full rounded px-2 py-1 text-xs leading-snug ${color}`}>{label}</span>;
}
