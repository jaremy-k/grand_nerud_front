import { FormulaField } from "@/services/calculation-rules";

export type NamedLabel = {
  name: string;
  label: string;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildLabelMap(
  fields: FormulaField[],
  variables: Array<{ name: string; description: string }> = []
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const variable of variables) {
    map[variable.name] = variable.description?.trim() || variable.name;
  }
  for (const field of fields) {
    map[field.name] = field.label?.trim() || field.name;
  }
  return map;
}

export function toNamedLabels(
  fields: FormulaField[],
  excludeName?: string
): NamedLabel[] {
  return fields
    .filter((f) => f.name && f.name !== excludeName)
    .map((f) => ({
      name: f.name,
      label: f.label?.trim() || f.name,
    }));
}

/** Читаемый вид формулы: технические имена заменяются на подписи. */
export function humanizeFormula(
  expression: string,
  labelByName: Record<string, string>
): string {
  if (!expression.trim()) return "";

  const entries = Object.entries(labelByName)
    .filter(([name, label]) => Boolean(label) && label !== name)
    .sort(([a], [b]) => b.length - a.length);

  let result = expression;
  for (const [name, label] of entries) {
    result = result.replace(
      new RegExp(`\\b${escapeRegExp(name)}\\b`, "g"),
      `«${label}»`
    );
  }
  return result;
}

export function resolveLabel(
  name: string,
  labelByName: Record<string, string>
): string {
  return labelByName[name] || name;
}
