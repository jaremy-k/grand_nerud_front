import type { ReactNode } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { AuthContext } from "@/contexts/auth-context";
import DealDetailPage from "@/app/deals/[id]/page";
import CompanyDetailPage from "@/app/companies/[id]/page";
import { addressesService, companiesService, companyMaterialsService, dealsService } from "@/services";
import { getLeads } from "@/services/leads";
import { getTasks } from "@/services/tasks";
import type { CompanyDto, DealDto } from "@definitions/dto";
import { deal, deferred } from "./fixtures";
import { getDealOperations } from "@/services/deal-operations";
import { operationFixture } from "./operation-fixtures";
vi.mock("@/services/deal-operations", () => ({ getDealOperations: vi.fn(), saveDealPayment: vi.fn(), saveDealShipment: vi.fn(), cancelDealOperation: vi.fn() }));

vi.mock("@/components/blocks", () => ({
  Page: ({ children }: { children: ReactNode }) => <>{children}</>,
  Pagination: ({ total, current, onClick }: { total: number; current: number; onClick: (page: number) => void }) => total > 1
    ? <button onClick={() => onClick(current === 1 ? 2 : 1)}>Следующая страница</button> : null,
}));
vi.mock("@/services", () => ({
  companiesService: { getCompany: vi.fn(), getCompanies: vi.fn(), updateCompany: vi.fn() },
  companyMaterialsService: { getCompanyMaterials: vi.fn() },
  addressesService: { getAddress: vi.fn(), getAddresses: vi.fn() },
  dealsService: { getDeal: vi.fn(), getDeals: vi.fn(), deleteDeal: vi.fn() },
}));
vi.mock("@/services/leads", () => ({ getLeads: vi.fn(), createLead: vi.fn(), updateLead: vi.fn() }));
vi.mock("@/services/tasks", () => ({ getTasks: vi.fn(), deleteTask: vi.fn(), updateTask: vi.fn(), createTask: vi.fn() }));
const company: CompanyDto = { _id: "customer", name: "ООО Стройпроект", roles: ["customer"], inn: "7707083893", kpp: "773601001", contacts: [{ Директор: "Сведения ФНС" }],
  phones: ["+7 999 111-22-33", "+7 999 444-55-66"], emails: ["hello@example.com"], contactPersons: [{ name: "Иван Петров", phone: "+7 999 777-88-99", email: "ivan@example.com" }] };
const provider: CompanyDto = { ...company, _id: "provider", name: "Северный карьер", roles: ["provider"] };
const details: DealDto = { ...deal, customer: company, provider, material: { _id: "sand", name: "Песок" }, stage: { _id: "stage", name: "Согласование" },
  shippingAddress: { _id: "shipping", companyId: "provider", coordinates: [37, 55], adressDetail: { address: "Адрес карьера" }, typeAdress: "Склад", deletedAt: null },
  deliveryAddress: { _id: "object", companyId: "customer", coordinates: [37, 55], adressDetail: { address: "Адрес объекта" }, typeAdress: "Объект", deletedAt: null } };
const empty = { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0, hasNext: false, hasPrev: false };

function renderPage(path: string) {
  const router = createMemoryRouter([
    { path: "/deals/:id", element: <DealDetailPage /> }, { path: "/companies/:id", element: <CompanyDetailPage /> },
    { path: "*", element: <p>Другой экран</p> },
  ], { initialEntries: [path] });
  render(<AuthContext.Provider value={{ user: { id: "employee", name: "Иван", email: "ivan@example.com", admin: false }, loading: false, error: null, login: async () => {}, logout: async () => {} }}><RouterProvider router={router} /></AuthContext.Provider>);
  return router;
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(dealsService.getDeal).mockResolvedValue(details);
  vi.mocked(getDealOperations).mockResolvedValue(structuredClone(operationFixture));
  vi.mocked(companiesService.getCompany).mockImplementation(async (id) => id === "provider" ? provider : company);
  vi.mocked(addressesService.getAddresses).mockResolvedValue([]);
  vi.mocked(companyMaterialsService.getCompanyMaterials).mockResolvedValue([]);
  vi.mocked(getLeads).mockResolvedValue(empty);
  vi.mocked(getTasks).mockResolvedValue(empty);
  vi.mocked(dealsService.getDeals).mockResolvedValue(empty);
});
afterEach(cleanup);

it("разделяет обзор, финансы, объёмы и задачи и связывает обе компании", async () => {
  renderPage("/deals/deal");
  await screen.findByRole("heading", { name: company.name });
  expect(screen.getAllByRole("tab").map((item) => item.textContent)).toEqual(["Обзор", "Финансы", "Оплаты", "Поставки", "История операций", "Задачи"]);
  expect(screen.getByRole("link", { name: company.name }).getAttribute("href")).toBe("/companies/customer");
  expect(screen.getByRole("link", { name: provider.name }).getAttribute("href")).toBe("/companies/provider");
  expect(screen.getByText("Адрес карьера")).toBeTruthy();
  expect(screen.getByText("Адрес объекта")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Редактировать" }).getAttribute("href")).toBe("/deals/deal/edit");
  expect(getTasks).not.toHaveBeenCalled();
});

it("открывает вкладку из URL и не подменяет неизвестный факт нулём", async () => {
  renderPage("/deals/deal?tab=finance");
  const panel = await screen.findByRole("tabpanel");
  expect(screen.getByRole("tab", { name: "Финансы" }).getAttribute("aria-selected")).toBe("true");
  expect(panel.textContent).toContain("Нет данных");
  expect(panel.textContent).not.toContain("Адрес карьера");
});

it("не складывает разные единицы и не вычисляет из них остаток", async () => {
  vi.mocked(getDealOperations).mockResolvedValue({ ...operationFixture, summary: { ...operationFixture.summary, deliveredQuantity: null, remainingQuantity: null, warning: "Проверьте объёмы и единицы существующих поставок" } });
  renderPage("/deals/deal?tab=deliveries");
  await screen.findByText("Проверьте объёмы и единицы существующих поставок");
  expect(screen.getAllByText("Нет данных").length).toBeGreaterThan(0);
  expect(screen.getByRole("button", { name: "Добавить поставку" })).toBeTruthy();
});

it("считает остаток в сопоставимых единицах и отдельно показывает превышение", async () => {
  vi.mocked(getDealOperations).mockResolvedValue({ ...operationFixture, summary: { ...operationFixture.summary, deliveredQuantity: 120, remainingQuantity: 0, overDeliveredQuantity: 20 } });
  renderPage("/deals/deal?tab=deliveries");
  await screen.findByText("Сверх плана");
  expect(screen.getByText("20 т")).toBeTruthy();
  expect(screen.getAllByText("0 т").length).toBeGreaterThan(0);
});

it("загружает задачи только для выбранной сделки", async () => {
  renderPage("/deals/deal?tab=tasks");
  await screen.findByText("Задач пока нет");
  expect(getTasks).toHaveBeenCalledWith(expect.objectContaining({ dealId: "deal", page: 1 }), expect.anything());
});

it("управляет вкладками с клавиатуры и сохраняет вкладку в URL", async () => {
  const router = renderPage("/deals/deal");
  const tab = await screen.findByRole("tab", { name: "Обзор" });
  fireEvent.keyDown(tab, { key: "ArrowRight" });
  expect(router.state.location.search).toBe("?tab=finance");
  expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Финансы" }));
});

it("показывает ошибку удаления в карточке и сохраняет сделку на экране", async () => {
  vi.mocked(dealsService.deleteDeal).mockRejectedValue(new Error("Удаление запрещено"));
  renderPage("/deals/deal");
  fireEvent.click(await screen.findByRole("button", { name: "Удалить сделку" }));
  fireEvent.click(screen.getByRole("button", { name: "Удалить" }));
  expect((await screen.findByRole("alert")).textContent).toContain("Удаление запрещено");
  expect(screen.getByRole("heading", { name: company.name })).toBeTruthy();
});

it("не показывает старую карточку после перехода и игнорирует поздний ответ", async () => {
  const pending = deferred<DealDto>();
  vi.mocked(dealsService.getDeal).mockReturnValueOnce(pending.promise).mockResolvedValueOnce({ ...details, _id: "second", customer: { ...company, name: "Вторая компания" } });
  const router = renderPage("/deals/deal");
  await waitFor(() => expect(dealsService.getDeal).toHaveBeenCalledTimes(1));
  await act(async () => { await router.navigate("/deals/second"); });
  await screen.findByRole("heading", { name: "Вторая компания" });
  await act(async () => pending.resolve(details));
  expect(screen.queryByRole("heading", { name: company.name })).toBeNull();
});

it("повторяет загрузку карточки после ошибки", async () => {
  vi.mocked(dealsService.getDeal).mockRejectedValueOnce(new Error("Ошибка карточки")).mockResolvedValueOnce(details);
  renderPage("/deals/deal");
  await screen.findByText("Ошибка карточки");
  fireEvent.click(screen.getByRole("button", { name: "Повторить загрузку" }));
  await screen.findByRole("heading", { name: company.name });
});

it("в карточке компании доступны все разделы и контактные данные", async () => {
  renderPage("/companies/customer");
  await screen.findByRole("heading", { name: company.name });
  expect(screen.getAllByRole("tab")).toHaveLength(6);
  fireEvent.click(screen.getByRole("button", { name: "Ещё 1" }));
  expect(screen.getByRole("link", { name: /hello@example.com/ }).getAttribute("href")).toBe("mailto:hello@example.com");
  expect(screen.getByRole("link", { name: /\+7 999 111-22-33/ }).getAttribute("href")).toContain("tel:");
  expect(screen.getByText("Контакт карточки")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Создать сделку" }).getAttribute("href")).toBe("/deals/create?customerId=customer");
});

it("для исполнителя создаёт сделку с заполненным providerId", async () => {
  renderPage("/companies/provider");
  await screen.findByRole("heading", { name: provider.name });
  expect(screen.getByRole("link", { name: "Создать сделку" }).getAttribute("href")).toBe("/deals/create?providerId=provider");
});

it("связанные сделки компании используют серверный фильтр и полную пагинацию", async () => {
  vi.mocked(dealsService.getDeals).mockImplementation(async (query) => ({ ...empty, items: [details], page: query?.page || 1, total: 41, totalPages: 3 }));
  renderPage("/companies/provider?tab=deals");
  await screen.findByText("Сделок: 41");
  expect(dealsService.getDeals).toHaveBeenLastCalledWith(expect.objectContaining({ companyId: "provider", page: 1, includeDeleted: false }), expect.anything());
  expect(screen.getByRole("link", { name: /Песок · ООО Стройпроект/ }).getAttribute("href")).toBe("/deals/deal");
  fireEvent.click(screen.getByRole("button", { name: "Следующая страница" }));
  await waitFor(() => expect(dealsService.getDeals).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }), expect.anything()));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "щебень" } });
  await waitFor(() => expect(dealsService.getDeals).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, search: "щебень" }), expect.anything()));
});

it("показывает лиды и задачи с фильтром текущей компании", async () => {
  const router = renderPage("/companies/customer?tab=leads");
  await screen.findByText("Лидов компании пока нет");
  expect(getLeads).toHaveBeenCalledWith(expect.objectContaining({ companyId: "customer" }), expect.anything());
  await act(async () => { await router.navigate("/companies/customer?tab=tasks"); });
  await screen.findByText("Задач пока нет");
  expect(getTasks).toHaveBeenCalledWith(expect.objectContaining({ companyId: "customer" }), expect.anything());
});

it("ошибка адресов не отображается как отсутствие адресов", async () => {
  vi.mocked(addressesService.getAddresses).mockRejectedValueOnce(new Error("Адреса недоступны"));
  renderPage("/companies/customer?tab=addresses");
  await screen.findByText("Адреса недоступны");
  expect(screen.queryByText("Адреса не добавлены")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Повторить загрузку" }));
  await screen.findByText("Адреса не добавлены");
});

it("ошибка цен не отображается как пустой прайс-лист", async () => {
  vi.mocked(companyMaterialsService.getCompanyMaterials).mockRejectedValueOnce(new Error("Цены недоступны"));
  renderPage("/companies/provider?tab=prices");
  await screen.findByText("Цены недоступны");
  expect(screen.queryByText("Прайс-лист пока пуст")).toBeNull();
});
