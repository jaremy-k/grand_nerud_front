"use client";

import { companiesService } from "@/services";
import { CompanyDto } from "@definitions/dto";
import { IdCardIcon, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Pagination } from "../../blocks";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../ui/empty";
import { Input } from "../../ui/input";
import CompanyButton from "./company-card";
import { CreatingModal } from "./creating-modal";
import TypeSelector from "./type";

export function CompanyCombobox({
  value = "",
  disabled = false,
  onChange = () => {},
}: {
  value?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}) {
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [searchValue, setSearchValue] = useState<string>("");
  const [type, setType] = useState<string>("all");
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyDto[]>([]);

  const [open, setOpen] = useState(false);
  const [creatingOpen, setCreatingOpen] = useState(false);

  useEffect(() => {
    companiesService.getCompanies().then((res) => setCompanies(res));
  }, []);

  useEffect(() => {
    const loweredSearch = searchValue.toLowerCase();
    const filteredData = companies.filter(
      (el) =>
        (type === "all" || el.type === type) &&
        (el.name.toLowerCase().includes(loweredSearch) ||
          (el.inn && el.inn.toString().includes(loweredSearch)) ||
          (el.abbreviatedName &&
            el.abbreviatedName.toLowerCase().includes(loweredSearch)))
    );
    setFilteredCompanies(filteredData);
    setTotalPages(Math.ceil(filteredData.length / 10));
    setCurrentPage(1);
  }, [companies, type, searchValue]);

  const handleCreateCompany = () => {
    setOpen(false);
    setCreatingOpen(true);
  };

  const handleCompanyCreate = (comapny: CompanyDto) => {
    setCompanies((c) => [...c, comapny]);
    onChange(comapny._id);
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
          setOpen(true);
        }}
        className="truncate overflow-hidden"
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Выбор заказчика</DialogTitle>
            <DialogDescription>
              Выберите существующего заказчика или создайте нового.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="flex">
              <TypeSelector value={type} onChange={setType} />
            </div>
            <div className="flex justify-between items-center gap-4 -mt-1.5">
              <div className="flex gap-4 flex-auto">
                <Input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Поиск..."
                />
              </div>
              <Button
                type="button"
                onClick={handleCreateCompany}
                variant="default"
              >
                <Plus className="mr-1 h-4 w-4" />
                Добавить компанию
              </Button>
            </div>
            <div className="flex flex-col w-full overflow-hidden gap-0.5 pt-2 border-t">
              {filteredCompanies.length === 0 && (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <IdCardIcon />
                    </EmptyMedia>
                    <EmptyTitle>Нет данных</EmptyTitle>
                    <EmptyDescription>
                      Похоже, что клиента с такими фильтрами ещё нет.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button
                      onClick={handleCreateCompany}
                      type="button"
                      className="pointer-events-auto"
                    >
                      Добавить компанию
                    </Button>
                  </EmptyContent>
                </Empty>
              )}
              {filteredCompanies.length > 0 &&
                filteredCompanies
                  .slice((currentPage - 1) * 10, 10 * currentPage)
                  .map((el) => (
                    <CompanyButton
                      key={el._id}
                      company={el}
                      selected={value === el._id}
                      onClick={() => {
                        onChange(el._id);
                        setOpen(false);
                      }}
                    />
                  ))}
            </div>
            <div className="mt-4 mx-auto">
              <Pagination
                total={totalPages}
                current={currentPage}
                onClick={setCurrentPage}
              />
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
      />
    </>
  );
}
