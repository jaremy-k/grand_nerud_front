import { Page } from "@/components/blocks";
import { useParams } from "react-router-dom";
import EditDealForm from "./_components/edit-form";

export default function EditDealPage() {
  const { id: dealId } = useParams<{ id: string }>();

  if (!dealId) {
    return <div className="p-8">ID сделки не указан</div>;
  }

  return (
    <Page
      breadcrumbLinks={[
        {
          label: "Сделки",
          href: "/deals",
        },
        {
          label: `Редактирование сделки #${dealId}`,
          href: `/deals/${dealId}/edit`,
        },
      ]}
    >
      <EditDealForm dealId={dealId} />
    </Page>
  );
}
