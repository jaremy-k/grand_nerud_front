import { cn } from "@/lib/utils";
import { CompanyDto } from "@definitions/dto";
import { Check } from "lucide-react";

export default function CompanyButton({
  company,
  selected,
  onClick,
}: {
  company: CompanyDto;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      key={company._id}
      onClick={onClick}
      type="button"
      className="flex w-full cursor-pointer items-center gap-3 rounded-md px-2.5 py-2.5 text-left text-sm hover:bg-muted"
    >
      <div
        className={cn(
          "border p-0.5 rounded-sm flex justify-center items-center flex-none",
          selected
            ? "border-slate-800 bg-slate-800 text-slate-100"
            : "border-slate-600"
        )}
      >
        <Check
          className={cn("h-3 w-3", selected ? "opacity-100" : "opacity-0")}
        />
      </div>
      <span className="min-w-0 flex-auto truncate text-foreground">
        {company.name}
      </span>
    </button>
  );
}
