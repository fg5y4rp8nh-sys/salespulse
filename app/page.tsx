import { Show, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      {/* Анимированный минималистичный фон */}
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-grid" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Логотип-вордмарк (Heavy Impact) */}
        <div className="text-5xl font-black uppercase tracking-[-0.04em] text-white sm:text-7xl">
          SalesPulse
        </div>
        <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white/70 backdrop-blur">
          B2B-аналитика продаж с AI
        </span>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-white text-balance sm:text-4xl">
          Аналитика продаж с AI-инсайтами
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-zinc-300">
          SalesPulse превращает вашу выгрузку продаж из Excel, CSV или CRM в готовый
          дашборд за 30 секунд: ключевые метрики, графики, воронка сделок — и AI, который
          человеческим языком объясняет, <span className="text-white">что изменилось и почему</span>,
          и что с этим делать. Больше не нужно вручную сводить таблицы.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-zinc-400">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">📊 Метрики и графики</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">🔻 Воронка продаж</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">🤖 AI-инсайты</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">📄 Отчёт в PDF</span>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="rounded-full bg-white px-6 py-3 text-base font-medium text-black transition-transform hover:scale-[1.03]">
                Войти, чтобы начать
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="rounded-full bg-white px-6 py-3 text-base font-medium text-black transition-transform hover:scale-[1.03]"
            >
              Открыть дашборд
            </Link>
          </Show>
          <Link
            href="/demo"
            className="rounded-full border border-white/25 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-white/10"
          >
            Посмотреть демо-версию
          </Link>
        </div>
      </div>
    </main>
  );
}
