import { Link } from "react-router-dom";
import CompanyContactDetails from "@/components/inputs/company-input/company-contact-details";
import type { CompanyDto } from "@definitions/dto";

export default function CompanySummary({ company, linked = false }: { company: CompanyDto; linked?: boolean }) {
  return <div className="grid min-w-0 gap-4 text-sm">
    {linked && <Link to={`/companies/${company._id}`} className="break-words font-medium text-primary hover:underline">{company.name}</Link>}
    <dl className="grid gap-2">
      {[ ["ИНН", company.inn], ["КПП", company.kpp], ["Тип", company.type],
        ["Источник", company.source], ["Сегменты", company.segments?.join(", ")] ].map(([label, value]) =>
        value ? <div key={label} className="grid grid-cols-[90px_minmax(0,1fr)] gap-3"><dt className="text-muted-foreground">{label}</dt><dd className="break-words">{value}</dd></div> : null)}
    </dl>
    <div className="grid gap-2"><h3 className="text-sm font-medium">Контактное лицо</h3><CompanyContactDetails company={company} maxItems={3} /></div>
    {company.comment && <p className="whitespace-pre-wrap break-words text-muted-foreground">{company.comment}</p>}
    {Boolean(company.contacts?.length) && <details className="text-xs text-muted-foreground"><summary className="cursor-pointer">Контакт карточки</summary>
      <div className="grid gap-2 pt-2">{company.contacts.map((contact, index) => <dl key={index} className="grid gap-1">
        {Object.entries(contact).map(([key, value]) => <div key={key} className="break-words"><dt className="inline">{key}: </dt><dd className="inline">{typeof value === "object" ? JSON.stringify(value) : String(value ?? "")}</dd></div>)}
      </dl>)}</div>
    </details>}
  </div>;
}
