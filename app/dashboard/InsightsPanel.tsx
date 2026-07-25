"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { getInsights } from "./insights";

type HistoryItem = { id: number; content: string; createdAt: string };

export function InsightsPanel({ history = [] }: { history?: HistoryItem[] }) {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isPending, startTransition] = useTransition();
  const params = useSearchParams();

  function run() {
    setError(null);
    startTransition(async () => {
      const res = await getInsights({
        period: params.get("period") ?? undefined,
        manager: params.get("manager") ?? undefined,
        region: params.get("region") ?? undefined,
        status: params.get("status") ?? undefined,
      });
      if (res.ok) {
        setText(res.text);
      } else {
        setError(res.error);
        setText(null);
      }
    });
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">AI-инсайты</h2>
        <button
          onClick={run}
          disabled={isPending}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {isPending ? "Анализирую…" : "Получить инсайты"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {text && (
        <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
          {text}
        </p>
      )}
      {!text && !error && !isPending && (
        <p className="text-sm text-zinc-500">
          Нажмите кнопку — Gemini проанализирует ваши сделки.
        </p>
      )}

      {history.length > 0 && (
        <div className="border-t border-black/10 pt-3 dark:border-white/10">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="text-sm text-zinc-500 hover:text-foreground"
          >
            {showHistory ? "Скрыть историю" : `История инсайтов (${history.length})`}
          </button>
          {showHistory && (
            <ul className="mt-3 flex flex-col gap-3">
              {history.map((h) => (
                <li key={h.id} className="rounded-lg bg-black/[.03] p-3 text-sm dark:bg-white/[.04]">
                  <div className="mb-1 text-xs text-zinc-500">
                    {new Date(h.createdAt).toLocaleString("ru-RU")}
                  </div>
                  <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                    {h.content}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
