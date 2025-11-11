import { cn } from "@/lib/utils";

const buttonStyle = (active: boolean) =>
  cn(
    "text-sm py-2.5 px-3 rounded-md duration-150 cursor-pointer leading-[1]",
    active ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-950"
  );

export default function TypeSelector({
  value,
  onChange,
  withoutAny = false,
}: {
  value: string;
  onChange: (val: string) => void;
  withoutAny?: boolean;
}) {
  return (
    <div className="flex gap-0.5 bg-slate-100 rounded-md">
      {!withoutAny && (
        <button
          type="button"
          onClick={() => onChange("all")}
          className={buttonStyle(value === "all")}
        >
          Любой
        </button>
      )}
      <button
        type="button"
        onClick={() => onChange("Физическое лицо")}
        className={buttonStyle(value === "Физическое лицо")}
      >
        Физ. лицо
      </button>
      <button
        type="button"
        onClick={() => onChange("Индивидуальный предприниматель")}
        className={buttonStyle(value === "Индивидуальный предприниматель")}
      >
        Индив. пр.
      </button>
      <button
        type="button"
        onClick={() => onChange("Юридическое лицо")}
        className={buttonStyle(value === "Юридическое лицо")}
      >
        Юр. лицо
      </button>
    </div>
  );
}
