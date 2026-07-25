"use client";

import { useMemo, useState, useTransition } from "react";
import { deleteDeal } from "./actions";
import { money, STATUS } from "./reportClient";

export type TableDeal = {
  id: number;
  dealDate: string; // ISO
  customer: string;
  manager: string;
  region: string;
  amount: number;
  currency: string;
  status: string;
};

type SortKey = "dealDate" | "customer" | "manager" | "region" | "amount";

const COLS: { key: SortKey; label: string }[] = [
  { key: "dealDate", label: "Дата" },
  { key: "customer", label: "Клиент" },
  { key: "manager", label: "Менеджер" },
  { key: "region", label: "Регион" },
  { key: "amount", label: "Сумма" },
];

const MAX_ROWS = 100;

export function DealsTable({
  rows,
  deletable = false,
}: {
  rows: TableDeal[];
  deletable?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("dealDate");
  const [asc, setAsc] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? rows.filter(
          (d) =>
            d.customer.toLowerCase().includes(q) ||
            d.manager.toLowerCase().includes(q) ||
            d.region.toLowerCase().includes(q),
        )
      : rows;
    const sorted = [...base].sort((a, b) => {
      let cmp: number;
      if (sortKey === "amount") cmp = a.amount - b.amount;
      else cmp = String(a[sortKey]).localeCompare(String(b[sortKey]), "ru");
      return asc ? cmp : -cmp;
    });
    return sorted;
  }, [rows, query, sortKey, asc]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setAsc((v) => !v);
    else {
      setSortKey(key);
      setAsc(false);
    }
  }

  const visible = filtered.slice(0, MAX_ROWS);

  return (
    <div className="flex flex-col gap-3">
      <input
        placeholder="Поиск по клиенту, менеджеру, региону…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-sm rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/15"
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-zinc-500">
            <tr className="border-b border-black/10 dark:border-white/10">
              {COLS.map((c) => (
                <th key={c.key} className="py-2 pr-4">
                  <button
                    type="button"
                    onClick={() => toggleSort(c.key)}
                    className="font-medium hover:text-foreground"
                  >
                    {c.label}
                    {sortKey === c.key ? (asc ? " ↑" : " ↓") : ""}
                  </button>
                </th>
              ))}
              <th className="py-2 pr-4">Статус</th>
              {deletable && <th className="py-2" />}
            </tr>
          </thead>
          <tbody>
            {visible.map((d) => {
              const st = STATUS[d.status] ?? STATUS.open;
              return (
                <tr key={d.id} className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {new Date(d.dealDate).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="py-2 pr-4">{d.customer}</td>
                  <td className="py-2 pr-4">{d.manager || "—"}</td>
                  <td className="py-2 pr-4">{d.region || "—"}</td>
                  <td className="py-2 pr-4 whitespace-nowrap tabular-nums">
                    {money(d.amount, d.currency)}
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>
                      {st.label}
                    </span>
                  </td>
                  {deletable && (
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => startTransition(() => deleteDeal(d.id))}
                        className="text-zinc-400 transition-colors hover:text-red-600 disabled:opacity-50"
                        aria-label="Удалить сделку"
                        title="Удалить"
                      >
                        ✕
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length > MAX_ROWS && (
        <p className="text-xs text-zinc-500">
          Показаны первые {MAX_ROWS} из {filtered.length} сделок.
        </p>
      )}
      {filtered.length === 0 && (
        <p className="text-sm text-zinc-500">Ничего не найдено.</p>
      )}
    </div>
  );
}
