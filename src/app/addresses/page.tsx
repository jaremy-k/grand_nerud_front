"use client";

import { Page } from "@/components/blocks";
import AddressesSection from "@/components/inputs/company-input/addresses-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOSCOW_ADMINISTRATIVE_DISTRICTS } from "@/config/addresses";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addressesService, companiesService } from "@/services";
import { AddressDto, CompanyDto } from "@definitions/dto";
import { useEffect, useMemo, useState } from "react";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [administrativeDistrict, setAdministrativeDistrict] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      addressesService.getAddresses({
        city: city.trim() || undefined,
        administrativeDistrict: administrativeDistrict || undefined,
        district: district.trim() || undefined,
      }),
      companiesService.getCompanies(),
    ])
      .then(([addressData, companyData]) => {
        setAddresses(addressData);
        setCompanies(companyData);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Не удалось загрузить адреса")
      )
      .finally(() => setLoading(false));
  }, [city, administrativeDistrict, district]);

  const companyNames = useMemo(
    () => new Map(companies.map((company) => [company._id, company.name])),
    [companies]
  );

  const filteredAddresses = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return addresses;
    return addresses.filter((address) =>
      [
        address.adressDetail?.address,
        address.adressDetail?.entrance,
        address.typeAdress,
        address.city,
        address.administrativeDistrict,
        address.district,
        companyNames.get(address.companyId),
      ].some((field) => String(field ?? "").toLowerCase().includes(value))
    );
  }, [addresses, companyNames, search]);

  return (
    <Page breadcrumbLinks={[{ label: "Адреса", href: "/addresses" }]}>
      <div className="grid gap-6 py-4">
        <section className="grid gap-3">
          <Label htmlFor="address-company">Компания</Label>
          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
            <SelectTrigger id="address-company" className="max-w-md">
              <SelectValue placeholder="Выберите компанию" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company._id} value={company._id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCompanyId && (
            <AddressesSection
              key={selectedCompanyId}
              companyId={selectedCompanyId}
            />
          )}
        </section>

        <section className="grid gap-3 border-t pt-5">
          <div className="grid gap-3 lg:grid-cols-4">
            <div className="grid gap-1.5">
              <Label htmlFor="address-search">Поиск</Label>
              <Input
                id="address-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Адрес, тип или компания"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="address-city-filter">Город</Label>
              <Input
                id="address-city-filter"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Москва"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="address-administrative-district-filter">
                Округ
              </Label>
              <Select
                value={administrativeDistrict || "all"}
                onValueChange={(value) =>
                  setAdministrativeDistrict(value === "all" ? "" : value)
                }
              >
                <SelectTrigger id="address-administrative-district-filter">
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
              <Label htmlFor="address-district-filter">Район</Label>
              <Input
                id="address-district-filter"
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
                  <TableHead>Адрес</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Город</TableHead>
                  <TableHead>Округ / район</TableHead>
                  <TableHead>Детали</TableHead>
                  <TableHead>Координаты</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAddresses.map((address) => (
                  <TableRow key={address._id}>
                    <TableCell className="font-medium">
                      {companyNames.get(address.companyId) || "Неизвестная компания"}
                    </TableCell>
                    <TableCell>{address.adressDetail?.address || "—"}</TableCell>
                    <TableCell>{address.typeAdress || "—"}</TableCell>
                    <TableCell>{address.city || "—"}</TableCell>
                    <TableCell>
                      {[address.administrativeDistrict, address.district]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </TableCell>
                    <TableCell>
                      {String(address.adressDetail?.entrance ?? "—")}
                    </TableCell>
                    <TableCell>{address.coordinates?.join(", ") || "—"}</TableCell>
                  </TableRow>
                ))}
                {filteredAddresses.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-32 text-center text-muted-foreground"
                    >
                      Адреса не найдены
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </section>
      </div>
    </Page>
  );
}
