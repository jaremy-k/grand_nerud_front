import type { ContactPerson } from "@definitions/dto";

export function contactValues(values: Array<string | undefined | null>, email = false): string[] {
  const seen = new Set<string>();
  return values.flatMap((value) => {
    const trimmed = value?.trim();
    if (!trimmed) return [];
    const key = email ? trimmed.toLowerCase() : trimmed;
    if (seen.has(key)) return [];
    seen.add(key);
    return [trimmed];
  });
}

export const personPhones = (person: ContactPerson) => contactValues([person.phone, ...(person.phones ?? [])]);
export const personEmails = (person: ContactPerson) => contactValues([person.email, ...(person.emails ?? [])], true);
export const validEmails = (emails: string[]) => emails.every((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

export const isValidContactPersons = (people: ContactPerson[]) => people.every(
  (person) => person.name.trim().length > 0 && validEmails(personEmails(person))
);

export function normalizeContactPersons(people: ContactPerson[]): ContactPerson[] {
  return people.map((person) => {
    const phones = personPhones(person);
    const emails = personEmails(person);
    return { name: person.name.trim(), position: person.position?.trim() || undefined,
      inn: String(person.inn ?? "").replace(/\D/g, "") || undefined, comment: person.comment?.trim() || undefined,
      isPrimary: Boolean(person.isPrimary), phones, emails,
      phone: phones[0], email: emails[0],
    };
  });
}
