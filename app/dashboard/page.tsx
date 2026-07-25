import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { deals, insights, type Deal } from "@/db/schema";
import { analyze, revenueDelta } from "@/lib/analytics";
import { addDeal } from "./actions";
import { InsightsPanel } from "./InsightsPanel";
import { ImportPanel } from "./ImportPanel";
import { ResetButton } from "./ResetButton";
import { FilterBar } from "./FilterBar";
import { PdfExport } from "./PdfExport";
import { Report } from "./report";
import { DealsTable, type TableDeal } from "./DealsTable";

const PERIOD_LABELS: Record<string, string> = {
  "7": "период: 7 дней",
  "30": "период: 30 дней",
  "90": "период: 90 дней",
};

const toTableDeal = (d: Deal): TableDeal => ({
  id: d.id,
  dealDate: d.dealDate.toISOString(),
  customer: d.customer,
  manager: d.manager,
  region: d.region,
  amount: Number(d.amount),
  currency: d.currency,
  status: d.status,
});

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { userId } = await auth();
  const user = await currentUser();

  let allRows: Deal[];
  let dbError = false;
  try {
    allRows = userId
      ? await db.select().from(deals).where(eq(deals.userId, userId)).orderBy(desc(deals.createdAt))
      : [];
  } catch {
    allRows = [];
    dbError = true;
  }

  // ─── Фильтры из URL ───
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const fPeriod = one(sp.period);
  const fManager = one(sp.manager);
  const fRegion = one(sp.region);
  const fStatus = one(sp.status);

  const managers = [...new Set(allRows.map((d) => d.manager).filter(Boolean))].sort();
  const regions = [...new Set(allRows.map((d) => d.region).filter(Boolean))].sort();

  const periodDays = fPeriod && fPeriod !== "all" ? Number(fPeriod) : null;
  const since = periodDays != null ? new Date(Date.now() - periodDays * 86400000) : null;

  const matchesDims = (d: Deal) =>
    (!fManager || d.manager === fManager) &&
    (!fRegion || d.region === fRegion) &&
    (!fStatus || d.status === fStatus);

  const rows = allRows.filter((d) => (!since || d.dealDate >= since) && matchesDims(d));

  if (dbError) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-2xl font-semibold">Дашборд</h1>
        <p className="text-red-600">
          Не удалось подключиться к базе данных. Попробуйте обновить страницу позже.
        </p>
      </main>
    );
  }

  // Последние сохранённые AI-инсайты (история).
  let pastInsights: { id: number; content: string; createdAt: string }[] = [];
  if (userId) {
    try {
      const list = await db
        .select()
        .from(insights)
        .where(eq(insights.userId, userId))
        .orderBy(desc(insights.createdAt))
        .limit(5);
      pastInsights = list.map((i) => ({
        id: i.id,
        content: i.content,
        createdAt: i.createdAt.toISOString(),
      }));
    } catch {
      /* история необязательна */
    }
  }

  const a = analyze(rows);

  // Динамика выручки к предыдущему периоду (только когда выбран период).
  let deltaPct: number | null = null;
  if (periodDays != null && since) {
    const prevSince = new Date(since.getTime() - periodDays * 86400000);
    const prevRows = allRows.filter(
      (d) => d.dealDate >= prevSince && d.dealDate < since && matchesDims(d),
    );
    const prevRevenue = analyze(prevRows).wonRevenue;
    deltaPct = revenueDelta(a.wonRevenue, prevRevenue);
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">
          Дашборд ·{" "}
          <span className="text-zinc-500">
            {user?.firstName ?? user?.emailAddresses[0]?.emailAddress}
          </span>
        </h1>
        <div className="flex items-center gap-2">
          {rows.length > 0 && (
            <PdfExport
              a={a}
              meta={{
                date: new Date().toLocaleDateString("ru-RU"),
                scope: [
                  PERIOD_LABELS[fPeriod ?? ""] ?? "весь период",
                  fManager && `менеджер: ${fManager}`,
                  fRegion && `регион: ${fRegion}`,
                ]
                  .filter(Boolean)
                  .join(" · "),
              }}
            />
          )}
          {allRows.length > 0 && <ResetButton />}
        </div>
      </div>

      {allRows.length > 0 && <FilterBar managers={managers} regions={regions} />}

      <Report a={a} deltaPct={deltaPct} />

      <ImportPanel />

      <InsightsPanel history={pastInsights} />

      {/* Форма добавления сделки вручную */}
      <form
        action={addDeal}
        className="rounded-xl border border-black/10 p-4 dark:border-white/10"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <label className="flex flex-col gap-1 text-sm">
            Клиент
            <input name="customer" required className="w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/15 dark:bg-transparent" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Менеджер
            <input name="manager" className="w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/15 dark:bg-transparent" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Регион
            <input name="region" className="w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/15 dark:bg-transparent" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Дата
            <input name="dealDate" type="date" className="w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/15 dark:bg-transparent" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Сумма
            <input name="amount" type="number" min="0" step="0.01" required className="w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/15 dark:bg-transparent" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Статус
            <select name="status" className="w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/15 dark:bg-transparent">
              <option value="open">В работе</option>
              <option value="won">Выиграна</option>
              <option value="lost">Проиграна</option>
            </select>
          </label>
        </div>
        <button type="submit" className="mt-3 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background">
          Добавить
        </button>
      </form>

      {/* Список сделок */}
      {rows.length === 0 ? (
        <p className="text-zinc-500">
          {allRows.length === 0
            ? "Сделок пока нет — добавьте вручную выше или загрузите файл."
            : "Под выбранные фильтры сделок не нашлось."}
        </p>
      ) : (
        <DealsTable rows={rows.map(toTableDeal)} deletable />
      )}
    </main>
  );
}
