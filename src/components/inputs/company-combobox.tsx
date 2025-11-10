"use client";

import { CompanyDto } from "@definitions/dto";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Input } from "../ui/input";
import { CreatingModal } from "./creating-modal";

export function CompanyCombobox({
  companies,
  value = "",
  disabled = false,
  onChange = () => {},
  onCompanyCreate = () => {},
}: {
  companies: CompanyDto[];
  value?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onCompanyCreate?: (company: CompanyDto) => void;
}) {
  const [open, setOpen] = useState(false);
  const [creatingOpen, setCreatingOpen] = useState(false);

  const handleCreateCompany = () => {
    setOpen(false);
    setCreatingOpen(true);
  };

  const handleCompanyCreate = (comapny: CompanyDto) => {
    onCompanyCreate(comapny);
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
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Вводите название компании..." />
        <CommandList>
          <CommandEmpty>Нет компаний с похожим названием.</CommandEmpty>
          <CommandGroup heading="Копании">
            {companies.map((company) => (
              <CommandItem key={company._id}>
                <div
                  className="flex flex-col overflow-hidden"
                  onClick={() => {
                    onChange(company._id);
                    setOpen(false);
                  }}
                >
                  <p className="w-full truncate">{company.name}</p>
                  <div className="inline-flex mt-1">
                    <p className="text-sm text-slate-500">{company.inn}</p>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
        <div className="py-2 px-2">
          <Button
            type="button"
            onClick={handleCreateCompany}
            variant="outline"
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Добавить компанию
          </Button>
        </div>
      </CommandDialog>
      <CreatingModal
        open={creatingOpen}
        onCreate={handleCompanyCreate}
        onClose={() => setCreatingOpen(false)}
      />
    </>
  );
}
