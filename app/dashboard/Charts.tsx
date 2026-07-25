"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
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

const fmt = (n: number) =>
  new Intl.NumberFormat("ru-RU", { notation: "compact" }).format(n);

// Обёртка для tooltip/axis форматтеров Recharts (значение может быть любым).
const fmtVal = (v: unknown) => fmt(Number(v));

const tooltipStyle = {
  background: "var(--background)",
  border: "1px solid rgba(128,128,128,.3)",
  borderRadius: 8,
  fontSize: 13,
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10">
      <h3 className="text-sm font-semibold text-zinc-500">{title}</h3>
      <div className="h-64 w-full">{children}</div>
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
            <LineChart data={revenueByMonth} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "currentColor" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 12, fill: "currentColor" }} tickLine={false} axisLine={false} width={44} />
              <Tooltip contentStyle={tooltipStyle} formatter={fmtVal} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Выручка"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Топ-5 менеджеров — столбцы */}
      <Card title="Топ-5 менеджеров по выручке">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topManagers} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="manager" tick={{ fontSize: 12, fill: "currentColor" }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 12, fill: "currentColor" }} tickLine={false} axisLine={false} width={44} />
            <Tooltip contentStyle={tooltipStyle} formatter={fmtVal} cursor={{ fill: "var(--chart-grid)" }} />
            <Bar dataKey="revenue" name="Выручка" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* По регионам — круговая */}
      <Card title="Выручка по регионам">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={byRegion}
              dataKey="value"
              nameKey="region"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={(props) =>
                (props as { region?: string }).region ?? ""
              }
              labelLine={false}
            >
              {byRegion.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="var(--background)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={fmtVal} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
