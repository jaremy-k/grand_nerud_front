"use client";

import { Page } from "@/components/blocks";
import { DealsDataTable } from "@features/deals/components";
import { useDealsViewMode } from "@features/deals/hooks/use-deals-view-mode";

export default function DealsPage() {
  const [viewMode, setViewMode] = useDealsViewMode();

  return (
    <Page breadcrumbLinks={[{ label: "Сделки", href: "/deals" }]}>
      {/* Переключатель Таблица/Kanban — временно отключен */}
      <DealsDataTable viewMode={viewMode} setViewMode={setViewMode} />
    </Page>
  );
}
