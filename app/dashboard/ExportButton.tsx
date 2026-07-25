"use client";

import { useState } from "react";

export function ExportButton() {
  const [busy, setBusy] = useState(false);

  async function exportPdf() {
    setBusy(true);
    try {
      const node = document.getElementById("report");
      if (!node) return;

      // Динамический импорт — тяжёлые библиотеки грузим только при клике.
      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      // Снимаем область отчёта в картинку (фон под текущую тему).
      const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";
      const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: bg });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((res) => (img.onload = res));

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const imgW = pageW - margin * 2;
      const imgH = (img.height / img.width) * imgW;

      // Разбиваем длинную картинку на страницы.
      let remaining = imgH;
      let position = margin;
      pdf.addImage(dataUrl, "PNG", margin, position, imgW, imgH);
      remaining -= pageH - margin * 2;
      while (remaining > 0) {
        position -= pageH - margin * 2;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", margin, position, imgW, imgH);
        remaining -= pageH - margin * 2;
      }

      pdf.save(`salespulse-отчёт-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={exportPdf}
      disabled={busy}
      className="rounded-md border border-black/15 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/[.06]"
    >
      {busy ? "Готовлю PDF…" : "Скачать отчёт"}
    </button>
  );
}
