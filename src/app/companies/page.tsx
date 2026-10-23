"use client";

import { Page, Pagination } from "@/components/blocks";
import { CreatingModal } from "@/components/inputs/company-input/creating-modal";
import { EditingCompanyModal } from "@/components/inputs/company-input/editing-modal";
import { ImportCompaniesModal } from "@/components/inputs/company-input/import-modal";
import CompanyContactDetails from "@/components/inputs/company-input/company-contact-details";
import MaterialSearchFilter from "@/components/inputs/material-input/material-search-filter";
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
import { getMaterialUnits, normalizeMaterialUnit } from "@/lib/company-materials";
import { parseDecimalInput } from "@/lib/number-input";
import { companiesService, materialsService } from "@/services";
import type { CompanyPageFilters } from "@/services/companies";
import { useLatestRequest } from "@/hooks/use-latest-request";
import RequestError from "@/features/crm/request-error";
import {
  AddressDto,
  CompanyDto,
  CompanyMaterialDto,
  CompanyRole,
  MaterialDto,
} from "@definitions/dto";
import {
  ArrowDownUpIcon,
  ArrowUpRightIcon,
  ClipboardListIcon,
  TargetIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FilePlus2Icon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const priceFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2,
});
const EMPTY_COMPANIES: CompanyDto[] = [];
const loadCompanyPage = (query: { filters: CompanyPageFilters; page: number; invalid: boolean }, signal: AbortSignal) => query.invalid
  ? Promise.reject(new Error("Укажите корректную неотрицательную цену"))
  : companiesService.getCompaniesPage({ ...query.filters, page: query.page, pageSize: 25 }, { signal });

export default function CompaniesPage({ role }: { role: CompanyRole }) {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<MaterialDto[]>([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [administrativeDistrict, setAdministrativeDistrict] = useState("");
  const [district, setDistrict] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [priceUnit, setPriceUnit] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceSort, setPriceSort] = useState("default");
  const [creating, setCreating] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyDto | null>(null);
  const [expandedCompanyIds, setExpandedCompanyIds] = useState<Set<string>>(
    new Set()
  );

  const title = role === "provider" ? "Исполнители" : "Заказчики";
  const selectedMaterial = materials.find((item) => item._id === materialId);
  const selectedPriceUnit = priceUnit;
  const canComparePrices = Boolean(materialId && selectedPriceUnit);
  const ceiling = canComparePrices ? parseDecimalInput(maxPrice) : null;
  const invalidPrice = Boolean(canComparePrices && maxPrice.trim() && (ceiling == null || ceiling < 0));
  const filters = useMemo<CompanyPageFilters>(() => ({ role, includeDetails: true, search: search.trim() || undefined,
    city: city.trim() || undefined, administrativeDistrict: administrativeDistrict || undefined, district: district.trim() || undefined,
    materialId: role === "provider" ? materialId || undefined : undefined,
    priceUnit: role === "provider" && materialId ? priceUnit || undefined : undefined,
    maxPrice: role === "provider" && canComparePrices && ceiling != null ? ceiling : undefined,
    priceSort: role === "provider" && canComparePrices && (priceSort === "asc" || priceSort === "desc") ? priceSort : "default",
  }), [role, search, city, administrativeDistrict, district, materialId, priceUnit, canComparePrices, ceiling, priceSort]);
  const [pagination, setPagination] = useState({ filters, page: 1 });
  const page = pagination.filters === filters ? pagination.page : 1;
  const query = useMemo(() => ({ filters, page, invalid: invalidPrice }), [filters, page, invalidPrice]);
  const request = useLatestRequest(query, loadCompanyPage, 300);
  const { loading, error } = request;
  const companies = request.data?.items ?? EMPTY_COMPANIES;
  const filteredCompanies = companies;
  const addresses = useMemo(() => companies.flatMap((company) => company.addresses ?? []), [companies]);
  const materialUnits = useMemo(() => getMaterialUnits(companies, materialId), [companies, materialId]);
  const priceUnitOptions = [...new Set(["т", "м³", "шт", ...materialUnits, ...(priceUnit ? [priceUnit] : [])])];
  useEffect(() => {
    if (request.data && page > Math.max(1, request.data.totalPages)) setPagination({ filters, page: Math.max(1, request.data.totalPages) });
  }, [request.data, page, filters]);

  useEffect(() => {
    if (role !== "provider") return;
    materialsService
      .getMaterials()
      .then((items) => setMaterials(items.filter((item) => !item.is_deleted)))
      .catch(() => setMaterials([]));
  }, [role]);

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
    setSearch("");
    setCity("");
    setAdministrativeDistrict("");
    setDistrict("");
    setMaterialId("");
    setPriceUnit("");
    setMaxPrice("");
    setPriceSort("default");
  };

  const visiblePrices = (company: CompanyDto): CompanyMaterialDto[] => {
    const prices = company.materialsWithPrices ?? [];
    if (!materialId) return prices;
    return prices.filter((item) => item.materialId === materialId && (!selectedPriceUnit || normalizeMaterialUnit(item.unit) === selectedPriceUnit));
  };

  const toggleCompanyDetails = (companyId: string) => {
    setExpandedCompanyIds((current) => {
      const next = new Set(current);
      if (next.has(companyId)) next.delete(companyId);
      else next.add(companyId);
      return next;
    });
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
              ? "grid gap-3 border-y py-4 sm:grid-cols-2 xl:grid-cols-4"
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
            <Input
                id="company-district-filter"
                list="company-district-suggestions"
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
                placeholder="Даниловский"
              />
            <datalist id="company-district-suggestions">{availableDistricts.map((item) => <option key={item} value={item} />)}</datalist>
          </div>

          {role === "provider" && (
            <>
              <div className="grid gap-1.5">
                <Label htmlFor="company-material-filter">Материал</Label>
                <MaterialSearchFilter
                  materials={materials}
                  value={materialId}
                  onChange={(value) => {
                    setMaterialId(value);
                    setPriceUnit("");
                    setMaxPrice("");
                    setPriceSort("default");
                  }}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="company-price-unit">Единица цены</Label>
                <Select value={selectedPriceUnit || "all"} onValueChange={(value) => setPriceUnit(value === "all" ? "" : value)} disabled={!materialId}>
                  <SelectTrigger id="company-price-unit"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все единицы</SelectItem>
                    {priceUnitOptions.map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="company-max-price">Цена до, руб.</Label>
                <Input
                  id="company-max-price"
                  inputMode="decimal"
                  disabled={!canComparePrices}
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="Например, 1500"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="company-price-sort">Сортировка</Label>
                <Select value={canComparePrices ? priceSort : "default"} onValueChange={setPriceSort} disabled={!canComparePrices}>
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
              Найдено исполнителей: {request.data?.total ?? "..."}
            </p>
            {(search || city ||
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
        {role === "customer" && <p className="text-sm text-muted-foreground">Найдено заказчиков: {request.data?.total ?? "..."}</p>}
        {error && <RequestError error={error} onRetry={request.retry} />}
        {!loading && !error && (
          <Table>
            <TableHeader>
              <TableRow>
                {role === "provider" ? (
                  <>
                    <TableHead className="w-[22%]">Исполнитель</TableHead>
                    <TableHead className="w-[26%]">География</TableHead>
                    <TableHead className="w-[25%]">
                      {selectedMaterial
                        ? `Цена: ${selectedMaterial.name}`
                        : "Цены"}
                    </TableHead>
                    <TableHead className="w-[290px]">Действия</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="w-[25%]">Заказчик</TableHead>
                    <TableHead className="w-[30%]">Объекты</TableHead>
                    <TableHead>Источник / сегменты</TableHead>
                    <TableHead className="w-[290px]">Действия</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <Fragment key={company._id}>
                  <TableRow>
                    {role === "provider" ? (
                      <>
                      <TableCell className="align-top">
                        <Link to={`/companies/${company._id}`} className="font-medium hover:underline">{company.name}</Link>
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
                      <TableCell className="align-top">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/deals/create?providerId=${encodeURIComponent(company._id)}`
                              )
                            }
                          >
                            <FilePlus2Icon />
                            Создать сделку
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            aria-expanded={expandedCompanyIds.has(company._id)}
                            onClick={() => toggleCompanyDetails(company._id)}
                          >
                            Подробнее
                            {expandedCompanyIds.has(company._id) ? (
                              <ChevronUpIcon />
                            ) : (
                              <ChevronDownIcon />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      </>
                    ) : (
                      <>
                      <TableCell className="align-top">
                        <Link to={`/companies/${company._id}`} className="font-medium hover:underline">{company.name}</Link>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {company.inn
                            ? `ИНН ${formatINN(company.inn)}`
                            : "ИНН не указан"}
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
                                <div
                                  key={address._id}
                                  className="flex gap-2 text-xs"
                                >
                                  <MapPinIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">
                                      {[
                                        address.administrativeDistrict,
                                        address.district,
                                      ]
                                        .filter(Boolean)
                                        .join(" · ") || "Район не указан"}
                                    </p>
                                    <p className="text-muted-foreground">
                                      {address.adressDetail?.address ||
                                        "Адрес не указан"}
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Объекты не добавлены
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="align-top text-sm">
                        {[company.source, ...(company.segments ?? [])]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/deals/create?customerId=${encodeURIComponent(company._id)}`
                              )
                            }
                          >
                            <FilePlus2Icon />
                            Создать сделку
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            aria-expanded={expandedCompanyIds.has(company._id)}
                            onClick={() => toggleCompanyDetails(company._id)}
                          >
                            Подробнее
                            {expandedCompanyIds.has(company._id) ? (
                              <ChevronUpIcon />
                            ) : (
                              <ChevronDownIcon />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      </>
                    )}
                  </TableRow>
                  {expandedCompanyIds.has(company._id) && (
                    <TableRow>
                      <TableCell colSpan={4} className="bg-muted/20 p-0">
                      <div className="border-b px-4 py-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">{company.name}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                          <Button asChild type="button" size="sm" variant="outline"><Link to={`/companies/${company._id}`}><ArrowUpRightIcon />Карточка компании</Link></Button>
                          <Button asChild type="button" size="sm" variant="outline"><Link to={`/leads?companyId=${encodeURIComponent(company._id)}&create=true`}><TargetIcon />Новый лид</Link></Button>
                          <Button asChild type="button" size="sm" variant="outline"><Link to={`/leads?companyId=${encodeURIComponent(company._id)}`}><TargetIcon />Лиды</Link></Button>
                          <Button asChild type="button" size="sm" variant="outline"><Link to={`/tasks?companyId=${encodeURIComponent(company._id)}`}><ClipboardListIcon />Задачи</Link></Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingCompany(company)}
                          >
                            <PencilIcon />
                            Редактировать
                          </Button>
                          </div>
                        </div>
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                          <section className="grid content-start gap-2">
                            <h3 className="text-sm font-medium">О компании</h3>
                            <dl className="grid gap-1.5 text-xs">
                              <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">ИНН</dt>
                                <dd>
                                  {company.inn ? formatINN(company.inn) : "—"}
                                </dd>
                              </div>
                              <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">КПП</dt>
                                <dd>{company.kpp || "—"}</dd>
                              </div>
                              <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">Источник</dt>
                                <dd className="text-right">
                                  {company.source || "—"}
                                </dd>
                              </div>
                              <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">Сегменты</dt>
                                <dd className="text-right">
                                  {company.segments?.join(", ") || "—"}
                                </dd>
                              </div>
                              <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">Данные ФНС</dt>
                                <dd>
                                  {company.contacts?.length
                                    ? `${company.contacts.length} зап.`
                                    : "—"}
                                </dd>
                              </div>
                            </dl>
                            {company.comment && (
                              <p className="border-t pt-2 text-xs text-muted-foreground">
                                {company.comment}
                              </p>
                            )}
                          </section>

                          <section className="grid content-start gap-2 border-t pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                            <h3 className="text-sm font-medium">Контакты</h3>
                            <CompanyContactDetails
                              company={company}
                              maxItems={3}
                            />
                          </section>

                          <section className="grid content-start gap-2 border-t pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
                            <h3 className="text-sm font-medium">
                              {role === "provider" ? "Адреса" : "Объекты"}
                            </h3>
                            {(addressesByCompany.get(company._id) ?? []).length ? (
                              <div className="grid gap-2">
                                {(addressesByCompany.get(company._id) ?? []).map(
                                  (address) => (
                                    <div
                                      key={address._id}
                                      className="flex gap-2 text-xs"
                                    >
                                      <MapPinIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                                      <div>
                                        <p>{address.adressDetail?.address || "—"}</p>
                                        <p className="text-muted-foreground">
                                          {[
                                            address.administrativeDistrict,
                                            address.district,
                                          ]
                                            .filter(Boolean)
                                            .join(" · ") || "Район не указан"}
                                        </p>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {role === "provider"
                                  ? "Адреса не добавлены"
                                  : "Объекты не добавлены"}
                              </p>
                            )}
                          </section>

                          <section className="grid content-start gap-2 border-t pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
                            <h3 className="text-sm font-medium">
                              Материалы и цены
                            </h3>
                            {company.materialsWithPrices?.length ? (
                              <div className="grid gap-1.5">
                                {company.materialsWithPrices.map((item) => (
                                  <div
                                    key={item._id}
                                    className="flex justify-between gap-3 text-xs"
                                  >
                                    <span>
                                      {item.material?.name || "Материал"}
                                    </span>
                                    <span className="shrink-0 font-medium tabular-nums">
                                      {priceFormatter.format(item.price)} руб./{item.unit}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Цены не добавлены
                              </p>
                            )}
                          </section>
                        </div>
                      </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
              {filteredCompanies.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-32 text-center text-muted-foreground"
                  >
                    Компании не найдены
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
        {request.data && !loading && !error && <Pagination total={request.data.totalPages} current={page} onClick={(value) => setPagination({ filters, page: value })} />}
      </div>

      <CreatingModal
        open={creating}
        initialRole={role}
        onClose={() => setCreating(false)}
        onCancel={() => setCreating(false)}
        onCreate={request.retry}
      />
      <ImportCompaniesModal
        open={importOpen}
        role={role}
        onClose={() => setImportOpen(false)}
        onImported={request.retry}
      />
      <EditingCompanyModal
        company={editingCompany}
        open={editingCompany !== null}
        onClose={() => setEditingCompany(null)}
        onUpdate={request.retry}
      />
    </Page>
  );
}
