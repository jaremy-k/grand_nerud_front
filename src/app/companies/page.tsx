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
import { addressesService, companiesService } from "@/services";
import { AddressDto, CompanyDto, CompanyRole } from "@definitions/dto";
import { PencilIcon, PlusIcon, UploadIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function CompaniesPage({ role }: { role: CompanyRole }) {
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [administrativeDistrict, setAdministrativeDistrict] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyDto | null>(null);

  const title = role === "provider" ? "Исполнители" : "Заказчики";

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
    if (!value) return companies;
    return companies.filter(
      (company) =>
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
        )
    );
  }, [companies, search]);

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
        <div className="grid gap-3 lg:grid-cols-4">
          <div className="grid gap-1.5">
            <Label htmlFor="company-search">Поиск</Label>
            <Input
              id="company-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Название, ИНН или КПП"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="company-city-filter">Город</Label>
            <Input
              id="company-city-filter"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Москва"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="company-administrative-district-filter">Округ</Label>
            <Select
              value={administrativeDistrict || "all"}
              onValueChange={(value) => setAdministrativeDistrict(value === "all" ? "" : value)}
            >
              <SelectTrigger id="company-administrative-district-filter">
                <SelectValue placeholder="Все округа" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все округа</SelectItem>
                {MOSCOW_ADMINISTRATIVE_DISTRICTS.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="company-district-filter">Район</Label>
            <Input
              id="company-district-filter"
              value={district}
              onChange={(event) => setDistrict(event.target.value)}
              placeholder="Даниловский"
            />
          </div>
        </div>

        {loading && (
          <p className="py-10 text-center text-muted-foreground">Загрузка...</p>
        )}
        {error && <p className="py-10 text-center text-destructive">{error}</p>}
        {!loading && !error && (
          <Table>
            <TableHeader>
              <TableRow>
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
                <TableHead className="w-12">
                  <span className="sr-only">Действия</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company._id}>
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
                              {` · ${new Intl.NumberFormat("ru-RU").format(item.price)} руб. / ${item.unit}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : "—"}
                  </TableCell>
                  <TableCell>{company.comment || "—"}</TableCell>
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
                    colSpan={10}
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
