import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AddressesSection from "@/components/inputs/company-input/addresses-section";
import AddressSelect from "@/components/inputs/company-input/address-select";
import CompanyMaterialsSection from "@/components/inputs/company-input/company-materials-section";
import { addressesService, companyMaterialsService } from "@/services";

vi.mock("@/contexts/auth-context", () => ({ default: () => ({ user: { admin: true } }) }));
vi.mock("@/services", () => ({
  addressesService: { getAddresses: vi.fn(), createAddress: vi.fn(), updateAddress: vi.fn() },
  companyMaterialsService: { getCompanyMaterials: vi.fn(), createCompanyMaterial: vi.fn(), updateCompanyMaterial: vi.fn() },
}));
vi.mock("@/components/inputs/material-input/material-select", () => ({
  MaterialSelect: ({ value, onChange }: { value: string; onChange: (value: string) => void }) =>
    <input aria-label="Материал" value={value} onChange={(event) => onChange(event.target.value)} />,
}));

beforeEach(() => {
  vi.mocked(addressesService.getAddresses).mockResolvedValue([]);
  vi.mocked(companyMaterialsService.getCompanyMaterials).mockResolvedValue([]);
});
afterEach(cleanup);

describe("Формы компаний используют валидацию до запроса", () => {
  it("пустые координаты в карточке компании не отправляются как нули", async () => {
    await act(async () => render(<AddressesSection companyId="company" />));
    fireEvent.click(screen.getByRole("button", { name: "Добавить" }));
    fireEvent.change(screen.getByLabelText("Адрес", { exact: true }), { target: { value: "Москва" } });
    fireEvent.click(screen.getByRole("button", { name: "Сохранить адрес" }));
    expect(addressesService.createAddress).not.toHaveBeenCalled();
    expect(screen.getByText(/Укажите долготу/)).toBeTruthy();
  });
  it("пустые координаты при добавлении адреса из сделки тоже отклоняются", async () => {
    await act(async () => render(<AddressSelect companyId="company" value="" onChange={vi.fn()} />));
    fireEvent.click(screen.getByRole("button", { name: "Добавить адрес" }));
    fireEvent.change(screen.getByLabelText("Адрес", { exact: true }), { target: { value: "Москва" } });
    fireEvent.click(screen.getByRole("button", { name: "Добавить" }));
    expect(addressesService.createAddress).not.toHaveBeenCalled();
    expect(screen.getByText(/Укажите долготу/)).toBeTruthy();
  });
  it("пустая цена не создаёт бесплатную позицию прайс-листа", async () => {
    await act(async () => render(<CompanyMaterialsSection companyId="company" />));
    fireEvent.click(screen.getByRole("button", { name: "Добавить" }));
    fireEvent.change(screen.getByLabelText("Материал", { exact: true }), { target: { value: "sand" } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Сохранить" })));
    expect(companyMaterialsService.createCompanyMaterial).not.toHaveBeenCalled();
    expect(screen.getByText(/неотрицательную цену/)).toBeTruthy();
  });
  it("очистка комментария отправляет пустую строку в PATCH", async () => {
    vi.mocked(companyMaterialsService.getCompanyMaterials).mockResolvedValue([{
      _id: "price", companyId: "company", materialId: "sand", price: 1200, unit: "т", comment: "Устаревший комментарий",
    }]);
    await act(async () => render(<CompanyMaterialsSection companyId="company" />));
    fireEvent.click(screen.getByRole("button", { name: "Редактировать позицию" }));
    fireEvent.change(screen.getByLabelText("Комментарий"), { target: { value: "" } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Сохранить" })));
    expect(companyMaterialsService.updateCompanyMaterial).toHaveBeenCalledWith("price", expect.objectContaining({ comment: "", price: 1200 }));
  });
});
