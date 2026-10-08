"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { MaterialDto } from "@definitions/dto";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useMemo, useState } from "react";

export default function MaterialSearchFilter({
  materials,
  value,
  onChange,
}: {
  materials: MaterialDto[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const sortedMaterials = useMemo(
    () =>
      [...materials].sort((left, right) =>
        left.name.localeCompare(right.name, "ru", { sensitivity: "base" })
      ),
    [materials]
  );
  const selectedMaterial = materials.find((material) => material._id === value);

  const selectMaterial = (materialId: string) => {
    onChange(materialId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="company-material-filter"
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-full justify-between px-3 font-normal"
        >
          <span className="truncate">
            {selectedMaterial?.name || "Все материалы"}
          </span>
          <ChevronsUpDownIcon className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command>
          <CommandInput placeholder="Поиск материала" />
          <CommandList>
            <CommandEmpty>Материал не найден</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="Все материалы"
                onSelect={() => selectMaterial("")}
              >
                <CheckIcon
                  className={cn(value ? "opacity-0" : "opacity-100")}
                />
                Все материалы
              </CommandItem>
              {sortedMaterials.map((material) => (
                <CommandItem
                  key={material._id}
                  value={`${material.name} ${material._id}`}
                  onSelect={() => selectMaterial(material._id)}
                >
                  <CheckIcon
                    className={cn(
                      value === material._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {material.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
