import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <main className="flex flex-1 flex-col gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold">Дашборд</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Привет, {user?.firstName ?? user?.emailAddresses[0]?.emailAddress}! Скоро
        здесь появятся метрики продаж и AI-инсайты.
      </p>
    </main>
  );
}
