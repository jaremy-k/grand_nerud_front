import { Page } from "@/components/blocks";
import DealForm from "@features/deals/components/deal-form/deal-form";
import { useSearchParams } from "react-router-dom";

export default function NewDealPage() {
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get("providerId") ?? undefined;
  const customerId = searchParams.get("customerId") ?? undefined;

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
      <DealForm
        initialProviderId={providerId}
        initialCustomerId={customerId}
      />
    </Page>
  );
}
