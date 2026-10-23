"use client";

import { Page } from "@/components/blocks";
import { DealsDataTable } from "@features/deals/components";

export default function DealsPage() {
  return (
    <Page breadcrumbLinks={[{ label: "Сделки", href: "/deals" }]}>
      <DealsDataTable />
    </Page>
  );
}
