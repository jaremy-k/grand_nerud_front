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
import { DealDto } from "@definitions/dto";
import { useEffect, useState } from "react";

function getUniqueManagers(deals: DealDto[]) {
  const managerMap: Record<string, string> = {};
  deals.forEach((deal) => {
    if (deal.user) {
      const userId = deal.user._id ?? deal.user.id;
      if (userId) {
        managerMap[userId] = deal.user.name || "Без имени";
      }
    }
  });
  return Object.entries(managerMap).map(([value, label]) => ({
    value,
    label: label ? capitalizeFirstLetter(label) : "Без имени",
  }));
}

export default function ManagerFilter({
  deals,
  value,
  onChange,
}: {
  deals: DealDto[];
  value: string;
  onChange: (val: string) => void;
}) {
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    []
  );

  useEffect(() => {
    setOptions(getUniqueManagers(deals));
  }, [deals]);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px] shadow-none">
        <SelectValue placeholder="Выберите менеджера" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Менеджеры</SelectLabel>
          <SelectItem key="all" value="all">
            Все менеджеры
          </SelectItem>
          {options.map((option) =>
            option ? (
              <SelectItem key={`manager-${option.value}`} value={option.value}>
                {option.label}
              </SelectItem>
            ) : null
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
