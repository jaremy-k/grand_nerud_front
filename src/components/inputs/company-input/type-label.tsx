import { cn } from "@/lib/utils";

export default function getTypeLabel(type: string) {
  return (
    <p
      className={cn(
        "bg-slate-200 text-xs py-0.5 px-1.5 rounded-sm text-slate-700 text-nowrap",
        type === "Физическое лицо" ? "" : "",
        type === "Индивидуальный предприниматель" ? "" : "",
        type === "Юридическое лицо" ? "" : ""
      )}
    >
      {type}
    </p>
  );
}
