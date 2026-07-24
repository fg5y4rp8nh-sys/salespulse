import { Show, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-6 text-center dark:bg-black">
      <h1 className="max-w-xl text-4xl font-semibold tracking-tight">
        Аналитика продаж с AI-инсайтами
      </h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        SalesPulse собирает ваши данные продаж в наглядный дашборд и подсказывает,
        что улучшить.
      </p>

      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="rounded-full bg-foreground px-6 py-3 text-base font-medium text-background">
            Войти, чтобы начать
          </button>
        </SignInButton>
      </Show>

      <Show when="signed-in">
        <Link
          href="/dashboard"
          className="rounded-full bg-foreground px-6 py-3 text-base font-medium text-background"
        >
          Открыть дашборд
        </Link>
      </Show>
    </main>
  );
}
