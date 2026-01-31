"use client";

import { stagesService } from "@/services";
import { StageDto } from "@definitions/dto";
import { useEffect, useState } from "react";

const STAGE_NAME_ORDER = [
  "согласование",
  "заключение договора",
  "ожидает оплаты",
  "заказ выполняется",
  "выполнен",
  "отменен",
  "без этапа",
];

function sortStagesByProcessOrder(stages: StageDto[]): StageDto[] {
  const orderMap = new Map(
    STAGE_NAME_ORDER.map((name, i) => [name.toLowerCase(), i])
  );
  return [...stages].sort((a, b) => {
    const aIdx =
      orderMap.get(a.name.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
    const bIdx =
      orderMap.get(b.name.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
    if (aIdx !== bIdx) return aIdx - bIdx;
    return a.name.localeCompare(b.name);
  });
}

export function useStages() {
  const [stages, setStages] = useState<StageDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    stagesService
      .getStages()
      .then((data) => setStages(sortStagesByProcessOrder(data)))
      .catch(() => setStages([]))
      .finally(() => setLoading(false));
  }, []);

  return { stages, loading };
}
