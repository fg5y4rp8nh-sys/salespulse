// Чистые помощники форматирования — безопасны и на сервере, и на клиенте.

export const money = (n: number, currency = "RUB") =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);

export const STATUS: Record<string, { label: string; cls: string }> = {
  won: { label: "Выиграна", cls: "bg-green-500/15 text-green-600" },
  lost: { label: "Проиграна", cls: "bg-red-500/15 text-red-600" },
  open: { label: "В работе", cls: "bg-amber-500/15 text-amber-600" },
};
