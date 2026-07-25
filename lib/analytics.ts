import type { Deal } from "@/db/schema";

const MONTHS = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

export type Analytics = ReturnType<typeof analyze>;

// Считает все производные данные дашборда из массива сделок.
export function analyze(rows: Deal[]) {
  const won = rows.filter((d) => d.status === "won");
  const wonRevenue = won.reduce((s, d) => s + Number(d.amount), 0);
  const totalAmount = rows.reduce((s, d) => s + Number(d.amount), 0);
  const avgCheck = rows.length ? totalAmount / rows.length : 0;
  const wonCount = won.length;
  const lostCount = rows.filter((d) => d.status === "lost").length;
  const closedCount = wonCount + lostCount;
  const conversion = closedCount ? Math.round((wonCount / closedCount) * 100) : 0;
  const mainCurrency = rows[0]?.currency ?? "RUB";

  // Выручка по месяцам.
  const monthMap = new Map<string, number>();
  for (const d of won) {
    const key = d.dealDate.toISOString().slice(0, 7);
    monthMap.set(key, (monthMap.get(key) ?? 0) + Number(d.amount));
  }
  const revenueByMonth = [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, revenue]) => {
      const [y, m] = key.split("-");
      return { month: `${MONTHS[Number(m) - 1]} ${y.slice(2)}`, revenue };
    });

  // Топ-5 менеджеров.
  const managerMap = new Map<string, number>();
  for (const d of won) {
    const name = d.manager || "Без менеджера";
    managerMap.set(name, (managerMap.get(name) ?? 0) + Number(d.amount));
  }
  const topManagers = [...managerMap.entries()]
    .map(([manager, revenue]) => ({ manager, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // По регионам.
  const regionMap = new Map<string, number>();
  for (const d of won) {
    const name = d.region || "Без региона";
    regionMap.set(name, (regionMap.get(name) ?? 0) + Number(d.amount));
  }
  const byRegion = [...regionMap.entries()]
    .map(([region, value]) => ({ region, value }))
    .sort((a, b) => b.value - a.value);

  // Этапы воронки.
  const stageCounts: Record<string, number> = {};
  for (const d of rows) stageCounts[d.stage] = (stageCounts[d.stage] ?? 0) + 1;

  return {
    wonRevenue,
    avgCheck,
    conversion,
    dealCount: rows.length,
    mainCurrency,
    revenueByMonth,
    topManagers,
    byRegion,
    stageCounts,
    won,
  };
}

// Динамика выручки текущего периода к предыдущему такому же (в %). null — если сравнивать не с чем.
export function revenueDelta(current: number, previous: number): number | null {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
}
