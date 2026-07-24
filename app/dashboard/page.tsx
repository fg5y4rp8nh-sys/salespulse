import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { deals, type Deal } from "@/db/schema";
import { addDeal } from "./actions";
import { InsightsPanel } from "./InsightsPanel";
import { ImportPanel } from "./ImportPanel";
import { ResetButton } from "./ResetButton";

// Формат суммы с учётом валюты сделки.
const money = (n: number, currency = "RUB") =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);

// Человекочитаемые статусы + цвет метки.
const STATUS: Record<string, { label: string; cls: string }> = {
  won: { label: "Выиграна", cls: "bg-green-500/15 text-green-600" },
  lost: { label: "Проиграна", cls: "bg-red-500/15 text-red-600" },
  open: { label: "В работе", cls: "bg-amber-500/15 text-amber-600" },
};

const MAX_ROWS = 50; // сколько строк показываем в таблице

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  let rows: Deal[];
  let dbError = false;
  try {
    rows = userId
      ? await db
          .select()
          .from(deals)
          .where(eq(deals.userId, userId))
          .orderBy(desc(deals.createdAt))
      : [];
  } catch {
    rows = [];
    dbError = true;
  }

  if (dbError) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-2xl font-semibold">Дашборд</h1>
        <p className="text-red-600">
          Не удалось подключиться к базе данных. Попробуйте обновить страницу
          позже — если не помогает, проверьте настройки подключения.
        </p>
      </main>
    );
  }

  // Метрики.
  const wonRevenue = rows
    .filter((d) => d.status === "won")
    .reduce((sum, d) => sum + Number(d.amount), 0);
  const totalAmount = rows.reduce((sum, d) => sum + Number(d.amount), 0);
  const avgCheck = rows.length ? totalAmount / rows.length : 0;
  const wonCount = rows.filter((d) => d.status === "won").length;
  const lostCount = rows.filter((d) => d.status === "lost").length;
  const closedCount = wonCount + lostCount;
  const conversion = closedCount ? Math.round((wonCount / closedCount) * 100) : 0;

  // Валюта для метрик берём из первой сделки (обычно она одна на аккаунт).
  const mainCurrency = rows[0]?.currency ?? "RUB";
  const visibleRows = rows.slice(0, MAX_ROWS);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">
          Дашборд ·{" "}
          <span className="text-zinc-500">
            {user?.firstName ?? user?.emailAddresses[0]?.emailAddress}
          </span>
        </h1>
        {rows.length > 0 && <ResetButton />}
      </div>

      {/* Метрики */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label="Выручка" value={money(wonRevenue, mainCurrency)} />
        <Metric label="Всего сделок" value={String(rows.length)} />
        <Metric label="Средний чек" value={money(avgCheck, mainCurrency)} />
        <Metric label="Конверсия" value={`${conversion}%`} />
      </div>

      {/* Загрузка CSV */}
      <ImportPanel />

      {/* AI-инсайты */}
      <InsightsPanel />

      {/* Форма добавления сделки вручную */}
      <form
        action={addDeal}
        className="rounded-xl border border-black/10 p-4 dark:border-white/10"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <label className="flex flex-col gap-1 text-sm">
            Клиент
            <input
              name="customer"
              required
              className="w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/15 dark:bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Менеджер
            <input
              name="manager"
              className="w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/15 dark:bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Регион
            <input
              name="region"
              className="w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/15 dark:bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Дата
            <input
              name="dealDate"
              type="date"
              className="w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/15 dark:bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Сумма
            <input
              name="amount"
              type="number"
              min="0"
              step="0.01"
              required
              className="w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/15 dark:bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Статус
            <select
              name="status"
              className="w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/15 dark:bg-transparent"
            >
              <option value="open">В работе</option>
              <option value="won">Выиграна</option>
              <option value="lost">Проиграна</option>
            </select>
          </label>
        </div>
        <button
          type="submit"
          className="mt-3 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Добавить
        </button>
      </form>

      {/* Список сделок */}
      {rows.length === 0 ? (
        <p className="text-zinc-500">
          Сделок пока нет — добавьте вручную ниже или загрузите файл выше.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-zinc-500">
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="py-2 pr-4">Дата</th>
                  <th className="py-2 pr-4">Клиент</th>
                  <th className="py-2 pr-4">Менеджер</th>
                  <th className="py-2 pr-4">Регион</th>
                  <th className="py-2 pr-4">Сумма</th>
                  <th className="py-2">Статус</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((d) => {
                  const st = STATUS[d.status] ?? STATUS.open;
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-black/5 dark:border-white/5"
                    >
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {d.dealDate.toLocaleDateString("ru-RU")}
                      </td>
                      <td className="py-2 pr-4">{d.customer}</td>
                      <td className="py-2 pr-4">{d.manager || "—"}</td>
                      <td className="py-2 pr-4">{d.region || "—"}</td>
                      <td className="py-2 pr-4 whitespace-nowrap tabular-nums">
                        {money(Number(d.amount), d.currency)}
                      </td>
                      <td className="py-2">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}
                        >
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {rows.length > MAX_ROWS && (
            <p className="text-xs text-zinc-500">
              Показаны последние {MAX_ROWS} из {rows.length} сделок.
            </p>
          )}
        </div>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
      <div className="text-sm text-zinc-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
