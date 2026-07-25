import Link from "next/link";
import type { Deal } from "@/db/schema";
import { analyze } from "@/lib/analytics";
import { Report } from "../dashboard/report";
import { DealsTable, type TableDeal } from "../dashboard/DealsTable";

// Вымышленная компания для витрины — без базы и регистрации.
type Seed = {
  customer: string;
  manager: string;
  region: string;
  amount: number;
  status: string;
  stage: string;
  month: number; // 1..6 (янв..июн 2026)
};

const MANAGERS = ["Иванов", "Петрова", "Смирнов", "Козлова"];
const REGIONS = ["Москва", "Санкт-Петербург", "Юг", "Урал"];
const STAGES = ["lead", "qualified", "proposal", "negotiation", "closed"];
const CUSTOMERS = [
  "ООО Ромашка", "ЗАО Вектор", "ИП Сидоров", "ООО Технопарк", "АО Логистик",
  "ООО Медтех", "ЗАО Строймир", "ООО Агротрейд", "АО Финанс", "ООО Ритейл",
  "ЗАО Энергия", "ООО Гефест", "АО Транзит", "ООО Стандарт", "АО Прогресс",
];

// Детерминированно генерируем ~40 сделок вымышленной компании.
function demoSeeds(): Seed[] {
  const seeds: Seed[] = [];
  let n = 7;
  for (let i = 0; i < 42; i++) {
    n = (n * 1103515245 + 12345) & 0x7fffffff; // простой генератор для стабильности
    const r = (mod: number) => (n >> 8) % mod;
    const stageIdx = r(10) < 6 ? 4 : r(5); // больше закрытых
    const stage = STAGES[stageIdx];
    const status =
      stage === "closed" ? (r(3) === 0 ? "lost" : "won") : "open";
    seeds.push({
      customer: CUSTOMERS[r(CUSTOMERS.length)],
      manager: MANAGERS[r(MANAGERS.length)],
      region: REGIONS[r(REGIONS.length)],
      amount: (r(20) + 3) * 25000,
      status,
      stage,
      month: (i % 6) + 1,
    });
  }
  return seeds;
}

function toDeal(s: Seed, id: number): Deal {
  const dealDate = new Date(2026, s.month - 1, ((id * 7) % 27) + 1);
  const isClosed = s.status === "won" || s.status === "lost";
  return {
    id,
    userId: "demo",
    customer: s.customer,
    manager: s.manager,
    region: s.region,
    amount: String(s.amount),
    currency: "RUB",
    status: s.status,
    stage: s.stage,
    stageChangedAt: dealDate,
    probability: s.status === "won" ? 100 : s.status === "lost" ? 0 : 30,
    expectedCloseDate: null,
    healthScore: null,
    source: "",
    lostReason: null,
    lastActivityAt: null,
    dealDate,
    closedAt: isClosed ? dealDate : null,
    createdAt: dealDate,
  };
}

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

export default function DemoPage() {
  const rows = demoSeeds().map(toDeal);
  const a = analyze(rows);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <p className="text-sm font-semibold">Демо-режим</p>
        <Link
          href="/dashboard"
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Загрузить свои данные →
        </Link>
      </div>

      <h1 className="text-2xl font-semibold">Дашборд · Демо-компания</h1>

      {/* Как пользоваться и зачем регистрироваться */}
      <div className="flex flex-col gap-4 rounded-xl border border-black/10 p-5 dark:border-white/10">
        <div>
          <h2 className="text-lg font-semibold">Как это работает</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Это витрина на примере вымышленной компании — чтобы показать, как SalesPulse
            выглядит в работе. На вашем дашборде здесь будут ваши продажи. Попробуйте
            вживую:
          </p>
        </div>
        <ol className="flex flex-col gap-2 text-sm">
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">1.</span>
            <span>Наведите курсор на графики — увидите точные суммы по месяцам, менеджерам и регионам.</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">2.</span>
            <span>Посмотрите воронку продаж — на каком этапе клиенты «отваливаются».</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">3.</span>
            <span>Полистайте таблицу сделок ниже: поиск, сортировка по клику на заголовок.</span>
          </li>
        </ol>

        <div className="rounded-lg bg-amber-500/10 p-4 text-sm">
          <p className="font-semibold">Зачем загружать свои данные и регистрироваться?</p>
          <ul className="mt-2 flex flex-col gap-1.5 text-zinc-600 dark:text-zinc-300">
            <li>• Здесь вы видите чужую (выдуманную) компанию. Чтобы увидеть <b>свои</b> продажи — нужно загрузить свою выгрузку (Excel / CSV / из CRM).</li>
            <li>• Регистрация нужна, чтобы данные <b>сохранялись</b> и были доступны только вам (никто другой их не видит).</li>
            <li>• Только на своих данных заработают <b>AI-инсайты</b> («почему упала выручка и что делать») и <b>экспорт отчёта в PDF</b>.</li>
          </ul>
        </div>
      </div>

      <Report a={a} />

      <DealsTable rows={rows.map(toTableDeal)} />
    </main>
  );
}
