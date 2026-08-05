import type { Analytics } from "@/lib/analytics";
import type { Dictionary } from "@/lib/i18n";
import { Charts } from "./Charts";
import { Funnel } from "./Funnel";
import { money } from "./reportClient";

function Metric({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: number | null;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-black/10 p-4 text-center dark:border-white/10">
      <div className="truncate text-sm text-zinc-500">{label}</div>
      <div className="mt-1 flex flex-wrap items-baseline justify-center gap-x-2">
        <span className="text-xl font-semibold tabular-nums sm:text-2xl">{value}</span>
        {delta != null && (
          <span
            className={`text-sm font-medium ${
              delta >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {delta >= 0 ? "+" : ""}
            {delta}%
          </span>
        )}
      </div>
    </div>
  );
}

// Блок отчёта: метрики + графики + воронка. Идёт внутрь PDF (id="report").
export function Report({
  a,
  t,
  deltaPct,
}: {
  a: Analytics;
  t: Dictionary;
  deltaPct?: number | null;
}) {
  return (
    <div id="report" className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label={t.mRevenue} value={money(a.wonRevenue, a.mainCurrency)} delta={deltaPct} />
        <Metric label={t.mDeals} value={String(a.dealCount)} />
        <Metric label={t.mAvg} value={money(a.avgCheck, a.mainCurrency)} />
        <Metric label={t.mConversion} value={`${a.conversion}%`} />
      </div>

      {a.won.length > 0 && (
        <Charts
          revenueByMonth={a.revenueByMonth}
          topManagers={a.topManagers}
          byRegion={a.byRegion}
          currency={a.mainCurrency}
        />
      )}

      {a.dealCount > 0 && <Funnel stageCounts={a.stageCounts} t={t} />}
    </div>
  );
}
