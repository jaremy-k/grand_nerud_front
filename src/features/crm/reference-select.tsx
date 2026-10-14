import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useState } from "react";

export default function ReferenceSelect({ value, onChange, options, placeholder = "Не выбран", disabled = false, id }: {
  value: string; onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string; disabled?: boolean; id?: string;
}) {
  const [open, setOpen] = useState(false);
  const select = (id: string) => { onChange(id); setOpen(false); };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={id} type="button" variant="outline" role="combobox" aria-expanded={open} disabled={disabled} className="h-9 w-full min-w-0 justify-between px-3 font-normal">
          <span className="truncate">{options.find((item) => item.value === value)?.label || placeholder}</span>
          <ChevronsUpDownIcon className="shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-60 p-0">
        <Command>
          <CommandInput placeholder="Поиск" />
          <CommandList>
            <CommandEmpty>Не найдено</CommandEmpty>
            <CommandGroup>
              <CommandItem value="Не выбран" onSelect={() => select("")}>{placeholder}</CommandItem>
              {options.map((item) => (
                <CommandItem key={item.value} value={item.value} keywords={[item.label]} onSelect={() => select(item.value)}>
                  <CheckIcon className={value === item.value ? "opacity-100" : "opacity-0"} />
                  <span className="break-words">{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
