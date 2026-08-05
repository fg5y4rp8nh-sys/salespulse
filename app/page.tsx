import { Show, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale, getDict } from "@/lib/i18n";
import { TypeIn } from "./TypeIn";

export default async function Home() {
  const t = getDict(normalizeLocale((await cookies()).get("locale")?.value));

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      {/* Animated minimalist background */}
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-grid" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <span
          className="rise-in rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white/70 backdrop-blur"
          style={{ animationDelay: "0.05s" }}
        >
          {t.heroBadge}
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl">
          <TypeIn text={t.heroTitle} />
        </h1>
        <p
          className="rise-in max-w-xl text-lg leading-relaxed text-zinc-300"
          style={{ animationDelay: "0.9s" }}
        >
          {t.heroDescBefore}
          <span className="text-white">{t.heroDescHighlight}</span>
          {t.heroDescAfter}
        </p>

        <div
          className="rise-in flex flex-wrap items-center justify-center gap-2 text-sm text-zinc-400"
          style={{ animationDelay: "1.1s" }}
        >
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{t.chipMetrics}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{t.chipFunnel}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{t.chipAI}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{t.chipPdf}</span>
        </div>

        <div
          className="rise-in mt-2 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "1.3s" }}
        >
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="rounded-full bg-white px-6 py-3 text-base font-medium text-black transition-transform hover:scale-[1.03]">
                {t.ctaStart}
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="rounded-full bg-white px-6 py-3 text-base font-medium text-black transition-transform hover:scale-[1.03]"
            >
              {t.ctaOpen}
            </Link>
          </Show>
          <Link
            href="/demo"
            className="rounded-full border border-white/25 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-white/10"
          >
            {t.ctaDemo}
          </Link>
        </div>
      </div>
    </main>
  );
}
