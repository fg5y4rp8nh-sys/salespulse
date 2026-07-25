"use client";

import { useRef, useState } from "react";
import type { Analytics } from "@/lib/analytics";
import { ReportDocument } from "./ReportDocument";

export function PdfExport({
  a,
  meta,
}: {
  a: Analytics;
  meta: { date: string; scope: string };
}) {
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function run() {
    setBusy(true);
    setMounted(true); // рендерим отчёт только сейчас (не грузим дашборд постоянно)
    try {
      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      // Ждём, пока отчёт и графики отрисуются.
      await new Promise((r) => setTimeout(r, 450));
      const node = ref.current;
      if (!node) return;

      const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: "#ffffff" });
      const img = new Image();
      img.src = dataUrl;
      await new Promise((res) => (img.onload = res));

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (img.height / img.width) * imgW;

      let position = 0;
      let remaining = imgH;
      pdf.addImage(dataUrl, "PNG", 0, position, imgW, imgH);
      remaining -= pageH;
      while (remaining > 0) {
        position -= pageH;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, position, imgW, imgH);
        remaining -= pageH;
      }
      pdf.save(`salespulse-отчёт-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setMounted(false);
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="rounded-md border border-black/15 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/[.06]"
      >
        {busy ? "Готовлю PDF…" : "Скачать отчёт"}
      </button>

      {mounted && (
        <div aria-hidden style={{ position: "fixed", left: -99999, top: 0, width: 820, pointerEvents: "none" }}>
          <div ref={ref}>
            <ReportDocument a={a} meta={meta} />
          </div>
        </div>
      )}
    </>
  );
}
