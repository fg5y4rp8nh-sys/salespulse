// Чистые помощники форматирования — безопасны и на сервере, и на клиенте.

export const money = (n: number, currency = "RUB") =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);

// Только классы цвета для статусов (подписи берутся из словаря локали).
export const STATUS_CLS: Record<string, string> = {
  won: "bg-green-500/15 text-green-600",
  lost: "bg-red-500/15 text-red-600",
  open: "bg-amber-500/15 text-amber-600",
};
