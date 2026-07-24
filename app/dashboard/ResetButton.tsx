"use client";

import { useState, useTransition } from "react";
import { resetAll } from "./actions";

export function ResetButton() {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md border border-red-600/40 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-600/10"
      >
        Сбросить всё
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-zinc-500">Удалить все сделки и данные?</span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => resetAll())}
        className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Удаляю…" : "Да, удалить"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-md border border-black/15 px-3 py-1.5 font-medium dark:border-white/15"
      >
        Отмена
      </button>
    </div>
  );
}
