"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "./I18nProvider";

export function LangToggle() {
  const locale = useLocale();
  const router = useRouter();

  function switchTo(next: "en" | "ru") {
    document.cookie = `locale=${next};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center rounded-full border border-black/15 text-xs font-medium dark:border-white/20">
      {(["en", "ru"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-pressed={locale === l}
          className={`rounded-full px-2.5 py-1 uppercase transition-colors ${
            locale === l ? "bg-foreground text-background" : "text-zinc-500"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
