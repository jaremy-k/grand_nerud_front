import { cn } from "@/lib/utils";
import { CompanyRole } from "@definitions/dto";
import { CheckIcon } from "lucide-react";

const ROLE_OPTIONS: Array<{
  value: CompanyRole;
  label: string;
  selectedClass: string;
  idleClass: string;
}> = [
  {
    value: "provider",
    label: "Исполнитель",
    selectedClass:
      "border-red-600 bg-red-600 text-white hover:bg-red-700 dark:border-red-500 dark:bg-red-600",
    idleClass:
      "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
  },
  {
    value: "customer",
    label: "Заказчик",
    selectedClass:
      "border-green-600 bg-green-600 text-white hover:bg-green-700 dark:border-green-500 dark:bg-green-600",
    idleClass:
      "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300",
  },
];

export default function CompanyRoleSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: CompanyRole[];
  onChange: (value: CompanyRole[]) => void;
  disabled?: boolean;
}) {
  const toggleRole = (role: CompanyRole) => {
    const selected = value.includes(role);
    if (selected && value.length === 1) return;
    onChange(
      selected ? value.filter((item) => item !== role) : [...value, role]
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium">Статус:</span>
      {ROLE_OPTIONS.map((role) => {
        const selected = value.includes(role.value);
        return (
          <button
            key={role.value}
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => toggleRole(role.value)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              selected ? role.selectedClass : role.idleClass
            )}
          >
            {selected && <CheckIcon className="size-3.5" />}
            {role.label}
          </button>
        );
      })}
    </div>
  );
}
