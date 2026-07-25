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
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <p className="text-sm">
          <span className="font-semibold">Демо-режим.</span> Данные вымышленные, ничего
          не сохраняется.
        </p>
        <Link
          href="/dashboard"
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Загрузить свои данные →
        </Link>
      </div>

      <h1 className="text-2xl font-semibold">Дашборд · Демо-компания</h1>

      <Report a={a} />

      <DealsTable rows={rows.map(toTableDeal)} />
    </main>
  );
}
