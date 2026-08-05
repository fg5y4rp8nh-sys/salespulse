"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { useLocale } from "./I18nProvider";
import type { Locale } from "@/lib/i18n";

export function LangToggle() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Подсветка переключается сразу по клику, не дожидаясь перерисовки страницы.
  const [shown, setShown] = useOptimistic<Locale, Locale>(locale, (_, next) => next);

  function switchTo(next: Locale) {
    if (next === locale) return;
    document.cookie = `locale=${next};path=/;max-age=31536000;samesite=lax`;
    startTransition(() => {
      setShown(next);
      router.refresh();
    });
  }

  return (
    <div
      className={`flex items-center rounded-full border border-black/15 text-xs font-medium dark:border-white/20 ${
        isPending ? "opacity-70" : ""
      }`}
    >
      {(["en", "ru"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-pressed={shown === l}
          className={`rounded-full px-2.5 py-1 uppercase ${
            shown === l ? "bg-foreground text-background" : "text-zinc-500 hover:text-foreground"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
