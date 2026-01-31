"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "deals-view-mode";
export type DealsViewMode = "table" | "kanban";

export function useDealsViewMode(): [
  DealsViewMode,
  (mode: DealsViewMode) => void
] {
  const [mode, setModeState] = useState<DealsViewMode>("table");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "table" || stored === "kanban") {
      setModeState(stored);
    }
  }, []);

  const setMode = useCallback((value: DealsViewMode) => {
    setModeState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, value);
    }
  }, []);

  return [mode, setMode];
}
