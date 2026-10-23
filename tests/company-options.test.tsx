import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CompanyCombobox } from "@/components/inputs/company-input/company-combobox";
import { companiesService } from "@/services";
import type { CompanyDto } from "@definitions/dto";

vi.mock("@/services", () => ({ companiesService: { getCompaniesPage: vi.fn(), getCompany: vi.fn() } }));
vi.mock("@/components/inputs/company-input/creating-modal", () => ({ CreatingModal: () => null }));
vi.mock("@/components/inputs/company-input/editing-modal", () => ({ EditingCompanyModal: () => null }));
const company = (id: string): CompanyDto => ({ _id: id, name: `Компания ${id}`, roles: ["provider"], contacts: [], contactPersons: [] });
const page = (items: CompanyDto[], current = 1, total = items.length) => ({ items, page: current, pageSize: 15, total, totalPages: Math.ceil(total / 15), hasNext: current * 15 < total, hasPrev: current > 1 });
beforeEach(() => {
  vi.mocked(companiesService.getCompaniesPage).mockReset().mockResolvedValue(page([company("1")]));
  vi.mocked(companiesService.getCompany).mockReset().mockImplementation(async (id) => company(id));
});
afterEach(cleanup);
const open = () => fireEvent.click(screen.getByRole("combobox"));

it("загружает выбранную компанию отдельно от первой страницы", async () => {
  render(<CompanyCombobox value="900" role="provider" />);
  await screen.findByRole("combobox", { name: "Компания 900" });
  expect(companiesService.getCompany).toHaveBeenCalledWith("900", expect.objectContaining({ signal: expect.any(AbortSignal) }));
  expect(companiesService.getCompaniesPage).not.toHaveBeenCalled();
  open();
  await screen.findByRole("button", { name: "Компания 1" });
  expect(companiesService.getCompaniesPage).toHaveBeenCalledWith({ page: 1, pageSize: 15, role: "provider", search: "", sortBy: "recent" }, expect.anything());
});

it("при прокрутке добавляет страницу без дублей и сохраняет предыдущие названия", async () => {
  vi.mocked(companiesService.getCompaniesPage).mockResolvedValueOnce(page([company("1"), company("2")], 1, 31))
    .mockResolvedValueOnce(page([company("2"), company("3")], 2, 31));
  const select = vi.fn();
  render(<CompanyCombobox role="provider" onChange={select} />);
  open();
  await screen.findByRole("button", { name: "Компания 1" });
  const list = screen.getByLabelText("Найденные компании");
  fireEvent.scroll(list);
  fireEvent.scroll(list);
  await screen.findByRole("button", { name: "Компания 3" });
  expect(screen.getByRole("button", { name: "Компания 1" })).toBeTruthy();
  expect(screen.getAllByRole("button", { name: "Компания 2" })).toHaveLength(1);
  expect(companiesService.getCompaniesPage).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByRole("button", { name: "Компания 3" }));
  expect(select).toHaveBeenCalledWith("3");
});

it("поиск сбрасывает страницы и сохраняет фокус поля", async () => {
  vi.mocked(companiesService.getCompaniesPage).mockResolvedValueOnce(page([company("1")], 1, 31))
    .mockResolvedValueOnce(page([company("2")], 2, 31)).mockResolvedValueOnce(page([], 1, 0));
  render(<CompanyCombobox role="provider" />);
  open();
  await screen.findByRole("button", { name: "Компания 1" });
  fireEvent.click(screen.getByRole("button", { name: "Ещё" }));
  await screen.findByRole("button", { name: "Компания 2" });
  const input = screen.getByRole("textbox", { name: "Поиск компаний" });
  input.focus();
  fireEvent.change(input, { target: { value: "Несуществующая" } });
  await screen.findByText("Не найдено");
  expect(document.activeElement).toBe(input);
  expect(screen.queryByRole("button", { name: "Компания 1" })).toBeNull();
  expect(screen.getAllByRole("button", { name: "Добавить компанию" })).toHaveLength(2);
  expect(companiesService.getCompaniesPage).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, search: "Несуществующая" }), expect.anything());
});

it("не выдаёт ошибку за пустой результат и повторяет запрос", async () => {
  vi.mocked(companiesService.getCompaniesPage).mockRejectedValueOnce(new Error("Сервер недоступен")).mockResolvedValueOnce(page([company("1")]));
  render(<CompanyCombobox allowCreate={false} />);
  open();
  await screen.findByText("Сервер недоступен");
  expect(screen.queryByText("Не найдено")).toBeNull();
  await act(async () => fireEvent.click(screen.getByRole("button", { name: /Повторить/ })));
  await waitFor(() => expect(screen.getByRole("button", { name: "Компания 1" })).toBeTruthy());
});
