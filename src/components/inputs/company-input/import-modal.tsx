import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { companiesService } from "@/services";
import { CompanyImportResult, CompanyRole } from "@definitions/dto";
import { FileSpreadsheetIcon, UploadIcon } from "lucide-react";
import { useEffect, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function ImportCompaniesModal({
  open,
  role,
  onClose,
  onImported,
}: {
  open: boolean;
  role?: CompanyRole;
  onClose: () => void;
  onImported: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CompanyImportResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) return;
    setFile(null);
    setResult(null);
    setError("");
  }, [open]);

  const handleFile = (selectedFile?: File) => {
    setResult(null);
    setError("");
    if (!selectedFile) {
      setFile(null);
      return;
    }
    if (!selectedFile.name.toLowerCase().endsWith(".xlsx")) {
      setFile(null);
      setError("Можно загрузить только файл .xlsx");
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("Размер файла не должен превышать 10 МБ");
      return;
    }
    setFile(selectedFile);
  };

  const handleImport = async () => {
    if (!file) {
      setError("Выберите файл для импорта");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const importResult = await companiesService.importCompanies(file, role);
      setResult(importResult);
      onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось импортировать файл");
    } finally {
      setUploading(false);
    }
  };

  const roleLabel =
    role === "provider"
      ? "исполнителей"
      : role === "customer"
        ? "заказчиков"
        : "компаний";

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Импорт {roleLabel} из Excel</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="companies-import-file">Файл Excel</Label>
            <Input
              id="companies-import-file"
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              disabled={uploading}
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
            <p className="text-xs text-muted-foreground">
              Формат .xlsx, не более 10 МБ и 10 000 строк
            </p>
          </div>

          {file && !result && (
            <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <FileSpreadsheetIcon className="size-4 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} МБ
              </span>
            </div>
          )}

          {result && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-md border px-3 py-2">
                  <p className="text-xs text-muted-foreground">Строк</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {result.totalRows}
                  </p>
                </div>
                <div className="rounded-md border px-3 py-2">
                  <p className="text-xs text-muted-foreground">Создано</p>
                  <p className="text-lg font-semibold tabular-nums text-green-700">
                    {result.created}
                  </p>
                </div>
                <div className="rounded-md border px-3 py-2">
                  <p className="text-xs text-muted-foreground">Обновлено</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {result.updated}
                  </p>
                </div>
                <div className="rounded-md border px-3 py-2">
                  <p className="text-xs text-muted-foreground">Пропущено</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {result.skipped}
                  </p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="grid gap-2">
                  <p className="text-sm font-medium text-destructive">
                    Ошибки: {result.errors.length}
                  </p>
                  <div className="max-h-64 overflow-y-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20">Строка</TableHead>
                          <TableHead>Описание</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.errors.map((item, index) => (
                          <TableRow key={`${item.row}-${index}`}>
                            <TableCell>{item.row}</TableCell>
                            <TableCell>{item.detail}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {result ? "Закрыть" : "Отмена"}
          </Button>
          {!result && (
            <Button
              type="button"
              onClick={handleImport}
              disabled={!file || uploading}
            >
              <UploadIcon />
              {uploading ? "Импорт..." : "Импортировать"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
