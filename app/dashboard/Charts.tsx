"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export type MonthPoint = { month: string; revenue: number };
export type ManagerPoint = { manager: string; revenue: number };
export type RegionPoint = { region: string; value: number };

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

// Компактный, узкий и предсказуемый по ширине формат чисел.
function short(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + " млрд";
  if (abs >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + " млн";
  if (abs >= 1e3) return Math.round(n / 1e3) + " тыс";
  return String(Math.round(n));
}
const shortVal = (v: unknown) => short(Number(v));
// Полный формат для подсказок.
const full = (v: unknown) => new Intl.NumberFormat("ru-RU").format(Number(v)) + " ₽";

const tooltipStyle = {
  background: "var(--background)",
  border: "1px solid rgba(128,128,128,.3)",
  borderRadius: 8,
  fontSize: 13,
  color: "var(--foreground)",
};
const axisTick = { fontSize: 11, fill: "currentColor" };

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10">
      <h3 className="text-sm font-semibold text-zinc-500">{title}</h3>
      <div className="h-72 w-full text-zinc-500">{children}</div>
    </div>
  );
}

export function Charts({
  revenueByMonth,
  topManagers,
  byRegion,
}: {
  revenueByMonth: MonthPoint[];
  topManagers: ManagerPoint[];
  byRegion: RegionPoint[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Выручка по месяцам — линия */}
      <div className="lg:col-span-2">
        <Card title="Выручка по месяцам">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueByMonth} margin={{ top: 8, right: 24, bottom: 4, left: 8 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={false} interval={0} minTickGap={0} padding={{ left: 6, right: 6 }} />
              <YAxis tickFormatter={shortVal} tick={axisTick} tickLine={false} axisLine={false} width={64} />
              <Tooltip contentStyle={tooltipStyle} formatter={full} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Выручка"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                fill="url(#revFill)"
                dot={{ r: 3, strokeWidth: 0, fill: "var(--chart-1)" }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Топ-5 менеджеров — столбцы */}
      <Card title="Топ-5 менеджеров по выручке">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topManagers} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="manager" tick={axisTick} tickLine={false} axisLine={false} interval={0} />
            <YAxis tickFormatter={shortVal} tick={axisTick} tickLine={false} axisLine={false} width={64} />
            <Tooltip contentStyle={tooltipStyle} formatter={full} cursor={{ fill: "var(--chart-grid)" }} />
            <Bar dataKey="revenue" name="Выручка" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={64} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* По регионам — круговая */}
      <Card title="Выручка по регионам">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <Pie
              data={byRegion}
              dataKey="value"
              nameKey="region"
              cx="50%"
              cy="45%"
              outerRadius="72%"
              label={(p: { percent?: number }) =>
                p.percent && p.percent > 0.05 ? `${Math.round(p.percent * 100)}%` : ""
              }
              labelLine={false}
            >
              {byRegion.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="var(--background)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={full} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
