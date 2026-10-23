import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { EditingCompanyModal } from "@/components/inputs/company-input/editing-modal";
import CompanyContactDetails from "@/components/inputs/company-input/company-contact-details";
import { companiesService } from "@/services";
import { normalizeContactPersons, personEmails, personPhones } from "@/lib/company-contacts";
import type { CompanyDto } from "@definitions/dto";

vi.mock("@/services", () => ({ companiesService: { updateCompany: vi.fn() } }));
vi.mock("@/components/inputs/company-input/addresses-section", () => ({ default: () => null }));
vi.mock("@/components/inputs/company-input/company-materials-section", () => ({ default: () => null }));
const company: CompanyDto = { _id: "company", name: "Компания", inn: "7707083893", roles: ["provider"], contacts: [{ Директор: "ФНС" }],
  phones: ["111", "222"], emails: ["one@company.example", "two@company.example"],
  contactPersons: [{ name: "Иван", phone: "333", phones: ["444", "333"], email: "old@person.example", emails: ["new@person.example"] }] };
const open = () => render(<EditingCompanyModal open company={company} onClose={vi.fn()} onUpdate={vi.fn()} />);
beforeEach(() => { vi.mocked(companiesService.updateCompany).mockResolvedValue(company); });
afterEach(cleanup);

it("показывает все телефоны и email компании и человека, включая оба формата", () => {
  open();
  for (const value of ["111", "222", "333", "444", "one@company.example", "two@company.example", "old@person.example", "new@person.example"]) expect(screen.getByDisplayValue(value)).toBeTruthy();
  expect(screen.getAllByDisplayValue("333")).toHaveLength(1);
  expect(screen.queryByRole("button", { name: /^Ещё/ })).toBeNull();
});
it("правка названия не теряет массивы контактов и не отправляет contacts ФНС", async () => {
  open();
  fireEvent.change(screen.getByDisplayValue("Компания"), { target: { value: "Новое название" } });
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Сохранить" })));
  const payload = vi.mocked(companiesService.updateCompany).mock.calls[0][1];
  expect(payload.phones).toEqual(["111", "222"]);
  expect(payload.emails).toEqual(["one@company.example", "two@company.example"]);
  expect(payload.contactPersons?.[0].phones).toEqual(["333", "444"]);
  expect(payload.contactPersons?.[0].emails).toEqual(["old@person.example", "new@person.example"]);
  expect(payload).not.toHaveProperty("contacts");
});
it("позволяет добавить телефон без скрытия пустой строки редактора", () => {
  open();
  fireEvent.click(screen.getByRole("button", { name: "Добавить телефон: Телефоны компании" }));
  const input = screen.getByRole("textbox", { name: "Телефоны компании 3" });
  fireEvent.change(input, { target: { value: "555" } });
  expect(screen.getByDisplayValue("555")).toBeTruthy();
});
it("очищает все контакты массивами и не восстанавливает старые одиночные поля", async () => {
  open();
  for (const label of ["Телефоны компании", "Телефоны контактного лица 1"]) {
    fireEvent.click(screen.getByRole("button", { name: `Удалить телефон: ${label} 1` }));
    fireEvent.click(screen.getByRole("button", { name: `Удалить телефон: ${label} 1` }));
  }
  for (const label of ["Email компании", "Email контактного лица 1"]) {
    fireEvent.click(screen.getByRole("button", { name: `Удалить email: ${label} 1` }));
    fireEvent.click(screen.getByRole("button", { name: `Удалить email: ${label} 1` }));
  }
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Сохранить" })));
  const payload = vi.mocked(companiesService.updateCompany).mock.calls[0][1];
  expect(payload.phones).toEqual([]);
  expect(payload.emails).toEqual([]);
  expect(normalizeContactPersons(payload.contactPersons!)[0]).toMatchObject({ phones: [], emails: [] });
  expect(normalizeContactPersons(payload.contactPersons!)[0].phone).toBeUndefined();
});
it("проверяет каждый email, а не только первый", async () => {
  open();
  fireEvent.change(screen.getByDisplayValue("new@person.example"), { target: { value: "invalid" } });
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Сохранить" })));
  expect(companiesService.updateCompany).not.toHaveBeenCalled();
  expect(screen.getByText(/корректный email/)).toBeTruthy();
});
it("проверяет email уровня компании до PATCH", async () => {
  open();
  fireEvent.change(screen.getByDisplayValue("two@company.example"), { target: { value: "invalid" } });
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Сохранить" })));
  expect(companiesService.updateCompany).not.toHaveBeenCalled();
  expect(screen.getByText("Проверьте email компании")).toBeTruthy();
});
it("в карточке тоже отображает несколько контактов каждого человека", () => {
  render(<CompanyContactDetails company={company} />);
  for (const value of ["333", "444", "old@person.example", "new@person.example"]) expect(screen.getByRole("link", { name: value })).toBeTruthy();
});
it("нормализует дубли без потери дополнительных значений", () => {
  expect(personPhones(company.contactPersons[0])).toEqual(["333", "444"]);
  expect(personEmails({ name: "Иван", email: "ONE@example.com", emails: ["one@example.com", "two@example.com"] })).toEqual(["ONE@example.com", "two@example.com"]);
  expect(normalizeContactPersons([{ name: " Иван ", phones: ["", "333", "444"], emails: [] }])[0]).toMatchObject({ name: "Иван", phone: "333", phones: ["333", "444"], emails: [] });
});
