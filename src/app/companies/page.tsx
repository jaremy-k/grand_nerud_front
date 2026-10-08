"use client";

import { Page } from "@/components/blocks";
import { CreatingModal } from "@/components/inputs/company-input/creating-modal";
import { EditingCompanyModal } from "@/components/inputs/company-input/editing-modal";
import { ImportCompaniesModal } from "@/components/inputs/company-input/import-modal";
import CompanyContactDetails from "@/components/inputs/company-input/company-contact-details";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOSCOW_ADMINISTRATIVE_DISTRICTS } from "@/config/addresses";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINN } from "@/lib/formatters";
import { addressesService, companiesService, materialsService } from "@/services";
import {
  AddressDto,
  CompanyDto,
  CompanyMaterialDto,
  CompanyRole,
  MaterialDto,
} from "@definitions/dto";
import {
  ArrowDownUpIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const priceFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2,
});

function getComparablePrice(
  company: CompanyDto,
  materialId: string
): number | null {
  const prices = (company.materialsWithPrices ?? [])
    .filter((item) => !materialId || item.materialId === materialId)
    .map((item) => item.price);
  return prices.length ? Math.min(...prices) : null;
}

export default function CompaniesPage({ role }: { role: CompanyRole }) {
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [materials, setMaterials] = useState<MaterialDto[]>([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [administrativeDistrict, setAdministrativeDistrict] = useState("");
  const [district, setDistrict] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceSort, setPriceSort] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyDto | null>(null);

  const title = role === "provider" ? "Исполнители" : "Заказчики";

  useEffect(() => {
    if (role !== "provider") return;
    materialsService
      .getMaterials()
      .then((items) => setMaterials(items.filter((item) => !item.is_deleted)))
      .catch(() => setMaterials([]));
  }, [role]);

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      companiesService.getCompanies({
        role,
        includeDetails: true,
        city: city.trim() || undefined,
        administrativeDistrict: administrativeDistrict || undefined,
        district: district.trim() || undefined,
      }),
      addressesService.getAddresses(),
    ])
      .then(([companyData, addressData]) => {
        setCompanies(companyData);
        setAddresses(addressData);
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Не удалось загрузить компании"
        )
      )
      .finally(() => setLoading(false));
  }, [role, city, administrativeDistrict, district]);

  const filteredCompanies = useMemo(() => {
    const value = search.trim().toLowerCase();
    const ceiling = Number(maxPrice.replace(",", "."));
    const hasCeiling = maxPrice.trim() !== "" && Number.isFinite(ceiling);

    const filtered = companies.filter((company) => {
      const matchesSearch =
        !value ||
        company.name.toLowerCase().includes(value) ||
        company.abbreviatedName?.toLowerCase().includes(value) ||
        company.inn?.includes(value) ||
        company.kpp?.includes(value) ||
        company.phones?.some((item) => item.toLowerCase().includes(value)) ||
        company.emails?.some((item) => item.toLowerCase().includes(value)) ||
        company.websites?.some((item) => item.toLowerCase().includes(value)) ||
        company.segments?.some((item) => item.toLowerCase().includes(value)) ||
        company.source?.toLowerCase().includes(value) ||
        company.contactPersons?.some((person) =>
          [person.name, person.inn, person.position, person.phone, person.email].some(
            (field) => field?.toLowerCase().includes(value)
          )
        );
      if (!matchesSearch) return false;
      if (role !== "provider") return true;

      const comparablePrice = getComparablePrice(company, materialId);
      if (materialId && comparablePrice === null) return false;
      if (hasCeiling && (comparablePrice === null || comparablePrice > ceiling)) {
        return false;
      }
      return true;
    });

    if (role !== "provider" || priceSort === "default") return filtered;
    return [...filtered].sort((left, right) => {
      const leftPrice = getComparablePrice(left, materialId) ?? Infinity;
      const rightPrice = getComparablePrice(right, materialId) ?? Infinity;
      return priceSort === "asc"
        ? leftPrice - rightPrice
        : rightPrice - leftPrice;
    });
  }, [companies, materialId, maxPrice, priceSort, role, search]);

  const addressesByCompany = useMemo(() => {
    const grouped = new Map<string, AddressDto[]>();
    addresses.forEach((address) => {
      grouped.set(address.companyId, [
        ...(grouped.get(address.companyId) ?? []),
        address,
      ]);
    });
    return grouped;
  }, [addresses]);

  const availableDistricts = useMemo(
    () =>
      [...new Set(addresses.map((address) => address.district).filter(Boolean))]
        .sort((left, right) => left!.localeCompare(right!, "ru")) as string[],
    [addresses]
  );

  const resetProviderFilters = () => {
    setCity("");
    setAdministrativeDistrict("");
    setDistrict("");
    setMaterialId("");
    setMaxPrice("");
    setPriceSort("default");
  };

  const visiblePrices = (company: CompanyDto): CompanyMaterialDto[] => {
    const prices = company.materialsWithPrices ?? [];
    if (!materialId) return prices;
    return prices.filter((item) => item.materialId === materialId);
  };

  return (
    <Page
      breadcrumbLinks={[
        {
          label: title,
          href: role === "provider" ? "/providers" : "/customers",
        },
      ]}
      headerActions={
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>
            <UploadIcon />
            Импорт
          </Button>
          <Button size="sm" onClick={() => setCreating(true)}>
            <PlusIcon />
            Добавить
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-4">
        <div
          className={
            role === "provider"
              ? "grid gap-3 border-y py-4 lg:grid-cols-6"
              : "grid gap-3 lg:grid-cols-4"
          }
        >
          <div className="grid gap-1.5">
            <Label htmlFor="company-search">Поиск</Label>
            <Input
              id="company-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Название, ИНН или КПП"
            />
          </div>
          {role !== "provider" && (
            <div className="grid gap-1.5">
              <Label htmlFor="company-city-filter">Город</Label>
              <Input
                id="company-city-filter"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Москва"
              />
            </div>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="company-administrative-district-filter">Округ</Label>
            <Select
              value={administrativeDistrict || "all"}
              onValueChange={(value) =>
                setAdministrativeDistrict(value === "all" ? "" : value)
              }
            >
              <SelectTrigger id="company-administrative-district-filter">
                <SelectValue placeholder="Все округа" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все округа</SelectItem>
                {MOSCOW_ADMINISTRATIVE_DISTRICTS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="company-district-filter">Район</Label>
            {role === "provider" ? (
              <Select
                value={district || "all"}
                onValueChange={(value) =>
                  setDistrict(value === "all" ? "" : value)
                }
              >
                <SelectTrigger id="company-district-filter">
                  <SelectValue placeholder="Все районы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все районы</SelectItem>
                  {availableDistricts.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="company-district-filter"
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
                placeholder="Даниловский"
              />
            )}
          </div>

          {role === "provider" && (
            <>
              <div className="grid gap-1.5">
                <Label htmlFor="company-material-filter">Материал</Label>
                <Select
                  value={materialId || "all"}
                  onValueChange={(value) =>
                    setMaterialId(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger id="company-material-filter">
                    <SelectValue placeholder="Все материалы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все материалы</SelectItem>
                    {materials.map((material) => (
                      <SelectItem key={material._id} value={material._id}>
                        {material.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="company-max-price">Цена до, руб.</Label>
                <Input
                  id="company-max-price"
                  inputMode="decimal"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="Например, 1500"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="company-price-sort">Сортировка</Label>
                <Select value={priceSort} onValueChange={setPriceSort}>
                  <SelectTrigger id="company-price-sort">
                    <ArrowDownUpIcon />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">По умолчанию</SelectItem>
                    <SelectItem value="asc">Сначала дешевле</SelectItem>
                    <SelectItem value="desc">Сначала дороже</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        {role === "provider" && (
          <div className="flex min-h-8 items-center justify-between gap-3 text-sm">
            <p className="text-muted-foreground">
              Найдено исполнителей: {filteredCompanies.length}
            </p>
            {(city ||
              administrativeDistrict ||
              district ||
              materialId ||
              maxPrice ||
              priceSort !== "default") && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={resetProviderFilters}
              >
                <XIcon />
                Сбросить фильтры
              </Button>
            )}
          </div>
        )}

        {loading && (
          <p className="py-10 text-center text-muted-foreground">Загрузка...</p>
        )}
        {error && <p className="py-10 text-center text-destructive">{error}</p>}
        {!loading && !error && (
          <Table>
            <TableHeader>
              <TableRow>
                {role === "provider" ? (
                  <>
                    <TableHead className="w-[22%]">Исполнитель</TableHead>
                    <TableHead className="w-[26%]">География</TableHead>
                    <TableHead className="w-[25%]">Цены</TableHead>
                    <TableHead>Контакты</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Компания</TableHead>
                    <TableHead>ИНН</TableHead>
                    <TableHead>КПП</TableHead>
                    <TableHead>Контактные лица и связь</TableHead>
                    <TableHead>Источник / сегменты</TableHead>
                    <TableHead className="text-muted-foreground/70">
                      Контакт карточки
                    </TableHead>
                    <TableHead>Адреса</TableHead>
                    <TableHead>Прайс-лист</TableHead>
                    <TableHead>Комментарий</TableHead>
                  </>
                )}
                <TableHead className="w-12">
                  <span className="sr-only">Действия</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company._id}>
                  {role === "provider" ? (
                    <>
                      <TableCell className="align-top">
                        <p className="font-medium">{company.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {company.inn ? `ИНН ${formatINN(company.inn)}` : "ИНН не указан"}
                          {company.kpp ? ` · КПП ${company.kpp}` : ""}
                        </p>
                        {company.comment && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {company.comment}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        {(addressesByCompany.get(company._id) ?? []).length ? (
                          <div className="grid gap-2">
                            {(addressesByCompany.get(company._id) ?? []).map(
                              (address) => (
                                <div key={address._id} className="flex gap-2 text-xs">
                                  <MapPinIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">
                                      {[address.administrativeDistrict, address.district]
                                        .filter(Boolean)
                                        .join(" · ") || "Район не указан"}
                                    </p>
                                    <p className="text-muted-foreground">
                                      {address.adressDetail?.address || "Адрес не указан"}
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Адреса не добавлены
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        {visiblePrices(company).length ? (
                          <div className="grid gap-2">
                            {visiblePrices(company).map((item) => (
                              <div
                                key={item._id}
                                className="flex items-baseline justify-between gap-3 border-b border-border/50 pb-1.5 last:border-0 last:pb-0"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">
                                    {item.material?.name || "Материал"}
                                  </p>
                                  {item.comment && (
                                    <p className="truncate text-xs text-muted-foreground">
                                      {item.comment}
                                    </p>
                                  )}
                                </div>
                                <p className="shrink-0 text-sm font-semibold tabular-nums">
                                  {priceFormatter.format(item.price)} руб./{item.unit}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Цены не добавлены
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="min-w-64 align-top">
                        <CompanyContactDetails company={company} />
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>
                        {company.inn ? formatINN(company.inn) : "—"}
                      </TableCell>
                      <TableCell>{company.kpp || "—"}</TableCell>
                      <TableCell className="min-w-64 align-top">
                        <CompanyContactDetails company={company} />
                      </TableCell>
                      <TableCell>
                        {[company.source, ...(company.segments ?? [])]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {company.contacts?.length
                          ? `${company.contacts.length} зап.`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {(addressesByCompany.get(company._id) ?? [])
                          .map((address) => address.adressDetail?.address)
                          .filter(Boolean)
                          .join("; ") || "—"}
                      </TableCell>
                      <TableCell className="min-w-52 align-top">
                        {company.materialsWithPrices?.length ? (
                          <div className="grid gap-1">
                            {company.materialsWithPrices.map((item) => (
                              <div key={item._id} className="text-xs">
                                <span className="font-medium">
                                  {item.material?.name || "Материал"}
                                </span>
                                <span className="text-muted-foreground">
                                  {` · ${priceFormatter.format(item.price)} руб. / ${item.unit}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{company.comment || "—"}</TableCell>
                    </>
                  )}
                  <TableCell>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Редактировать ${company.name}`}
                      onClick={() => setEditingCompany(company)}
                    >
                      <PencilIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCompanies.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={role === "provider" ? 5 : 10}
                    className="h-32 text-center text-muted-foreground"
                  >
                    Компании не найдены
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <CreatingModal
        open={creating}
        initialRole={role}
        onClose={() => setCreating(false)}
        onCancel={() => setCreating(false)}
        onCreate={(company) =>
          setCompanies((current) =>
            !company.roles?.length || company.roles.includes(role)
              ? [...current, company]
              : current
          )
        }
      />
      <ImportCompaniesModal
        open={importOpen}
        role={role}
        onClose={() => setImportOpen(false)}
        onImported={() =>
          companiesService
            .getCompanies({ role, includeDetails: true })
            .then(setCompanies)
            .catch(() => {})
        }
      />
      <EditingCompanyModal
        company={editingCompany}
        open={editingCompany !== null}
        onClose={() => setEditingCompany(null)}
        onUpdate={(updatedCompany) =>
          setCompanies((current) => {
            const belongsToSection =
              !updatedCompany.roles?.length ||
              updatedCompany.roles.includes(role);
            if (!belongsToSection) {
              return current.filter((item) => item._id !== updatedCompany._id);
            }
            return current.map((item) =>
              item._id === updatedCompany._id
                ? { ...item, ...updatedCompany }
                : item
            );
          })
        }
      />
    </Page>
  );
}
