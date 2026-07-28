"use client";

import { useRef, useState, useTransition } from "react";
import { importFile, type ImportResult } from "./import";
import { useT, useLocale } from "../I18nProvider";

const ACCEPT =
  ".csv,.tsv,.txt,.xlsx,.xls,.ods,.json,.pdf,.png,.jpg,.jpeg,.webp,text/csv,application/json,application/pdf,image/*";

export function ImportPanel() {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useT();
  const locale = useLocale();

  function onSubmit(formData: FormData) {
    formData.set("locale", locale);
    startTransition(async () => {
      const res = await importFile(formData);
      setResult(res);
      if (res.ok) {
        formRef.current?.reset();
        setFileName(null);
      }
    });
  }

  function label(files: FileList | null): string | null {
    if (!files || files.length === 0) return null;
    return files.length === 1
      ? files[0].name
      : `${locale === "ru" ? "Файлов выбрано" : "Files selected"}: ${files.length}`;
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length && inputRef.current) {
      inputRef.current.files = e.dataTransfer.files;
      setFileName(label(e.dataTransfer.files));
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-black/10 p-4 dark:border-white/10">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-lg font-semibold">{t.impTitle}</h2>
        <p className="text-xs text-zinc-500">{t.impFormats}</p>
      </div>

      <form ref={formRef} action={onSubmit} className="flex flex-col gap-3">
        {/* Зона перетаскивания / выбора файла */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
            dragOver
              ? "border-foreground bg-black/[.03] dark:bg-white/[.04]"
              : "border-black/15 hover:border-black/30 dark:border-white/15 dark:hover:border-white/30"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            name="file"
            accept={ACCEPT}
            multiple
            required
            className="sr-only"
            onChange={(e) => setFileName(label(e.target.files))}
          />
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zinc-400"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M17 8l-5-5-5 5" />
            <path d="M12 3v12" />
          </svg>
          {fileName ? (
            <span className="text-sm font-medium">{fileName}</span>
          ) : (
            <span className="text-sm text-zinc-500">
              {t.impDrop}{" "}
              <span className="font-medium text-foreground underline">{t.impChoose}</span>
            </span>
          )}
        </label>

        <button
          type="submit"
          disabled={isPending || !fileName}
          className="self-start rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity disabled:opacity-40"
        >
          {isPending ? t.impImporting : t.impImport}
        </button>
      </form>

      {result?.ok && (
        <p className="text-sm text-green-600">
          {t.impImported}: {result.imported}
          {result.duplicates > 0 && ` · ${t.impDuplicates}: ${result.duplicates}`}
          {result.skipped > 0 && ` · ${t.impSkipped}: ${result.skipped}`}
          {result.aiUsed && ` · ${t.impAi}`}
        </p>
      )}
      {result && !result.ok && (
        <p className="text-sm text-red-600">{result.error}</p>
      )}
    </section>
  );
}
