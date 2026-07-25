// Воронка продаж. Показывает, сколько сделок дошло до каждого этапа (или дальше).

const STAGE_LABELS: Record<string, string> = {
  lead: "Лид",
  qualified: "Квалификация",
  proposal: "Предложение",
  negotiation: "Переговоры",
  closed: "Закрытие",
};
const ORDER = ["lead", "qualified", "proposal", "negotiation", "closed"];

export function Funnel({ stageCounts }: { stageCounts: Record<string, number> }) {
  // Кумулятив: на этапе N считаем всех, кто дошёл до него или дальше.
  const cumulative = ORDER.map((stage, i) => {
    const reached = ORDER.slice(i).reduce((sum, s) => sum + (stageCounts[s] ?? 0), 0);
    return { stage, label: STAGE_LABELS[stage], count: reached };
  });

  const max = cumulative[0]?.count || 1;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10">
      <h3 className="text-sm font-semibold text-zinc-500">Воронка продаж</h3>
      <div className="flex flex-col gap-2">
        {cumulative.map(({ stage, label, count }, i) => {
          const pct = Math.round((count / max) * 100);
          // Процент перехода с предыдущего этапа.
          const prev = i > 0 ? cumulative[i - 1].count : count;
          const conv = i > 0 && prev > 0 ? Math.round((count / prev) * 100) : null;
          return (
            <div key={stage} className="flex items-center gap-3">
              <div className="w-28 shrink-0 text-sm text-zinc-500">{label}</div>
              <div className="relative h-8 flex-1 overflow-hidden rounded-md bg-black/[.04] dark:bg-white/[.06]">
                <div
                  className="flex h-full items-center rounded-md px-2 text-xs font-medium text-white transition-all"
                  style={{
                    width: `${Math.max(pct, 6)}%`,
                    background: "var(--chart-1)",
                  }}
                >
                  {count}
                </div>
              </div>
              <div className="w-12 shrink-0 text-right text-xs text-zinc-500">
                {conv != null ? `${conv}%` : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
