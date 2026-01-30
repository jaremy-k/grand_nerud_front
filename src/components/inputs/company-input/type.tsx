import { cn } from "@/lib/utils";

const buttonStyle = (active: boolean) =>
  cn(
    "text-sm py-2.5 px-3 rounded-md duration-150 cursor-pointer leading-[1]",
    active ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-950"
  );

/** Значение объединённой вкладки ИП + Юр. лицо (только для фильтра/выбора типа формы) */
export const IP_AND_LEGAL_TYPE = "ip_and_legal";

export default function TypeSelector({
  value,
  onChange,
  withoutAny = false,
}: {
  value: string;
  onChange: (val: string) => void;
  withoutAny?: boolean;
}) {
  const isIpAndLegal =
    value === IP_AND_LEGAL_TYPE ||
    value === "Индивидуальный предприниматель" ||
    value === "Юридическое лицо";

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
        onClick={() => onChange(IP_AND_LEGAL_TYPE)}
        className={buttonStyle(isIpAndLegal)}
      >
        ИП и Юр. лицо
      </button>
    </div>
  );
}
