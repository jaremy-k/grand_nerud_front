import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dealsService, servicesService } from "@/services";
import useDataFormHook from "@features/deals/hooks/deal-form/hook";
import DealForm from "@features/deals/components/deal-form/deal-form";
import { leadToDealInitialData } from "@features/leads/lib/conversion";
import { convertLead } from "@/services/leads";
import type LeadDto from "@/definitions/dto/lead";
import type { DealDataFormHook } from "@features/deals/hooks/deal-form/types";
import type { PreviewDealResult } from "@definitions/requests";
import { deal, deferred, services } from "./fixtures";

vi.mock("@/services", () => ({
  servicesService: { getServices: vi.fn() },
  dealsService: { previewDeal: vi.fn(), createDeal: vi.fn(), updateDeal: vi.fn() },
}));
vi.mock("@/services/leads", () => ({ convertLead: vi.fn(), getLead: vi.fn() }));
vi.mock("@features/deals/components/deal-form/primary-information", () => ({
  default: ({ formData }: { formData: DealDataFormHook }) => <input aria-label="Количество" value={formData.dealFormData.quantity} onChange={(event) => formData.updateField("quantity", event.target.value)} />,
}));
vi.mock("@features/deals/components/deal-form/financial-information", () => ({ default: () => null }));
vi.mock("@features/deals/components/deal-form/delivery-information", () => ({ default: () => null }));
vi.mock("@features/deals/components/deal-form/additional-information", () => ({ default: () => null }));

const calculation: PreviewDealResult = {
  taxAmount: 0, companyProfit: 12345, managerProfit: 100, amountPurchaseTotal: 90000,
  amountSalesTotal: 150000, actualCompanyProfit: 0, actualAmountSalesTotal: 0,
  actualAmountPurchaseTotal: 0, totalDeliveredQuantity: 0, ndsPercent: 0, managerShare: 0.1, totalAmount: 150000,
};
const tick = () => act(async () => { await vi.advanceTimersByTimeAsync(300); });

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(servicesService.getServices).mockResolvedValue(services);
  vi.mocked(dealsService.previewDeal).mockResolvedValue(calculation);
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("Форма сделки и перенос из лида", () => {
  it("сохраняет перенесённую потребность после открытия и первого выбора продажи", async () => {
    const initialData = leadToDealInitialData({ companyId: "customer", materialIds: ["sand"], quantity: 100, unitMeasurement: "м³", objectAddressId: "object", notes: "Потребность лида" } as LeadDto);
    const { result } = renderHook(() => useDataFormHook(undefined, undefined, undefined, initialData));
    await tick();
    expect(result.current.dealFormData.deliveryAddressId).toBe("object");
    act(() => result.current.updateField("serviceId", "sales"));
    act(() => result.current.updateField("providerId", "provider"));
    act(() => result.current.updateField("stageId", "stage"));
    act(() => result.current.updateField("customerId", "customer"));
    expect(result.current.dealFormData).toMatchObject({ materialId: "sand", quantity: "100", unitMeasurement: "куб.м", deliveryAddressId: "object", notes: "Потребность лида" });
  });
  it("поздняя загрузка услуг не отменяет ручные изменения при редактировании", async () => {
    const pending = deferred<typeof services>();
    vi.mocked(servicesService.getServices).mockReturnValue(pending.promise);
    const { result } = renderHook(() => useDataFormHook(deal));
    act(() => result.current.updateField("quantity", "150"));
    act(() => result.current.updateField("deliveryAddressId", "new-object"));
    act(() => result.current.updateField("amountDelivery", "500"));
    await act(async () => pending.resolve(services));
    expect(result.current.dealFormData).toMatchObject({ quantity: "150", deliveryAddressId: "new-object", amountDelivery: "500" });
  });
  it("изменение способа получения не возвращает сохранённый ранее адрес", async () => {
    const { result } = renderHook(() => useDataFormHook(deal));
    await tick();
    act(() => result.current.updateField("deliveryAddressId", "new-object"));
    act(() => result.current.updateField("methodReceiving", "доставка"));
    expect(result.current.dealFormData.deliveryAddressId).toBe("new-object");
    act(() => result.current.updateField("methodReceiving", "самовывоз"));
    expect(result.current.dealFormData).toMatchObject({ deliveryAddressId: "", amountDelivery: "0" });
    act(() => result.current.updateField("methodReceiving", "доставка"));
    expect(result.current.dealFormData.deliveryAddressId).toBe("");
  });
  it("передаёт исходные единицы доставок в preview и блокирует смену общей единицы", async () => {
    const { result } = renderHook(() => useDataFormHook(deal));
    await tick();
    expect(result.current.unitLocked).toBe(true);
    act(() => result.current.updateField("unitMeasurement", "куб.м"));
    expect(result.current.dealFormData.unitMeasurement).toBe("тонна");
    expect(vi.mocked(dealsService.previewDeal).mock.calls[0][0].deliveredQuantity).toEqual(deal.deliveredQuantity);
  });
  it("не меняет услугу и заказчика редактируемой сделки, исключённые из PATCH-контракта", () => {
    const { result } = renderHook(() => useDataFormHook(deal));
    act(() => result.current.updateField("serviceId", "transport"));
    act(() => result.current.updateField("customerId", "another-customer"));
    expect(result.current.dealFormData).toMatchObject({ serviceId: "sales", customerId: "customer", deliveryAddressId: "object", amountSalesUnit: "1500" });
  });
  it("сохраняет кнопку сделки при ошибке калькулятора, скрывает старые суммы и повторяет расчёт", async () => {
    const failed = deferred<PreviewDealResult>();
    vi.mocked(dealsService.previewDeal).mockResolvedValueOnce(calculation).mockReturnValueOnce(failed.promise).mockResolvedValueOnce({ ...calculation, companyProfit: 67890 });
    render(<MemoryRouter><DealForm defaultDeal={deal} /></MemoryRouter>);
    await tick();
    expect(screen.getAllByText(/12\s?345/).length).toBeGreaterThan(0);
    fireEvent.change(screen.getByRole("textbox", { name: "Количество" }), { target: { value: "150" } });
    expect(screen.queryByText(/12\s?345/)).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("Расчёт");
    await tick();
    await act(async () => failed.reject(new Error("Сервер недоступен")));
    expect(screen.getByRole("alert").textContent).toContain("Суммы не подтверждены");
    expect(screen.getByRole("button", { name: "Обновить сделку" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Повторить расчёт" }));
    await tick();
    expect(screen.getAllByText(/67\s?890/).length).toBeGreaterThan(0);
  });
  it("отправляет перенесённую потребность при переводе лида без повторного создания сделки", async () => {
    const lead = { _id: "lead", companyId: "customer", materialIds: ["sand"], quantity: 100, unitMeasurement: "м³", objectAddressId: "object", notes: "Потребность лида" } as LeadDto;
    vi.mocked(convertLead).mockResolvedValue({ deal: { ...deal, _id: "converted" }, lead });
    render(<MemoryRouter><DealForm sourceLead={lead} initialData={{
      ...leadToDealInitialData(lead), serviceId: "sales", providerId: "provider", stageId: "stage", shippingAddressId: "shipping",
    }} /></MemoryRouter>);
    await tick();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Создать сделку" })));
    expect(convertLead).toHaveBeenCalledWith("lead", expect.objectContaining({ quantity: 100, unitMeasurement: "куб.м", materialId: "sand", deliveryAddressId: "object", notes: "Потребность лида" }));
    expect(dealsService.createDeal).not.toHaveBeenCalled();
  });
  it("обновляет сделку без изменения единиц уже внесённых доставок", async () => {
    render(<MemoryRouter><DealForm defaultDeal={deal} /></MemoryRouter>);
    await tick();
    fireEvent.change(screen.getByRole("textbox", { name: "Количество" }), { target: { value: "150" } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Обновить сделку" })));
    expect(dealsService.updateDeal).toHaveBeenCalledWith("deal", expect.objectContaining({ deliveredQuantity: deal.deliveredQuantity, unitMeasurement: "тонна", quantity: 150 }));
  });
});
