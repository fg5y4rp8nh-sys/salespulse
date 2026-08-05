import Link from "next/link";
import { cookies } from "next/headers";
import type { Deal } from "@/db/schema";
import { analyze } from "@/lib/analytics";
import { normalizeLocale, getDict } from "@/lib/i18n";
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

const STAGES = ["lead", "qualified", "proposal", "negotiation", "closed"];

// Вымышленные данные под язык интерфейса.
const DEMO_DATA = {
  ru: {
    managers: ["Иванов", "Петрова", "Смирнов", "Козлова"],
    regions: ["Москва", "Санкт-Петербург", "Юг", "Урал"],
    customers: [
      "ООО Ромашка", "ЗАО Вектор", "ИП Сидоров", "ООО Технопарк", "АО Логистик",
      "ООО Медтех", "ЗАО Строймир", "ООО Агротрейд", "АО Финанс", "ООО Ритейл",
      "ЗАО Энергия", "ООО Гефест", "АО Транзит", "ООО Стандарт", "АО Прогресс",
    ],
  },
  en: {
    managers: ["J. Miller", "S. Carter", "D. Wilson", "A. Brooks"],
    regions: ["North", "South", "East", "West"],
    customers: [
      "Acme Corp", "Vertex Ltd", "Northwind Inc", "TechPark LLC", "Logistix Co",
      "MedTech Group", "BuildRight Ltd", "AgroTrade Inc", "FinCore AG", "RetailOne",
      "Energex Ltd", "Hephaestus Co", "Transit Global", "Standard Systems", "Progress Labs",
    ],
  },
} as const;

// Детерминированно генерируем ~40 сделок вымышленной компании.
function demoSeeds(locale: "en" | "ru"): Seed[] {
  const { managers: MANAGERS, regions: REGIONS, customers: CUSTOMERS } =
    DEMO_DATA[locale] ?? DEMO_DATA.en;
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
      amount: (r(20) + 3) * (locale === "ru" ? 25000 : 500),
      status,
      stage,
      month: (i % 6) + 1,
    });
  }
  return seeds;
}

function toDeal(s: Seed, id: number, currency: string): Deal {
  const dealDate = new Date(2026, s.month - 1, ((id * 7) % 27) + 1);
  const isClosed = s.status === "won" || s.status === "lost";
  return {
    id,
    userId: "demo",
    customer: s.customer,
    manager: s.manager,
    region: s.region,
    amount: String(s.amount),
    currency,
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

export default async function DemoPage() {
  const locale = normalizeLocale((await cookies()).get("locale")?.value);
  const t = getDict(locale);
  const currency = locale === "ru" ? "RUB" : "USD";
  const rows = demoSeeds(locale).map((s, i) => toDeal(s, i, currency));
  const a = analyze(rows, locale);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <p className="text-sm font-semibold">{t.demoMode}</p>
        <Link
          href="/dashboard"
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          {t.demoUpload}
        </Link>
      </div>

      <h1 className="text-2xl font-semibold">{t.demoHeading}</h1>

      {/* How to use and why register */}
      <div className="flex flex-col gap-4 rounded-xl border border-black/10 p-5 dark:border-white/10">
        <div>
          <h2 className="text-lg font-semibold">{t.demoHowTitle}</h2>
          <p className="mt-1 text-sm text-zinc-500">{t.demoHowLead}</p>
        </div>
        <ol className="flex flex-col gap-2 text-sm">
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">1.</span>
            <span>{t.demoStep1}</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">2.</span>
            <span>{t.demoStep2}</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">3.</span>
            <span>{t.demoStep3}</span>
          </li>
        </ol>

        <div className="rounded-lg bg-amber-500/10 p-4 text-sm">
          <p className="font-semibold">{t.demoWhyTitle}</p>
          <ul className="mt-2 flex flex-col gap-1.5 text-zinc-600 dark:text-zinc-300">
            <li>• {t.demoWhy1}</li>
            <li>• {t.demoWhy2}</li>
            <li>• {t.demoWhy3}</li>
          </ul>
        </div>
      </div>

      <Report a={a} t={t} />

      <DealsTable rows={rows.map(toTableDeal)} />
    </main>
  );
}
