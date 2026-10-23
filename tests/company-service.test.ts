import { beforeEach, expect, it, vi } from "vitest";
import { getCompaniesPage, getCompany, updateCompany } from "@/services/companies";
import { secureGetData, securePatchData } from "@/lib/fetch";

vi.mock("@/lib/fetch", () => ({ secureGetData: vi.fn(), securePatchData: vi.fn(), securePostData: vi.fn(), securePostFormData: vi.fn() }));
const company = { _id: "company", name: "Компания", roles: ["provider"], phones: ["111", "222"], contactPersons: [], contacts: [] };
beforeEach(() => { vi.mocked(secureGetData).mockResolvedValue(company); vi.mocked(securePatchData).mockResolvedValue(company); });

it("кодирует поиск и передаёт серверные фильтры и пагинацию", async () => {
  vi.mocked(secureGetData).mockResolvedValue({ items: [company], total: 70, page: 2, pageSize: 15, totalPages: 5, hasNext: true });
  const result = await getCompaniesPage({ role: "provider", search: "Песок & щебень", city: "Москва", district: "Раменки", materialId: "sand", priceUnit: "т", maxPrice: 1500, priceSort: "asc", page: 2 });
  const params = new URL(vi.mocked(secureGetData).mock.calls[0][0], "http://localhost");
  expect(params.pathname).toBe("/companies/page");
  expect(params.searchParams.get("search")).toBe("Песок & щебень");
  expect(params.searchParams.get("page")).toBe("2");
  expect(params.searchParams.get("priceUnit")).toBe("т");
  expect(params.searchParams.get("maxPrice")).toBe("1500");
  expect(result.total).toBe(70);
  expect(result.hasNext).toBe(true);
});
it("не подменяет отсутствие результатов запросом всего справочника", async () => {
  vi.mocked(secureGetData).mockResolvedValue({ items: [], total: 0, page: 1, hasNext: false });
  expect((await getCompaniesPage({ role: "provider" })).items).toEqual([]);
  expect(secureGetData).toHaveBeenCalledTimes(1);
});
it("ошибка нового API не вызывает старый маршрут", async () => {
  vi.mocked(secureGetData).mockRejectedValueOnce(new Error("404"));
  await expect(getCompaniesPage()).rejects.toThrow("404");
  expect(secureGetData).toHaveBeenCalledTimes(1);
});
it("сохраняет дополнительные контакты при PATCH и передаёт пустые массивы", async () => {
  await updateCompany("company", { phones: ["111", "222"], emails: [], contactPersons: [{ name: " Иван ", phone: "333", phones: ["444"], email: "old@example.com", emails: ["new@example.com"] }] });
  expect(securePatchData).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ phones: ["111", "222"], emails: [], contactPersons: [expect.objectContaining({ name: "Иван", phone: "333", phones: ["333", "444"], emails: ["old@example.com", "new@example.com"] })] }));
});
it("числовые ИНН из старых записей приводятся к строкам", async () => {
  vi.mocked(secureGetData).mockResolvedValue({ ...company, inn: 7707083893, kpp: 773601001, contactPersons: [{ name: "Иван", inn: 504216630447 }] });
  expect(await getCompany("company")).toMatchObject({ inn: "7707083893", kpp: "773601001", contactPersons: [{ name: "Иван", inn: "504216630447" }] });
});
