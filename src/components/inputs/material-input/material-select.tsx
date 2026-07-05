"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { capitalizeFirstLetter } from "@/lib/typography";
import { cn } from "@/lib/utils";
import { materialsService } from "@/services";
import { MaterialDto } from "@definitions/dto";
import { PlusIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CreateMaterialDialog } from "./create-material-dialog";

export function MaterialSelect({
  value,
  onChange,
  disabled = false,
  className,
  name = "material",
}: {
  value?: string;
  onChange: (materialId: string) => void;
  disabled?: boolean;
  className?: string;
  name?: string;
}) {
  const [materials, setMaterials] = useState<MaterialDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectOpen, setSelectOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const loadMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const data = await materialsService.getMaterials();
      setMaterials(data.filter((m) => !m.is_deleted));
    } catch {
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMaterials();
  }, [loadMaterials]);

  const sortedMaterials = useMemo(
    () =>
      [...materials].sort((a, b) =>
        a.name.localeCompare(b.name, "ru", { sensitivity: "base" })
      ),
    [materials]
  );

  const handleCreated = (material: MaterialDto) => {
    setMaterials((prev) => {
      if (prev.some((m) => m._id === material._id)) return prev;
      return [...prev, material];
    });
    onChange(material._id);
  };

  const openCreateDialog = () => {
    setSelectOpen(false);
    setCreateOpen(true);
  };

  return (
    <>
      <Select
        name={name}
        value={value}
        open={selectOpen}
        onOpenChange={setSelectOpen}
        onValueChange={onChange}
        disabled={disabled || loading}
      >
        <SelectTrigger className={cn("h-9 min-w-0", className)}>
          <SelectValue
            placeholder={loading ? "Загрузка…" : "Выберите материал"}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {sortedMaterials.map((material) => (
              <SelectItem
                key={`material-${material._id}`}
                value={material._id}
              >
                {capitalizeFirstLetter(material.name)}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          <div
            className="p-1"
            onPointerDown={(e) => e.preventDefault()}
          >
            <Button
              type="button"
              variant="ghost"
              className="h-8 w-full justify-start gap-2 px-2 text-sm font-normal"
              onClick={openCreateDialog}
            >
              <PlusIcon className="h-4 w-4" />
              Добавить материал
            </Button>
          </div>
        </SelectContent>
      </Select>

      <CreateMaterialDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />
    </>
  );
}
