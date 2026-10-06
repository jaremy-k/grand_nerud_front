import { cn } from "@/lib/utils";
import { CompanyDto } from "@definitions/dto";
import { GlobeIcon, MailIcon, PhoneIcon } from "lucide-react";

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean))] as string[];
}

function ContactValue({
  type,
  value,
  interactive,
}: {
  type: "phone" | "email" | "website";
  value: string;
  interactive: boolean;
}) {
  const Icon = type === "phone" ? PhoneIcon : type === "email" ? MailIcon : GlobeIcon;
  const href =
    type === "phone"
      ? `tel:${value.replace(/[^\d+]/g, "")}`
      : type === "email"
        ? `mailto:${value}`
        : /^https?:\/\//i.test(value)
          ? value
          : `https://${value}`;

  const content = (
    <>
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      <span className="break-all">{value}</span>
    </>
  );

  return interactive ? (
    <a
      href={href}
      target={type === "website" ? "_blank" : undefined}
      rel={type === "website" ? "noreferrer" : undefined}
      className="flex items-start gap-1.5 text-xs text-foreground hover:underline"
      onClick={(event) => event.stopPropagation()}
    >
      {content}
    </a>
  ) : (
    <span className="flex items-start gap-1.5 text-xs text-muted-foreground">
      {content}
    </span>
  );
}

export default function CompanyContactDetails({
  company,
  interactive = true,
  compact = false,
  className,
}: {
  company: CompanyDto;
  interactive?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const people = company.contactPersons ?? [];
  const personPhones = new Set(
    people.map((person) => person.phone?.trim()).filter(Boolean)
  );
  const personEmails = new Set(
    people.map((person) => person.email?.trim().toLowerCase()).filter(Boolean)
  );
  const companyPhones = unique(company.phones ?? []).filter(
    (phone) => !personPhones.has(phone)
  );
  const companyEmails = unique(company.emails ?? []).filter(
    (email) => !personEmails.has(email.toLowerCase())
  );
  const websites = unique(company.websites ?? []);
  const hasContacts =
    people.length > 0 ||
    companyPhones.length > 0 ||
    companyEmails.length > 0 ||
    websites.length > 0;

  if (!hasContacts) {
    return <span className="text-sm text-muted-foreground">Не указаны</span>;
  }

  return (
    <div className={cn("grid min-w-0 gap-2", compact && "gap-1.5", className)}>
      {people.map((person, index) => (
        <div key={`${person.name}-${index}`} className="border-l-2 border-border pl-2">
          <div className="flex flex-wrap items-baseline gap-x-1.5">
            <span className="text-xs font-medium text-foreground">
              {person.name}
            </span>
            {person.position && (
              <span className="text-xs text-muted-foreground">
                {person.position}
              </span>
            )}
            {person.isPrimary && (
              <span className="text-[11px] text-primary">Основной</span>
            )}
          </div>
          <div className="mt-1 grid gap-1">
            {person.phone && (
              <ContactValue
                type="phone"
                value={person.phone}
                interactive={interactive}
              />
            )}
            {person.email && (
              <ContactValue
                type="email"
                value={person.email}
                interactive={interactive}
              />
            )}
          </div>
        </div>
      ))}

      {(companyPhones.length > 0 ||
        companyEmails.length > 0 ||
        websites.length > 0) && (
        <div className="grid gap-1">
          {people.length > 0 && (
            <span className="text-[11px] font-medium text-muted-foreground">
              Компания
            </span>
          )}
          {companyPhones.map((phone) => (
            <ContactValue
              key={`phone-${phone}`}
              type="phone"
              value={phone}
              interactive={interactive}
            />
          ))}
          {companyEmails.map((email) => (
            <ContactValue
              key={`email-${email}`}
              type="email"
              value={email}
              interactive={interactive}
            />
          ))}
          {websites.map((website) => (
            <ContactValue
              key={`website-${website}`}
              type="website"
              value={website}
              interactive={interactive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
