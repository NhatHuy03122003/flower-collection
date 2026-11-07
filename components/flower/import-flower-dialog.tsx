"use client";

import {
  type ChangeEvent,
  useCallback,
  useRef,
  useState,
  useTransition,
} from "react";
import { Upload } from "lucide-react";

import { importFlowersAction } from "@/app/actions/flower";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  IMPORT_MAX_BYTES,
  IMPORT_MAX_ROWS,
  analyzeFlowerImportRows,
  getFlowerImportFormat,
  parseFlowerImportContent,
} from "@/lib/flower-import";
import type {
  FlowerImportFieldErrors,
  FlowerImportFormat,
  FlowerImportRowStatus,
  FlowerImportPreview,
} from "@/lib/flower-import";

const PREVIEW_ROW_LIMIT = 50;

const STATUS_META: Record<
  FlowerImportRowStatus,
  { label: string; variant: "default" | "destructive" | "outline" }
> = {
  valid: { label: "Hợp lệ", variant: "default" },
  invalid: { label: "Lỗi", variant: "destructive" },
  duplicate: { label: "Trùng", variant: "outline" },
};

export function ImportFlowerDialog({
  existingNames,
}: {
  existingNames: string[];
}) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [format, setFormat] = useState<FlowerImportFormat | null>(null);
  const [preview, setPreview] = useState<FlowerImportPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const clearFile = useCallback(() => {
    setFileName(null);
    setContent("");
    setFormat(null);
    setPreview(null);
    setError(null);
    setResult(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);

      if (!next) {
        clearFile();
      }
    },
    [clearFile],
  );

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      setError(null);
      setResult(null);
      setPreview(null);
      setContent("");
      setFormat(null);
      setFileName(null);

      if (!file) {
        return;
      }

      const detected = getFlowerImportFormat(file.name);

      if (!detected) {
        setError("Chỉ hỗ trợ file .csv hoặc .json.");
        return;
      }

      if (file.size > IMPORT_MAX_BYTES) {
        setError("File vượt quá 1MB.");
        return;
      }

      const text = await file.text();
      const parsed = parseFlowerImportContent(text, detected);

      if (parsed.error) {
        setError(parsed.error);
        return;
      }

      setFileName(file.name);
      setContent(text);
      setFormat(detected);
      setPreview(analyzeFlowerImportRows(parsed.rows ?? [], existingNames));
    },
    [existingNames],
  );

  const handleImport = useCallback(() => {
    if (!format || !content) {
      return;
    }

    startTransition(async () => {
      const response = await importFlowersAction(content, format);

      if (response.status === "success") {
        setResult(
          `Đã import ${response.imported} hoa, bỏ qua ${response.skipped} dòng.`,
        );
        setPreview(null);
        setContent("");
        setFormat(null);
        setFileName(null);

        if (inputRef.current) {
          inputRef.current.value = "";
        }

        return;
      }

      setError(response.message);
    });
  }, [content, format]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Upload aria-hidden="true" />
        Import
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import hoa</DialogTitle>
          <DialogDescription>
            Nhập danh sách hoa từ file CSV hoặc JSON (tối đa {IMPORT_MAX_ROWS}{" "}
            dòng, 1MB).
          </DialogDescription>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,.json,text/csv,application/json"
          onChange={handleFileChange}
          aria-label="Chọn file import"
          className={
            preview
              ? "sr-only"
              : "block w-full text-xs text-slate-600 file:mr-2 file:cursor-pointer file:rounded-lg file:border-0 file:bg-rose-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
          }
        />

        {result ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
            {result}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            {error}
          </p>
        ) : null}

        {preview ? (
          <ImportPreviewPanel preview={preview} fileName={fileName} />
        ) : null}

        <DialogFooter className="mt-4">
          {preview ? (
            <>
              <Button
                variant="outline"
                type="button"
                disabled={pending}
                onClick={() => inputRef.current?.click()}
              >
                Chọn file khác
              </Button>
              <Button
                type="button"
                disabled={pending || preview.importable.length === 0}
                onClick={handleImport}
              >
                {pending
                  ? "Đang import..."
                  : `Import ${preview.importable.length} hoa`}
              </Button>
            </>
          ) : (
            <DialogClose render={<Button variant="outline" type="button" />}>
              Đóng
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImportPreviewPanel({
  preview,
  fileName,
}: {
  preview: FlowerImportPreview;
  fileName: string | null;
}) {
  const visibleRows = preview.rows.slice(0, PREVIEW_ROW_LIMIT);
  const hiddenCount = preview.rows.length - visibleRows.length;

  return (
    <div className="space-y-2">
      <div className="space-y-0.5">
        {fileName ? (
          <p className="truncate text-xs font-medium text-slate-700">
            {fileName}
          </p>
        ) : null}
        <p className="text-xs text-slate-600">
          {preview.totalRows} dòng ·{" "}
          <span className="font-medium text-emerald-700">
            {preview.validCount} hợp lệ
          </span>{" "}
          ·{" "}
          <span className="font-medium text-rose-700">
            {preview.invalidCount} lỗi
          </span>{" "}
          ·{" "}
          <span className="font-medium text-amber-700">
            {preview.duplicateCount} trùng
          </span>
        </p>
      </div>

      <ul className="max-h-64 space-y-1 overflow-y-auto rounded-lg bg-rose-50/50 p-1.5">
        {visibleRows.map((row) => {
          const meta = STATUS_META[row.status];

          return (
            <li
              key={row.rowNumber}
              className="flex items-start gap-2 rounded-lg bg-white px-2 py-1.5"
            >
              <span className="mt-0.5 w-6 shrink-0 text-right text-[11px] text-slate-400">
                {row.rowNumber}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-800">
                  {row.name || "(không có tên)"}
                </p>
                {row.errors ? (
                  <p className="text-[11px] text-rose-700">
                    {formatRowErrors(row.errors)}
                  </p>
                ) : null}
                {row.note ? (
                  <p className="text-[11px] text-amber-700">{row.note}</p>
                ) : null}
              </div>

              <Badge variant={meta.variant} className="mt-0.5 shrink-0">
                {meta.label}
              </Badge>
            </li>
          );
        })}
      </ul>

      {hiddenCount > 0 ? (
        <p className="text-[11px] text-slate-500">
          ... và {hiddenCount} dòng nữa.
        </p>
      ) : null}
    </div>
  );
}

function formatRowErrors(errors: FlowerImportFieldErrors) {
  return Object.values(errors).join(" ");
}
