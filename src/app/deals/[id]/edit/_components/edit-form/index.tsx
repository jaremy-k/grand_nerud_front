"use client";

import { dealsService } from "@/services";
import { DealDto } from "@definitions/dto";
import DealForm from "@features/deals/components/deal-form/deal-form";
import { useLatestRequest } from "@/hooks/use-latest-request";
import RequestError from "@/features/crm/request-error";

const loadDeal = (id: string, signal: AbortSignal): Promise<DealDto> => dealsService.getDeal(id, { signal });

export default function EditDealForm({ dealId }: { dealId: string }) {
  const { data: deal, loading, error, retry } = useLatestRequest(dealId, loadDeal);

  if (loading) return <div className="p-8">Загрузка сделки...</div>;
  if (error) return <RequestError error={error} onRetry={retry} />;
  if (!deal) return <div className="p-8">Сделка не найдена</div>;

  return <div className="py-3"><h1 className="text-xl font-semibold">{deal.number ? `Редактирование ${deal.number}` : "Редактирование сделки"}</h1><DealForm key={deal._id} defaultDeal={deal} /></div>;
}
