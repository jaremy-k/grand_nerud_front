import type LeadDto from "@/definitions/dto/lead";
import type TaskDto from "@/definitions/dto/task";
import type { AddressDto, CompanyDto, CompanyMaterialDto, DealDto, UserDto } from "@definitions/dto";
import type { PaginatedResult } from "@/definitions/dto/lead";
import { toMoscowInput } from "@/features/crm/utils";

export const fixtureUser: UserDto = { id: "me", _id: "me", email: "maria@example.com", name: "Мария", lastName: "Соколова", manager: new URLSearchParams(location.search).get("role") !== "employee", admin: false };
const owners = [fixtureUser, { ...fixtureUser, id: "employee", _id: "employee", name: "Алексей", lastName: "Иванов", manager: false }];
const companies: CompanyDto[] = [
  { _id: "company", name: "ООО Стройпроект", inn: "7707083893", kpp: "773601001", roles: ["customer"], contactPersons: [{ name: "Иван Петров", position: "Руководитель снабжения", phone: "+7 999 123-45-67", phones: ["+7 999 765-43-21"], email: "ivan@example.com", emails: ["supply@stroy.example.com"] }], contacts: [{ Директор: "Иван Петров", Адрес: "Москва" }], phones: ["+7 495 123-45-67", "+7 495 765-43-21"], emails: ["office@stroy.example.com", "orders@stroy.example.com"], source: "Рекомендация", segments: ["Строительство"], comment: "Пропуск на объект оформляется за день до поставки." },
  { _id: "quarry", name: "Северный карьер", inn: "7707083894", kpp: "773601002", roles: ["provider"], contactPersons: [{ name: "Анна Сидорова", position: "Менеджер", phone: "+7 999 234-56-78", phones: ["+7 999 876-54-32"], email: "anna@example.com", emails: ["sales@quarry.example.com"] }], phones: ["+7 495 234-56-78", "+7 495 876-54-32"], emails: ["office@quarry.example.com", "orders@quarry.example.com"], contacts: [] },
];
const addresses: AddressDto[] = [
  { _id: "shipping", companyId: "quarry", city: "Москва", administrativeDistrict: "САО", district: "Дмитровский", coordinates: [37.55, 55.86], adressDetail: { address: "Москва, Дмитровское шоссе, д. 157", entrance: "Въезд через вторые ворота" }, typeAdress: "Склад", deletedAt: null },
  { _id: "object", companyId: "company", city: "Москва", administrativeDistrict: "ЮАО", district: "Даниловский", coordinates: [37.66, 55.7], adressDetail: { address: "Москва, Автозаводская улица, д. 10" }, typeAdress: "Объект", deletedAt: null },
];
const prices: CompanyMaterialDto[] = [{ _id: "price", companyId: "quarry", materialId: "sand", price: 1450, unit: "т", comment: "Цена без доставки", material: { _id: "sand", name: "Песок" } }];
const deals: DealDto[] = [{
  _id: "deal", number: "СД-000123", numberSequence: 123, userId: "me", serviceId: "sales", customerId: "company", providerId: "quarry", stageId: "deal-new", materialId: "sand", quantity: 100, unitMeasurement: "тонна",
  amountPurchaseUnit: 1450, amountPurchaseTotal: 145000, amountSalesUnit: 1900, amountSalesTotal: 190000, amountDelivery: 15000,
  companyProfit: 30000, managerProfit: 3000, actualCompanyProfit: 6000, actualAmountSalesTotal: 76000, actualAmountPurchaseTotal: 58000, totalDeliveredQuantity: 40,
  ndsAmount: 0, ndsPercent: 0, totalAmount: 190000, paymentMethod: "наличный расчет", methodReceiving: "доставка", shippingAddressId: "shipping", deliveryAddressId: "object", shippingAddress: addresses[0], deliveryAddress: addresses[1],
  notes: "Доставка по согласованию с прорабом. Звонить за час до приезда.", OSSIG: false, addExpenses: [], sourceLeadId: "lead",
  deliveredQuantity: [{ quantity: 20, unit: "т", date: "2026-10-20 00:00", amountPurchase: 29000 }, { quantity: 20, unit: "т", date: "2026-10-21 00:00", amountPurchase: 29000 }],
  customer: companies[0], provider: companies[1], material: { _id: "sand", name: "Песок" }, service: { _id: "sales", name: "Продажа", kind: "sales" }, stage: { _id: "deal-new", name: "Согласование" }, user: fixtureUser,
  createdAt: "2026-10-19T09:00:00Z", updatedAt: "2026-10-21T10:00:00Z", deletedAt: null,
}];
const stages = [
  { _id: "new", name: "Новый", kind: "new", order: 0 },
  { _id: "work", name: "В работе", kind: "in_progress", order: 1 },
  { _id: "qualified", name: "Квалифицирован", kind: "qualified", order: 2 },
];
const now = Date.now();
const leads: LeadDto[] = [
  { _id: "lead", title: "Песок для нового объекта на Автозаводской", ownerId: "me", stageId: "new", status: "new", priority: "high", materialIds: ["sand"], companyId: "company", company: companies[0], quantity: 100, unitMeasurement: "т", materials: [{ _id: "sand", name: "Песок" }], nextContactAt: new Date(now + 3_600_000).toISOString() },
  { _id: "lead-other", title: "Поставка щебня для реконструкции складского комплекса", ownerId: "employee", stageId: "new", status: "new", priority: "normal", materialIds: [], companyId: "company", company: companies[0] },
];
let tasks: TaskDto[] = [
  { _id: "call", title: "Согласовать объём и стоимость доставки песка", ownerId: "me", companyId: "company", company: companies[0], leadId: "lead", dealId: "deal", lead: leads[0], dueAt: new Date(now - 2 * 3_600_000).toISOString(), type: "call", status: "open" },
  { _id: "email", title: "Отправить коммерческое предложение заказчику", ownerId: "me", companyId: "company", company: companies[0], dueAt: new Date(now + 3_600_000).toISOString(), type: "email", status: "open" },
  { _id: "meeting", title: "Встреча на объекте: условия подъезда и разгрузки", ownerId: "me", dueAt: new Date(now + 86_400_000).toISOString(), type: "meeting", status: "open" },
  { _id: "other-call", title: "Уточнить график отгрузки щебня на следующую неделю", ownerId: "employee", leadId: "lead-other", lead: leads[1], dueAt: new Date(now - 3_600_000).toISOString(), type: "call", status: "open" },
];

function paginated<T>(items: T[], params: URLSearchParams) {
  const page = Number(params.get("page") || 1);
  const pageSize = Number(params.get("pageSize") || params.get("page_size") || 25);
  const totalPages = Math.ceil(items.length / pageSize);
  return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, pageSize, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
}

// This module is aliased only by the visual-test Vite config. It never makes network requests.
export async function secureGetData<T>(input: string): Promise<T> {
  const url = new URL(input);
  const params = url.searchParams;
  let result: unknown;
  const matches = (item: { ownerId: string; companyId?: string | null }) =>
    (!params.get("ownerId") || item.ownerId === params.get("ownerId")) && (!params.get("companyId") || item.companyId === params.get("companyId"));
  switch (url.pathname) {
    case "/workspace/tasks":
    case "/workspace/leads": {
      const limit = Number(params.get("limit") || 6);
      const ownerId = params.get("ownerId") || (params.get("scope") === "team" ? null : fixtureUser.id!);
      const generatedAt = new Date().toISOString();
      const meta = { generatedAt, timezone: "Europe/Moscow", localDate: toMoscowInput(generatedAt).slice(0, 10),
        scope: ownerId ? ownerId === fixtureUser.id ? "mine" : "owner" : "team", ownerId, limit };
      const read = async (path: string, filters: Record<string, string>) => {
        const query = new URLSearchParams({ ...filters, page: "1", pageSize: String(limit), ...(ownerId ? { ownerId } : {}) });
        const value = await secureGetData<PaginatedResult<TaskDto | LeadDto>>(`http://crm-fixture.invalid${path}?${query}`);
        return { items: value.items, total: value.total, hasMore: value.total > value.items.length };
      };
      result = url.pathname.endsWith("tasks") ? { ...meta, overdue: await read("/tasks", { bucket: "overdue" }), today: await read("/tasks", { bucket: "today" }), upcoming: await read("/tasks", { bucket: "upcoming" }) }
        : { ...meta, newLeads: await read("/leads", { status: "new" }) };
      break;
    }
    case "/auth/all": result = owners; break;
    case "/auth/me": result = fixtureUser; break;
    case "/companies/page": {
      const search = params.get("search")?.trim().toLowerCase();
      let rows = companies.filter((company) => (!params.get("role") || company.roles.includes(params.get("role") as "customer" | "provider"))
        && (!search || [company.name, String(company.inn), ...company.phones ?? [], ...company.emails ?? []].some((value) => value.toLowerCase().includes(search))))
        .map((company) => ({ ...company, addresses: addresses.filter((address) => address.companyId === company._id), materialsWithPrices: prices.filter((price) => price.companyId === company._id) }));
      rows = rows.filter((company) => (!params.get("city") && !params.get("district") && !params.get("administrativeDistrict")) || company.addresses.some((address) =>
        (!params.get("city") || address.city === params.get("city")) && (!params.get("district") || address.district === params.get("district"))
        && (!params.get("administrativeDistrict") || address.administrativeDistrict === params.get("administrativeDistrict"))));
      if (params.get("materialId")) rows = rows.map((company) => ({ ...company, materialsWithPrices: company.materialsWithPrices.filter((price) => price.materialId === params.get("materialId")
        && (!params.get("priceUnit") || price.unit === params.get("priceUnit")) && (!params.get("maxPrice") || price.price <= Number(params.get("maxPrice")))) })).filter((company) => company.materialsWithPrices.length > 0);
      result = paginated(rows, params);
      break;
    }
    case "/companies": result = companies.filter((company) => !params.get("role") || company.roles.includes(params.get("role") as "customer" | "provider")).map((company) => ({ ...company, materialsWithPrices: prices.filter((price) => price.companyId === company._id) })); break;
    case "/materials": result = [{ _id: "sand", name: "Песок" }]; break;
    case "/services": result = [{ _id: "sales", name: "Продажа", kind: "sales" }, { _id: "transport", name: "Перевозка", kind: "transport" }]; break;
    case "/lead-stages": result = stages; break;
    case "/stages": result = [{ _id: "deal-new", name: "Новая сделка", order: 0 }]; break;
    case "/adresses": result = addresses.filter((address) => !params.get("companyId") || address.companyId === params.get("companyId")); break;
    case "/company-materials": result = prices.filter((price) => !params.get("companyId") || price.companyId === params.get("companyId")); break;
    case "/deals": result = paginated(deals.filter((deal) => {
      const companyId = params.get("companyId");
      if (companyId && deal.customerId !== companyId && deal.providerId !== companyId) return false;
      if (params.get("customerId") && deal.customerId !== params.get("customerId")) return false;
      if (params.get("userId") && deal.userId !== params.get("userId")) return false;
      const search = params.get("search")?.toLowerCase();
      return !search || [deal.number, deal.customer?.name, deal.customer?.inn, deal.provider?.name, deal.provider?.inn, deal.material?.name, deal._id].some((value) => value?.toLowerCase().includes(search));
    }), params); break;
    case "/leads": result = paginated(leads.filter((lead) => matches(lead)
      && (!params.get("status") || lead.status === params.get("status"))
      && (!params.get("stageId") || lead.stageId === params.get("stageId"))
      && (!params.get("priority") || lead.priority === params.get("priority"))
      && (!params.get("search") || lead.title.toLowerCase().includes(params.get("search")!.toLowerCase()))), params); break;
    case "/tasks": result = paginated(tasks.filter((task) => {
      if (!matches(task) || (params.get("type") && task.type !== params.get("type"))) return false;
      if (params.get("leadId") && task.leadId !== params.get("leadId")) return false;
      if (params.get("dealId") && task.dealId !== params.get("dealId")) return false;
      if (params.get("status") && task.status !== params.get("status")) return false;
      const bucket = params.get("bucket");
      if (bucket && task.status !== "open") return false;
      if (bucket === "overdue") return new Date(task.dueAt).getTime() < Date.now();
      const day = toMoscowInput(task.dueAt).slice(0, 10);
      const today = toMoscowInput(new Date().toISOString()).slice(0, 10);
      if (bucket === "today") return day === today;
      if (bucket === "upcoming") return day > today;
      return true;
    }), params); break;
    default: {
      const lead = leads.find((item) => url.pathname === `/leads/${item._id}`);
      const task = tasks.find((item) => url.pathname === `/tasks/${item._id}`);
      const company = companies.find((item) => url.pathname === `/companies/${item._id}`);
      const deal = deals.find((item) => url.pathname === `/deals/${item._id}`);
      const address = addresses.find((item) => url.pathname === `/adresses/${item._id}`);
      if (lead || task || company || deal || address) result = lead || task || company || deal || address;
      else if (url.pathname.endsWith("/activities")) result = paginated([], params);
      else throw new Error(`Нет тестового ответа: ${url.pathname}`);
    }
  }
  return structuredClone(result) as T;
}
export async function securePatchData<T>(input: string, data: object): Promise<T> {
  const path = new URL(input).pathname;
  const id = path.split("/").pop();
  if (path.startsWith("/companies/")) {
    const index = companies.findIndex((company) => company._id === id);
    if (index < 0) throw new Error("Компания не найдена");
    companies[index] = { ...companies[index], ...data };
    return structuredClone(companies[index]) as T;
  }
  if (path.startsWith("/deals/")) {
    const index = deals.findIndex((deal) => deal._id === id);
    if (index < 0) throw new Error("Сделка не найдена");
    deals[index] = { ...deals[index], ...data };
    return structuredClone(deals[index]) as T;
  }
  const index = tasks.findIndex((task) => task._id === id);
  if (index < 0) throw new Error("Эта операция не настроена в тестовом стенде");
  tasks = tasks.map((task, i) => i === index ? { ...task, ...data } : task);
  return structuredClone(tasks[index]) as T;
}
export async function securePostData<T>(input: string, data: object): Promise<T> {
  const pathname = new URL(input).pathname;
  if (pathname === "/deals/preview") return structuredClone({ taxAmount: 0, companyProfit: 30000, managerProfit: 3000, amountPurchaseTotal: 145000, amountSalesTotal: 190000, actualCompanyProfit: 6000, actualAmountSalesTotal: 76000, actualAmountPurchaseTotal: 58000, totalDeliveredQuantity: 40, ndsPercent: 0, managerShare: 0.1, totalAmount: 190000 }) as T;
  const item = { _id: crypto.randomUUID(), ownerId: "me", ...data };
  if (pathname === "/tasks") tasks.push({ status: "open", ...item } as TaskDto);
  else if (pathname === "/leads") leads.push({ status: "new", stageId: "new", ...item } as LeadDto);
  else throw new Error("Эта операция не настроена в тестовом стенде");
  return structuredClone(item) as T;
}
export async function secureDeleteData(): Promise<void> { throw new Error("Удаление в тестовом стенде отключено"); }
export const getData = secureGetData;
export const postData = securePostData;
export const securePostFormData = securePostData;
export function setUnauthorizedHandler() {}
