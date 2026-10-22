import type LeadDto from "@/definitions/dto/lead";
import type TaskDto from "@/definitions/dto/task";
import type { CompanyDto, UserDto } from "@definitions/dto";
import type { PaginatedResult } from "@/definitions/dto/lead";
import { toMoscowInput } from "@/features/crm/utils";

export const fixtureUser: UserDto = { id: "me", _id: "me", email: "maria@example.com", name: "Мария", lastName: "Соколова", manager: new URLSearchParams(location.search).get("role") !== "employee", admin: false };
const owners = [fixtureUser, { ...fixtureUser, id: "employee", _id: "employee", name: "Алексей", lastName: "Иванов", manager: false }];
const companies: CompanyDto[] = [
  { _id: "company", name: "ООО Стройпроект", inn: "7707083893", roles: ["customer"], contactPersons: [], contacts: [] },
  { _id: "quarry", name: "Северный карьер", inn: "7707083894", roles: ["provider"], contactPersons: [], contacts: [] },
];
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
  { _id: "call", title: "Согласовать объём и стоимость доставки песка", ownerId: "me", companyId: "company", company: companies[0], leadId: "lead", lead: leads[0], dueAt: new Date(now - 2 * 3_600_000).toISOString(), type: "call", status: "open" },
  { _id: "email", title: "Отправить коммерческое предложение заказчику", ownerId: "me", companyId: "company", company: companies[0], dueAt: new Date(now + 3_600_000).toISOString(), type: "email", status: "open" },
  { _id: "meeting", title: "Встреча на объекте: условия подъезда и разгрузки", ownerId: "me", dueAt: new Date(now + 86_400_000).toISOString(), type: "meeting", status: "open" },
  { _id: "other-call", title: "Уточнить график отгрузки щебня на следующую неделю", ownerId: "employee", leadId: "lead-other", lead: leads[1], dueAt: new Date(now - 3_600_000).toISOString(), type: "call", status: "open" },
];

function paginated<T>(items: T[], params: URLSearchParams) {
  const page = Number(params.get("page") || 1);
  const pageSize = Number(params.get("pageSize") || 25);
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
    case "/companies": result = companies; break;
    case "/materials": result = [{ _id: "sand", name: "Песок" }]; break;
    case "/lead-stages": result = stages; break;
    case "/stages": result = [{ _id: "deal-new", name: "Новая сделка", order: 0 }]; break;
    case "/adresses": result = []; break;
    case "/deals": result = paginated([], params); break;
    case "/leads": result = paginated(leads.filter((lead) => matches(lead)
      && (!params.get("status") || lead.status === params.get("status"))
      && (!params.get("stageId") || lead.stageId === params.get("stageId"))
      && (!params.get("priority") || lead.priority === params.get("priority"))
      && (!params.get("search") || lead.title.toLowerCase().includes(params.get("search")!.toLowerCase()))), params); break;
    case "/tasks": result = paginated(tasks.filter((task) => {
      if (!matches(task) || (params.get("type") && task.type !== params.get("type"))) return false;
      if (params.get("leadId") && task.leadId !== params.get("leadId")) return false;
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
      if (lead || task) result = lead || task;
      else if (url.pathname.endsWith("/activities")) result = paginated([], params);
      else throw new Error(`Нет тестового ответа: ${url.pathname}`);
    }
  }
  return structuredClone(result) as T;
}
export async function securePatchData<T>(input: string, data: object): Promise<T> {
  const id = new URL(input).pathname.split("/").pop();
  const index = tasks.findIndex((task) => task._id === id);
  if (index < 0) throw new Error("Эта операция не настроена в тестовом стенде");
  tasks = tasks.map((task, i) => i === index ? { ...task, ...data } : task);
  return structuredClone(tasks[index]) as T;
}
export async function securePostData<T>(input: string, data: object): Promise<T> {
  const pathname = new URL(input).pathname;
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
