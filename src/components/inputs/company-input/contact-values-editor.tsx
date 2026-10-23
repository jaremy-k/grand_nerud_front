import { useId } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContactValuesEditor({ label, type, value, onChange, disabled = false }: {
  label: string; type: "tel" | "email"; value: string[]; onChange: (value: string[]) => void; disabled?: boolean;
}) {
  const id = useId();
  const noun = type === "tel" ? "телефон" : "email";
  return <section className="grid min-w-0 content-start gap-2">
    <div className="flex items-center justify-between gap-2"><Label id={`${id}-label`}>{label}</Label>
      <Button type="button" variant="ghost" size="icon-sm" disabled={disabled} title={`Добавить ${noun}`} aria-label={`Добавить ${noun}: ${label}`} onClick={() => onChange([...value, ""])}><PlusIcon /></Button>
    </div>
    {value.length === 0 && <p className="text-xs text-muted-foreground">Не указаны</p>}
    {value.map((item, index) => <div key={index} className="flex min-w-0 gap-1">
      <Input id={`${id}-${index}`} aria-label={`${label} ${index + 1}`} type={type} value={item} disabled={disabled} className="min-w-0" autoComplete={type}
        onChange={(event) => onChange(value.map((current, at) => at === index ? event.target.value : current))} />
      <Button type="button" variant="ghost" size="icon-sm" disabled={disabled} title={`Удалить ${noun}`} aria-label={`Удалить ${noun}: ${label} ${index + 1}`} onClick={() => onChange(value.filter((_, at) => at !== index))}><Trash2Icon /></Button>
    </div>)}
  </section>;
}
