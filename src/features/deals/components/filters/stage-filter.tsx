"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { capitalizeFirstLetter } from "@/lib/typography";
import { getStageDotClass } from "@features/deals/utils/stage-colors";
import { stagesService } from "@/services";
import { useEffect, useState } from "react";

export default function StageFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    []
  );

  useEffect(() => {
    stagesService
      .getStages()
      .then((stages) =>
        setOptions(
          stages.map((stage) => ({
            label: stage.name,
            value: stage._id,
          }))
        )
      )
      .catch((err) =>
        console.log(err instanceof Error ? err.message : "Failed to load deals")
      );
  }, []);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px] shadow-none">
        <SelectValue placeholder="Выберите стадию" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Стадии</SelectLabel>
          <SelectItem key="all" value="all">
            Все стадии
          </SelectItem>
          {options.map((option) =>
            option ? (
              <SelectItem key={`stage-${option.value}`} value={option.value}>
                <span className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${getStageDotClass(option.value)}`}
                  />
                  {capitalizeFirstLetter(option.label)}
                </span>
              </SelectItem>
            ) : null
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
