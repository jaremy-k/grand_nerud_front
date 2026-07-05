"use client";

import { stagesService } from "@/services";
import { StageDto } from "@definitions/dto";
import { useEffect, useState } from "react";

function sortStagesByOrder(stages: StageDto[]): StageDto[] {
  return [...stages].sort((a, b) => {
    const aOrder = a.order ?? Number.MAX_SAFE_INTEGER;
    const bOrder = b.order ?? Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.name.localeCompare(b.name);
  });
}

export function useStages() {
  const [stages, setStages] = useState<StageDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    stagesService
      .getStages()
      .then((data) => setStages(sortStagesByOrder(data)))
      .catch(() => setStages([]))
      .finally(() => setLoading(false));
  }, []);

  return { stages, loading };
}
