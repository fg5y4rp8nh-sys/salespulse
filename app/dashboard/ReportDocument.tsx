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
} from "recharts";
import type { Analytics } from "@/lib/analytics";
import { money } from "./reportClient";

// Фиксированная светлая палитра — отчёт всегда выглядит одинаково, независимо от темы.
const INK = "#0f172a";
const MUTED = "#64748b";
const LINE = "#e2e8f0";
const ACCENT = "#2a78d6";
const PIE = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#4a3aa7"];

const short = (n: number) => {
  const a = Math.abs(n);
  if (a >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + " млн";
  if (a >= 1e3) return Math.round(n / 1e3) + " тыс";
  return String(Math.round(n));
};

const STAGE_LABELS: Record<string, string> = {
  lead: "Лид",
  qualified: "Квалификация",
  proposal: "Предложение",
  negotiation: "Переговоры",
  closed: "Закрытие",
};
const STAGE_ORDER = ["lead", "qualified", "proposal", "negotiation", "closed"];

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ flex: 1, border: `1px solid ${LINE}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 12, color: MUTED }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: INK }}>{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

export function ReportDocument({
  a,
  meta,
}: {
  a: Analytics;
  meta: { date: string; scope: string };
}) {
  const funnel = STAGE_ORDER.map((stage, i) => {
    const reached = STAGE_ORDER.slice(i).reduce((s, st) => s + (a.stageCounts[st] ?? 0), 0);
    return { stage, label: STAGE_LABELS[stage], count: reached };
  });
  const funnelMax = funnel[0]?.count || 1;

  return (
    <div
      style={{
        width: 820,
        background: "#ffffff",
        color: INK,
        fontFamily: "ui-sans-serif, system-ui, -apple-system, Arial, sans-serif",
        padding: 0,
      }}
    >
      {/* Шапка */}
      <div
        style={{
          background: `linear-gradient(90deg, ${ACCENT}, #1f5fb0)`,
          color: "#fff",
          padding: "22px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 0.2 }}>SalesPulse</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>Отчёт по продажам</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 12, opacity: 0.95 }}>
          <div>{meta.date}</div>
          <div>{meta.scope}</div>
        </div>
      </div>

      <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
        {/* KPI */}
        <div style={{ display: "flex", gap: 12 }}>
          <Kpi label="Выручка" value={money(a.wonRevenue, a.mainCurrency)} />
          <Kpi label="Всего сделок" value={String(a.dealCount)} />
          <Kpi label="Средний чек" value={money(a.avgCheck, a.mainCurrency)} />
          <Kpi label="Конверсия" value={`${a.conversion}%`} />
        </div>

        {/* Выручка по месяцам */}
        <Section title="Выручка по месяцам">
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={a.revenueByMonth} margin={{ top: 6, right: 16, bottom: 0, left: 4 }}>
                <defs>
                  <linearGradient id="repRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={LINE} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: MUTED }} tickLine={false} axisLine={false} interval={0} />
                <YAxis tickFormatter={(v) => short(Number(v))} tick={{ fontSize: 11, fill: MUTED }} tickLine={false} axisLine={false} width={60} />
                <Area type="monotone" dataKey="revenue" stroke={ACCENT} strokeWidth={2.5} fill="url(#repRev)" dot={{ r: 3, fill: ACCENT, strokeWidth: 0 }} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* Два графика в ряд */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Section title="Топ-5 менеджеров">
              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={a.topManagers} margin={{ top: 6, right: 8, bottom: 0, left: 4 }}>
                    <CartesianGrid stroke={LINE} vertical={false} />
                    <XAxis dataKey="manager" tick={{ fontSize: 11, fill: MUTED }} tickLine={false} axisLine={false} interval={0} />
                    <YAxis tickFormatter={(v) => short(Number(v))} tick={{ fontSize: 11, fill: MUTED }} tickLine={false} axisLine={false} width={56} />
                    <Bar dataKey="revenue" fill={ACCENT} radius={[4, 4, 0, 0]} maxBarSize={48} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Section>
          </div>
          <div style={{ flex: 1 }}>
            <Section title="Выручка по регионам">
              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={a.byRegion}
                      dataKey="value"
                      nameKey="region"
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      isAnimationActive={false}
                      label={(p: { region?: string; percent?: number }) =>
                        p.percent && p.percent > 0.06 ? `${p.region} ${Math.round(p.percent * 100)}%` : ""
                      }
                      labelLine={false}
                      style={{ fontSize: 11, fill: INK }}
                    >
                      {a.byRegion.map((_, i) => (
                        <Cell key={i} fill={PIE[i % PIE.length]} stroke="#fff" strokeWidth={2} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Section>
          </div>
        </div>

        {/* Воронка */}
        <Section title="Воронка продаж">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {funnel.map(({ stage, label, count }, i) => {
              const pct = Math.round((count / funnelMax) * 100);
              const prev = i > 0 ? funnel[i - 1].count : count;
              const conv = i > 0 && prev > 0 ? Math.round((count / prev) * 100) : null;
              return (
                <div key={stage} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 110, fontSize: 13, color: MUTED }}>{label}</div>
                  <div style={{ flex: 1, height: 26, background: "#f1f5f9", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ width: `${Math.max(pct, 2)}%`, height: "100%", background: ACCENT, borderRadius: 6 }} />
                  </div>
                  <div style={{ width: 44, textAlign: "right", fontSize: 13, fontWeight: 600 }}>{count}</div>
                  <div style={{ width: 44, textAlign: "right", fontSize: 12, color: MUTED }}>
                    {conv != null ? `${conv}%` : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <div style={{ fontSize: 11, color: MUTED, textAlign: "center", paddingTop: 4 }}>
          Сформировано в SalesPulse · {meta.date}
        </div>
      </div>
    </div>
  );
}
