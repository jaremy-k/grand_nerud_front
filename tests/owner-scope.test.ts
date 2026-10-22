import { describe, expect, it } from "vitest";
import { crmPage, crmScopeLink, resolveOwnerScope, updateCrmParams } from "@/features/crm/owner-scope";
import type { UserDto } from "@definitions/dto";

const user: UserDto = { id: "me", email: "me@example.com", admin: false, manager: false };

describe("Область CRM и ссылки", () => {
  it.each(["", "scope=team", "ownerId=someone-else", "scope=team&ownerId=someone-else"])("обычный сотрудник всегда запрашивает собственные записи: %s", (query) => {
    expect(resolveOwnerScope(user, new URLSearchParams(query))).toMatchObject({ ownerId: "me", value: "mine", elevated: false, error: null });
  });
  it.each([{ admin: true }, { manager: true }])("руководитель по умолчанию видит свои, явно выбирает команду или сотрудника: %j", (role) => {
    const leader = { ...user, ...role };
    expect(resolveOwnerScope(leader, new URLSearchParams()).ownerId).toBe("me");
    expect(resolveOwnerScope(leader, new URLSearchParams("scope=team")).value).toBe("team");
    expect(resolveOwnerScope(leader, new URLSearchParams("scope=team")).ownerId).toBeUndefined();
    expect(resolveOwnerScope(leader, new URLSearchParams("ownerId=employee"))).toMatchObject({ ownerId: "employee", value: "owner:employee" });
  });
  it("использует _id и не расширяет выборку при отсутствии ID", () => {
    expect(resolveOwnerScope({ ...user, id: undefined, _id: "mongo-id" }, new URLSearchParams()).ownerId).toBe("mongo-id");
    expect(resolveOwnerScope({ ...user, id: undefined }, new URLSearchParams()).error).toBeTruthy();
  });
  it("ссылки счётчиков сохраняют сотрудника, состояние и календарную корзину", () => {
    const scope = resolveOwnerScope({ ...user, manager: true }, new URLSearchParams("ownerId=employee"));
    const leads = new URL(crmScopeLink("/leads", scope, { status: "new" }), "http://localhost");
    expect(Object.fromEntries(leads.searchParams)).toEqual({ ownerId: "employee", status: "new" });
    expect(resolveOwnerScope({ ...user, manager: true }, leads.searchParams).ownerId).toBe(scope.ownerId);
    const team = resolveOwnerScope({ ...user, admin: true }, new URLSearchParams("scope=team"));
    expect(crmScopeLink("/tasks", team, { bucket: "overdue" })).toBe("/tasks?bucket=overdue&scope=team");
  });
  it("сброс фильтров сохраняет контекст и удаляет старую страницу", () => {
    const next = updateCrmParams(new URLSearchParams("scope=team&companyId=company&page=5&leadId=lead"), { companyId: undefined, bucket: "today" });
    expect(Object.fromEntries(next)).toEqual({ scope: "team", leadId: "lead", bucket: "today" });
  });
  it.each(["", "0", "-1", "1.5", "no-page", "Infinity"])("отклоняет некорректную страницу %j", (page) => {
    expect(crmPage(new URLSearchParams({ page }))).toBe(1);
  });
  it("читает корректную страницу из URL", () => {
    expect(crmPage(new URLSearchParams("page=4"))).toBe(4);
  });
});
