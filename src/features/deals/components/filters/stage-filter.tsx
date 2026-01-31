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
import { useStages } from "@features/deals/hooks/use-stages";
import { getStageDotClass } from "@features/deals/utils/stage-colors";

export default function StageFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const { stages } = useStages();

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
          {stages.map((stage) => (
            <SelectItem key={`stage-${stage._id}`} value={stage._id}>
              <span className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${getStageDotClass(stage._id)}`}
                />
                {capitalizeFirstLetter(stage.name)}
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
