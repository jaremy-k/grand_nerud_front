import { formatINN } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { CompanyDto } from "@definitions/dto";
import { Check } from "lucide-react";
import getTypeLabel from "./type-label";

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
      className="py-2.5 text-sm flex items-center gap-4 text-left hover:bg-slate-100 px-2.5 rounded-md cursor-pointer group w-full"
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
      <div className="flex justify-between items-center gap-4 flex-auto flex-nowrap overflow-hidden">
        <div className="flex-auto flex justify-between items-center">
          <p className="truncate text-slate-700 group-hover:text-slate-900 flex-auto max-w-md">
            {company.name}
          </p>
          {getTypeLabel(company.type)}
        </div>
        <div className="flex max-w-32 justify-end w-full">
          {company.inn !== undefined && company.inn !== null && (
            <p className="bg-slate-200 text-xs py-0.5 px-1.5 rounded-sm text-slate-700 text-nowrap">
              {formatINN(company.inn)}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
