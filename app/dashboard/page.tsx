import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { deals } from "@/db/schema";
import { addDeal } from "./actions";
import { InsightsPanel } from "./InsightsPanel";

// Формат суммы в рублях.
const money = (n: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  const rows = userId
    ? await db
        .select()
        .from(deals)
        .where(eq(deals.userId, userId))
        .orderBy(desc(deals.createdAt))
    : [];

  // Метрики.
  const wonRevenue = rows
    .filter((d) => d.status === "won")
    .reduce((sum, d) => sum + Number(d.amount), 0);
  const openCount = rows.filter((d) => d.status === "open").length;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
      <h1 className="text-2xl font-semibold">
        Дашборд ·{" "}
        <span className="text-zinc-500">
          {user?.firstName ?? user?.emailAddresses[0]?.emailAddress}
        </span>
      </h1>

      {/* Метрики */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Metric label="Всего сделок" value={String(rows.length)} />
        <Metric label="Выручка (won)" value={money(wonRevenue)} />
        <Metric label="В работе" value={String(openCount)} />
      </div>

      {/* AI-инсайты */}
      <InsightsPanel />

      {/* Форма добавления */}
      <form
        action={addDeal}
        className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10 sm:flex-row sm:items-end"
      >
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Клиент
          <input
            name="customer"
            required
            className="rounded-md border border-black/15 px-3 py-2 dark:border-white/15 dark:bg-transparent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Менеджер
          <input
            name="manager"
            className="rounded-md border border-black/15 px-3 py-2 dark:border-white/15 dark:bg-transparent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Регион
          <input
            name="region"
            className="rounded-md border border-black/15 px-3 py-2 dark:border-white/15 dark:bg-transparent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Дата
          <input
            name="dealDate"
            type="date"
            className="rounded-md border border-black/15 px-3 py-2 dark:border-white/15 dark:bg-transparent"
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
            className="rounded-md border border-black/15 px-3 py-2 dark:border-white/15 dark:bg-transparent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Статус
          <select
            name="status"
            className="rounded-md border border-black/15 px-3 py-2 dark:border-white/15 dark:bg-transparent"
          >
            <option value="open">В работе</option>
            <option value="won">Выиграна</option>
            <option value="lost">Проиграна</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Добавить
        </button>
      </form>

      {/* Список сделок */}
      {rows.length === 0 ? (
        <p className="text-zinc-500">
          Сделок пока нет — добавьте первую через форму выше.
        </p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-500">
            <tr className="border-b border-black/10 dark:border-white/10">
              <th className="py-2">Дата</th>
              <th className="py-2">Клиент</th>
              <th className="py-2">Менеджер</th>
              <th className="py-2">Регион</th>
              <th className="py-2">Сумма</th>
              <th className="py-2">Статус</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr
                key={d.id}
                className="border-b border-black/5 dark:border-white/5"
              >
                <td className="py-2">
                  {d.dealDate.toLocaleDateString("ru-RU")}
                </td>
                <td className="py-2">{d.customer}</td>
                <td className="py-2">{d.manager || "—"}</td>
                <td className="py-2">{d.region || "—"}</td>
                <td className="py-2">{money(Number(d.amount))}</td>
                <td className="py-2">{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
