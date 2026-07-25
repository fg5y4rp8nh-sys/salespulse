import { Show, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      {/* Анимированный минималистичный фон */}
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-grid" />
        <div
          className="hero-blob"
          style={{ width: 420, height: 420, top: "-6%", left: "8%", background: "#2a78d6", animationDelay: "0s" }}
        />
        <div
          className="hero-blob"
          style={{ width: 380, height: 380, bottom: "-8%", right: "6%", background: "#1baf7a", animationDelay: "-6s" }}
        />
        <div
          className="hero-blob"
          style={{ width: 320, height: 320, top: "30%", left: "45%", background: "#4a3aa7", animationDelay: "-12s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white/70 backdrop-blur">
          B2B-аналитика продаж с AI
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl">
          Аналитика продаж с AI-инсайтами
        </h1>
        <p className="max-w-md text-lg text-zinc-300">
          SalesPulse собирает ваши продажи в наглядный дашборд и подсказывает,
          что упало и почему.
        </p>

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
