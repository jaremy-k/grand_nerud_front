"use client";

import { Page } from "@/components/blocks";
import { CreatingModal } from "@/components/inputs/company-input/creating-modal";
import { EditingCompanyModal } from "@/components/inputs/company-input/editing-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINN } from "@/lib/formatters";
import { companiesService } from "@/services";
import { CompanyDto, CompanyRole } from "@definitions/dto";
import { PencilIcon, PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function formatContactPersons(company: CompanyDto): string {
  if (!company.contactPersons?.length) return "—";
  return company.contactPersons
    .map((person) =>
      [person.name, person.position, person.phone, person.email]
        .filter(Boolean)
        .join(" · ")
    )
    .join("; ");
}

export default function CompaniesPage({ role }: { role: CompanyRole }) {
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyDto | null>(null);

  const title = role === "provider" ? "Исполнители" : "Заказчики";

  useEffect(() => {
    setLoading(true);
    setError("");
    companiesService
      .getCompanies(role)
      .then(setCompanies)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Не удалось загрузить компании"
        )
      )
      .finally(() => setLoading(false));
  }, [role]);

  const filteredCompanies = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return companies;
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(value) ||
        company.abbreviatedName?.toLowerCase().includes(value) ||
        company.inn?.includes(value) ||
        company.kpp?.includes(value) ||
        company.contactPersons?.some((person) =>
          [person.name, person.position, person.phone, person.email].some(
            (field) => field?.toLowerCase().includes(value)
          )
        )
    );
  }, [companies, search]);

  return (
    <Page
      breadcrumbLinks={[
        {
          label: title,
          href: role === "provider" ? "/providers" : "/customers",
        },
      ]}
      headerActions={
        <Button size="sm" onClick={() => setCreating(true)}>
          <PlusIcon />
          Добавить
        </Button>
      }
    >
      <div className="space-y-4 py-4">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск по названию, ИНН или КПП"
          className="max-w-md"
        />

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
                <TableHead>Контрагенты</TableHead>
                <TableHead className="text-muted-foreground/70">
                  Контакт карточки
                </TableHead>
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
                  <TableCell>{formatContactPersons(company)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {company.contacts?.length
                      ? `${company.contacts.length} зап.`
                      : "—"}
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
                    colSpan={7}
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
              item._id === updatedCompany._id ? updatedCompany : item
            );
          })
        }
      />
    </Page>
  );
}
