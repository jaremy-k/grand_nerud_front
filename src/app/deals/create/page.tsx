import { Page } from "@/components/blocks";
import DealForm from "@features/deals/components/deal-form/deal-form";

export default function NewDealPage() {
  return (
    <Page
      breadcrumbLinks={[
        {
          label: "Сделки",
          href: "/deals",
        },
        {
          label: "Новая сделка",
          href: "/deals/create",
        },
      ]}
    >
      <DealForm />
    </Page>
  );
}
