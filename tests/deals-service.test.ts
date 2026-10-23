import { beforeEach, describe, expect, it, vi } from "vitest";
import { secureGetData } from "@/lib/fetch";
import { getDeal, getDeals } from "@/services/deals";
import { deal } from "./fixtures";

vi.mock("@/lib/fetch", () => ({ secureGetData: vi.fn(), securePostData: vi.fn(), securePatchData: vi.fn(), secureDeleteData: vi.fn() }));
beforeEach(() => { vi.mocked(secureGetData).mockResolvedValue({ items: [], total: 0 }); });

describe("Поиск и связи сделок", () => {
  it("кодирует текст и отправляет серверные фильтры компании, материала и сотрудника", async () => {
    const controller = new AbortController();
    await getDeals({ search: "  Песок & щебень +  ", companyId: "company", page: 3, pageSize: 20, includeDeleted: false,
      filters: { userId: "employee", materialId: "sand", customerId: "customer", stageId: "all" } }, { signal: controller.signal });
    const [url, options] = vi.mocked(secureGetData).mock.calls[0];
    const params = new URL(url, "http://localhost").searchParams;
    expect(params.get("search")).toBe("Песок & щебень +");
    expect(params.get("companyId")).toBe("company");
    expect(params.get("customerId")).toBe("customer");
    expect(params.get("materialId")).toBe("sand");
    expect(params.get("userId")).toBe("employee");
    expect(params.get("page")).toBe("3");
    expect(params.get("page_size")).toBe("20");
    expect(params.get("includeDeleted")).toBe("false");
    expect(params.has("stageId")).toBe(false);
    expect(options?.signal).toBe(controller.signal);
  });
  it("не отправляет пустые значения и литерал undefined", async () => {
    await getDeals({ search: "  ", filters: { userId: undefined, materialId: "all" } });
    const params = new URL(vi.mocked(secureGetData).mock.calls[0][0], "http://localhost").searchParams;
    expect(params.has("search")).toBe(false);
    expect(params.has("userId")).toBe(false);
    expect(params.has("materialId")).toBe(false);
  });
  it("нормализует адреса из реального контракта со связями", async () => {
    const shipping = { _id: "shipping", adressDetail: { address: "Карьер" } };
    const delivery = { _id: "object", adressDetail: { address: "Объект" } };
    vi.mocked(secureGetData).mockResolvedValue({ ...deal, shippingAddress: "legacy", deliveryAddress: null, shipping_address: shipping, delivery_address: delivery });
    const result = await getDeal("deal");
    expect(result.shippingAddress).toEqual(shipping);
    expect(result.deliveryAddress).toEqual(delivery);
  });
  it("нормализует адреса в списке и не подменяет общий счётчик длиной страницы", async () => {
    vi.mocked(secureGetData).mockResolvedValue({ items: [{ ...deal, shippingAddress: "legacy" }], total: 150, totalPages: 8 });
    const result = await getDeals();
    expect(result.items[0].shippingAddress).toBeNull();
    expect(result.total).toBe(150);
  });
  it("не откатывается к другой выдаче при ошибке API", async () => {
    vi.mocked(secureGetData).mockRejectedValue(new Error("API недоступен"));
    await expect(getDeals({ search: "sand" })).rejects.toThrow("API недоступен");
    expect(secureGetData).toHaveBeenCalledTimes(1);
  });
});
