"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useT } from "../I18nProvider";

const selectCls =
  "rounded-md border border-black/15 bg-transparent px-3 py-1.5 text-sm dark:border-white/15";

export function FilterBar({
  managers,
  regions,
}: {
  managers: string[];
  regions: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const t = useT();

  const set = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value === "" || value === "all") next.delete(key);
      else next.set(key, value);
      router.push(`/dashboard?${next.toString()}`);
    },
    [params, router],
  );

  const periods = [
    { value: "all", label: t.fAllPeriod },
    { value: "7", label: t.f7 },
    { value: "30", label: t.f30 },
    { value: "90", label: t.f90 },
  ];

  const hasFilters = ["period", "manager", "region", "status"].some((k) =>
    params.get(k),
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select className={selectCls} value={params.get("period") ?? "all"} onChange={(e) => set("period", e.target.value)}>
        {periods.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>

      <select className={selectCls} value={params.get("manager") ?? "all"} onChange={(e) => set("manager", e.target.value)}>
        <option value="all">{t.fAllManagers}</option>
        {managers.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <select className={selectCls} value={params.get("region") ?? "all"} onChange={(e) => set("region", e.target.value)}>
        <option value="all">{t.fAllRegions}</option>
        {regions.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <select className={selectCls} value={params.get("status") ?? "all"} onChange={(e) => set("status", e.target.value)}>
        <option value="all">{t.fAllStatuses}</option>
        <option value="won">{t.stWon}</option>
        <option value="open">{t.stOpen}</option>
        <option value="lost">{t.stLost}</option>
      </select>

      {hasFilters && (
        <button type="button" onClick={() => router.push("/dashboard")} className="text-sm text-zinc-500 underline">
          {t.fReset}
        </button>
      )}
    </div>
  );
}
