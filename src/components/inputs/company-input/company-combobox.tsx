"use client";

import { companiesService } from "@/services";
import { CompanyDto, CompanyRole } from "@definitions/dto";
import { PencilIcon, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import CompanyButton from "./company-card";
import { CreatingModal } from "./creating-modal";
import { EditingCompanyModal } from "./editing-modal";

const COMPANY_BATCH_SIZE = 15;

function companyCreatedAt(company: CompanyDto): number {
  const value = company.createdAt ?? company.created_at;
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function CompanyCombobox({
  value = "",
  disabled = false,
  onChange = () => {},
  role = "customer",
}: {
  value?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  role?: CompanyRole;
}) {
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState(COMPANY_BATCH_SIZE);

  const [open, setOpen] = useState(false);
  const [creatingOpen, setCreatingOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyDto | null>(null);

  useEffect(() => {
    companiesService.getCompanies(role).then((res) => setCompanies(res));
  }, [role]);

  useEffect(() => {
    if (!value || companies.some((company) => company._id === value)) return;

    companiesService
      .getCompany(value)
      .then((company) =>
        setCompanies((current) =>
          current.some((item) => item._id === company._id)
            ? current
            : [company, ...current]
        )
      )
      .catch(() => {});
  }, [companies, value]);

  const filteredCompanies = useMemo(() => {
    const loweredSearch = searchValue.trim().toLowerCase();
    return companies
      .map((company, index) => ({ company, index }))
      .filter(({ company }) =>
        loweredSearch
          ? company.name.toLowerCase().includes(loweredSearch)
          : true
      )
      .sort((left, right) => {
        const dateDifference =
          companyCreatedAt(right.company) - companyCreatedAt(left.company);
        if (dateDifference !== 0) return dateDifference;
        return right.index - left.index;
      })
      .map(({ company }) => company);
  }, [companies, searchValue]);

  const visibleCompanies = filteredCompanies.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(COMPANY_BATCH_SIZE);
  }, [searchValue, role]);

  const handleListScroll = (element: HTMLDivElement) => {
    const remainingScroll =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    if (
      remainingScroll < 80 &&
      visibleCount < filteredCompanies.length
    ) {
      setVisibleCount((count) =>
        Math.min(count + COMPANY_BATCH_SIZE, filteredCompanies.length)
      );
    }
  };

  const handleCreateCompany = () => {
    setOpen(false);
    setCreatingOpen(true);
  };

  const handleCompanyCreate = (company: CompanyDto) => {
    setCompanies((c) => {
      const idx = c.findIndex((el) => el._id === company._id);
      if (idx >= 0) {
        const next = [...c];
        next[idx] = company;
        return next;
      }
      return [...c, company];
    });
    onChange(company._id);
  };

  const handleCompanyUpdate = (company: CompanyDto) => {
    setCompanies((current) => {
      const belongsToRole =
        !company.roles?.length || company.roles.includes(role);
      if (!belongsToRole) {
        return current.filter((item) => item._id !== company._id);
      }
      return current.map((item) =>
        item._id === company._id ? company : item
      );
    });
  };

  return (
    <>
      <Input
        disabled={disabled}
        readOnly
        value={companies.find((el) => el._id === value)?.name || ""}
        placeholder="Выберите компанию"
        onFocus={(e) => {
          e.target.blur();
          setSearchValue("");
          setVisibleCount(COMPANY_BATCH_SIZE);
          setOpen(true);
        }}
        className="truncate overflow-hidden"
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              Выбор {role === "provider" ? "исполнителя" : "заказчика"}
            </DialogTitle>
            <DialogDescription>
              Выберите существующую компанию или создайте новую.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Поиск по названию"
                  autoFocus
                />
              </div>
              <Button
                type="button"
                onClick={handleCreateCompany}
                variant="default"
              >
                <Plus />
                Добавить компанию
              </Button>
            </div>
            <div
              className="flex max-h-[55dvh] w-full flex-col gap-0.5 overflow-y-auto border-t pt-2"
              onScroll={(event) => handleListScroll(event.currentTarget)}
            >
              {filteredCompanies.length === 0 && (
                <div className="grid justify-items-center gap-3 py-10 text-center">
                  <p className="text-sm text-muted-foreground">Не найдено</p>
                  <Button
                    onClick={handleCreateCompany}
                    type="button"
                    variant="outline"
                  >
                    <Plus />
                    Добавить компанию
                  </Button>
                </div>
              )}
              {visibleCompanies.length > 0 &&
                visibleCompanies.map((el) => (
                  <div key={el._id} className="flex items-center gap-1">
                    <CompanyButton
                      company={el}
                      selected={value === el._id}
                      onClick={() => {
                        onChange(el._id);
                        setOpen(false);
                      }}
                    />
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      className="shrink-0"
                      aria-label={`Редактировать ${el.name}`}
                      onClick={() => {
                        setOpen(false);
                        setEditingCompany(el);
                      }}
                    >
                      <PencilIcon />
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <CreatingModal
        open={creatingOpen}
        onCreate={handleCompanyCreate}
        onCancel={() => {
          setCreatingOpen(false);
          setOpen(true);
        }}
        onClose={() => setCreatingOpen(false)}
        initialRole={role}
      />
      <EditingCompanyModal
        company={editingCompany}
        open={editingCompany !== null}
        onClose={() => {
          setEditingCompany(null);
          setOpen(true);
        }}
        onUpdate={handleCompanyUpdate}
      />
    </>
  );
}
