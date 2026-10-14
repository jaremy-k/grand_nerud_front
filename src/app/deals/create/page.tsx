import { Page } from "@/components/blocks";
import DealForm from "@features/deals/components/deal-form/deal-form";
import { useSearchParams } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type LeadDto from "@/definitions/dto/lead";
import { convertLead, getLead } from "@/services/leads";
import { getLeadStages } from "@/services/lead-stages";
import { Button } from "@/components/ui/button";
import { leadToDealInitialData } from "@/features/leads/lib/conversion";

export default function NewDealPage() {
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get("providerId") ?? undefined;
  const customerId = searchParams.get("customerId") ?? undefined;
  const leadId = searchParams.get("leadId") ?? undefined;
  const navigate = useNavigate();
  const [lead, setLead] = useState<LeadDto | null>(null);
  const [loading, setLoading] = useState(Boolean(leadId));
  const [error, setError] = useState("");
  const [converting, setConverting] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setLead(null); setLoading(Boolean(leadId)); setError("");
    if (!leadId) return () => controller.abort();
    Promise.all([getLead(leadId, { signal: controller.signal }), getLeadStages()]).then(([item, stages]) => {
      if (!controller.signal.aborted) setLead({ ...item, stage: item.stage ?? stages.find((stage) => stage._id === item.stageId) });
    }).catch((err) => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Не удалось загрузить лид"); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [leadId]);
  const retry = async () => {
    if (!lead) return;
    setConverting(true); setError("");
    try { const converted = await convertLead(lead._id, {}); navigate(`/deals/${converted.deal._id}`); }
    catch (err) { setError(err instanceof Error ? err.message : "Не удалось завершить перевод"); }
    finally { setConverting(false); }
  };

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
      {error && <p className="py-4 text-sm text-destructive" role="alert">{error}</p>}
      {loading ? <p className="py-10 text-center text-muted-foreground">Загрузка лида...</p> : leadId ? lead && (
        <div className="py-4">
          <div className="mb-5 grid gap-1 border-b pb-3"><Link className="text-sm text-primary hover:underline" to={`/leads/${lead._id}`}>{lead.title}</Link>{lead.objectAddress && <p className="text-xs text-muted-foreground">Объект: {lead.objectAddress}</p>}</div>
          {lead.conversionPending ? <Button disabled={converting} onClick={retry}>{converting ? "Перевод..." : "Завершить перевод"}</Button> : lead.convertedAt && lead.dealId ? <Button asChild><Link to={`/deals/${lead.dealId}`}>Открыть созданную сделку</Link></Button> : lead.stage?.kind === "qualified" ? <DealForm key={lead._id} sourceLead={lead} initialData={leadToDealInitialData(lead)} /> : <p className="text-sm text-muted-foreground">Для создания сделки переведите лид в этап «Квалифицирован».</p>}
        </div>
      ) : <DealForm
        initialProviderId={providerId}
        initialCustomerId={customerId}
      />}
    </Page>
  );
}
