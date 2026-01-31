"use client";

import { Page } from "@/components/blocks";
import { DealsDataTable } from "@features/deals/components";
import { useDealsViewMode } from "@features/deals/hooks/use-deals-view-mode";

export default function DealsPage() {
  const [viewMode, setViewMode] = useDealsViewMode();

  return (
    <Page
      breadcrumbLinks={[{ label: "Сделки", href: "/deals" }]}
      headerActions={
        <div className="flex rounded-md border p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              viewMode === "table"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Таблица
          </button>
          <button
            type="button"
            onClick={() => setViewMode("kanban")}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              viewMode === "kanban"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Kanban
          </button>
        </div>
      }
    >
      <DealsDataTable viewMode={viewMode} setViewMode={setViewMode} />
    </Page>
  );
}
