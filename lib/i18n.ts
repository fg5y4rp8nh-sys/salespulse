export const LOCALES = ["en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function normalizeLocale(v: string | undefined | null): Locale {
  return v === "ru" ? "ru" : "en";
}

const en = {
  // header
  signIn: "Sign in",
  signUp: "Sign up",
  dashboard: "Dashboard",

  // landing
  heroBadge: "B2B sales analytics with AI",
  heroTitle: "Sales analytics with AI insights",
  heroDescBefore:
    "SalesPulse turns your sales export from Excel, CSV or CRM into a ready dashboard in 30 seconds: key metrics, charts, a sales funnel — and AI that explains in plain language ",
  heroDescHighlight: "what changed and why",
  heroDescAfter: ", and what to do about it. No more merging spreadsheets by hand.",
  chipMetrics: "📊 Metrics & charts",
  chipFunnel: "🔻 Sales funnel",
  chipAI: "🤖 AI insights",
  chipPdf: "📄 PDF report",
  ctaStart: "Sign in to start",
  ctaOpen: "Open dashboard",
  ctaDemo: "View demo",

  // metrics
  mRevenue: "Revenue",
  mDeals: "Total deals",
  mAvg: "Average deal",
  mConversion: "Conversion",

  // charts
  chartRevenue: "Revenue by month",
  chartManagers: "Top-5 managers by revenue",
  chartRegions: "Revenue by region",
  seriesRevenue: "Revenue",

  // funnel
  funnelTitle: "Sales funnel",
  funnelDeals: "Deals",
  funnelConv: "Conv.",
  stageLead: "Lead",
  stageQualified: "Qualified",
  stageProposal: "Proposal",
  stageNegotiation: "Negotiation",
  stageClosed: "Closed",

  // filters
  fAllPeriod: "All time",
  f7: "7 days",
  f30: "30 days",
  f90: "90 days",
  fAllManagers: "All managers",
  fAllRegions: "All regions",
  fAllStatuses: "All statuses",
  fReset: "Reset filters",

  // statuses
  stWon: "Won",
  stLost: "Lost",
  stOpen: "Open",

  // import
  impTitle: "Upload file",
  impFormats:
    "CSV, TSV, Excel, ODS, JSON, plus PDF and scans/photos of tables (recognized via AI). You can select several files at once.",
  impImport: "Import",
  impImporting: "Uploading…",
  impDrop: "Drag file here or",
  impChoose: "choose from computer",
  impImported: "Imported",
  impDuplicates: "duplicates skipped",
  impSkipped: "invalid rows",
  impAi: "columns recognized via AI 🤖",

  // insights
  aiTitle: "AI insights",
  aiGet: "Get insights",
  aiAnalyzing: "Analyzing…",
  aiHint: "Click the button — Gemini will analyze your deals.",
  aiHistoryShow: "Insights history",
  aiHistoryHide: "Hide history",

  // manual add
  addCustomer: "Customer",
  addManager: "Manager",
  addRegion: "Region",
  addDate: "Date",
  addAmount: "Amount",
  addStatus: "Status",
  addButton: "Add",

  // deals table
  tblSearch: "Search by customer, manager, region…",
  tblDate: "Date",
  tblCustomer: "Customer",
  tblManager: "Manager",
  tblRegion: "Region",
  tblAmount: "Amount",
  tblStatus: "Status",
  tblShowing: (n: number, total: number) => `Showing first ${n} of ${total} deals.`,
  tblNothing: "Nothing found.",
  tblEdit: "Edit",
  tblDelete: "Delete",
  tblSave: "Save",
  tblCancel: "Cancel",

  // reset / export
  resetAll: "Reset all",
  resetConfirm: "Delete all deals and data?",
  resetYes: "Yes, delete",
  resetCancel: "Cancel",
  exportPdf: "Download report",
  exportBusy: "Preparing PDF…",

  // empty / errors
  noDeals: "No deals yet — add one manually below or upload a file.",
  noDealsFilters: "No deals match the selected filters.",
  dbError: "Couldn't connect to the database. Please refresh the page later.",

  // demo
  demoMode: "Demo mode",
  demoUpload: "Upload your data →",
  demoHeading: "Dashboard · Demo company",
  demoHowTitle: "How it works",
  demoHowLead:
    "This is a showcase using a fictional company — to show how SalesPulse works. On your dashboard you'll see your own sales. Try it live:",
  demoStep1: "Hover over the charts — you'll see exact amounts by month, manager and region.",
  demoStep2: "Look at the sales funnel — where clients drop off.",
  demoStep3: "Browse the deals table below: search, sort by clicking a header.",
  demoWhyTitle: "Why upload your data and register?",
  demoWhy1:
    "Here you see someone else's (fictional) company. To see your own sales, upload your export (Excel / CSV / from a CRM).",
  demoWhy2:
    "Registration keeps your data saved and visible only to you (no one else sees it).",
  demoWhy3:
    "AI insights (\"why revenue dropped and what to do\") and PDF report export only work on your own data.",
} as const;

type Dict = Record<keyof typeof en, string | ((...a: number[]) => string)>;

const ru: Dict = {
  signIn: "Войти",
  signUp: "Регистрация",
  dashboard: "Дашборд",

  heroBadge: "B2B-аналитика продаж с AI",
  heroTitle: "Аналитика продаж с AI-инсайтами",
  heroDescBefore:
    "SalesPulse превращает вашу выгрузку продаж из Excel, CSV или CRM в готовый дашборд за 30 секунд: ключевые метрики, графики, воронка сделок — и AI, который человеческим языком объясняет, ",
  heroDescHighlight: "что изменилось и почему",
  heroDescAfter: ", и что с этим делать. Больше не нужно вручную сводить таблицы.",
  chipMetrics: "📊 Метрики и графики",
  chipFunnel: "🔻 Воронка продаж",
  chipAI: "🤖 AI-инсайты",
  chipPdf: "📄 Отчёт в PDF",
  ctaStart: "Войти, чтобы начать",
  ctaOpen: "Открыть дашборд",
  ctaDemo: "Посмотреть демо-версию",

  mRevenue: "Выручка",
  mDeals: "Всего сделок",
  mAvg: "Средний чек",
  mConversion: "Конверсия",

  chartRevenue: "Выручка по месяцам",
  chartManagers: "Топ-5 менеджеров по выручке",
  chartRegions: "Выручка по регионам",
  seriesRevenue: "Выручка",

  funnelTitle: "Воронка продаж",
  funnelDeals: "Сделок",
  funnelConv: "Переход",
  stageLead: "Лид",
  stageQualified: "Квалификация",
  stageProposal: "Предложение",
  stageNegotiation: "Переговоры",
  stageClosed: "Закрытие",

  fAllPeriod: "Весь период",
  f7: "7 дней",
  f30: "30 дней",
  f90: "90 дней",
  fAllManagers: "Все менеджеры",
  fAllRegions: "Все регионы",
  fAllStatuses: "Все статусы",
  fReset: "Сбросить фильтры",

  stWon: "Выиграна",
  stLost: "Проиграна",
  stOpen: "В работе",

  impTitle: "Загрузка файла",
  impFormats:
    "CSV, TSV, Excel, ODS, JSON, а также PDF и сканы/фото таблиц (распознаём через AI). Можно выбрать несколько файлов сразу.",
  impImport: "Импортировать",
  impImporting: "Загружаю…",
  impDrop: "Перетащите файл сюда или",
  impChoose: "выберите на компьютере",
  impImported: "Импортировано",
  impDuplicates: "дублей пропущено",
  impSkipped: "некорректных строк",
  impAi: "колонки распознаны через AI 🤖",

  aiTitle: "AI-инсайты",
  aiGet: "Получить инсайты",
  aiAnalyzing: "Анализирую…",
  aiHint: "Нажмите кнопку — Gemini проанализирует ваши сделки.",
  aiHistoryShow: "История инсайтов",
  aiHistoryHide: "Скрыть историю",

  addCustomer: "Клиент",
  addManager: "Менеджер",
  addRegion: "Регион",
  addDate: "Дата",
  addAmount: "Сумма",
  addStatus: "Статус",
  addButton: "Добавить",

  tblSearch: "Поиск по клиенту, менеджеру, региону…",
  tblDate: "Дата",
  tblCustomer: "Клиент",
  tblManager: "Менеджер",
  tblRegion: "Регион",
  tblAmount: "Сумма",
  tblStatus: "Статус",
  tblShowing: (n: number, total: number) => `Показаны первые ${n} из ${total} сделок.`,
  tblNothing: "Ничего не найдено.",
  tblEdit: "Редактировать",
  tblDelete: "Удалить",
  tblSave: "Сохранить",
  tblCancel: "Отмена",

  resetAll: "Сбросить всё",
  resetConfirm: "Удалить все сделки и данные?",
  resetYes: "Да, удалить",
  resetCancel: "Отмена",
  exportPdf: "Скачать отчёт",
  exportBusy: "Готовлю PDF…",

  noDeals: "Сделок пока нет — добавьте вручную ниже или загрузите файл.",
  noDealsFilters: "Под выбранные фильтры сделок не нашлось.",
  dbError: "Не удалось подключиться к базе данных. Попробуйте обновить страницу позже.",

  demoMode: "Демо-режим",
  demoUpload: "Загрузить свои данные →",
  demoHeading: "Дашборд · Демо-компания",
  demoHowTitle: "Как это работает",
  demoHowLead:
    "Это витрина на примере вымышленной компании — чтобы показать, как SalesPulse выглядит в работе. На вашем дашборде здесь будут ваши продажи. Попробуйте вживую:",
  demoStep1: "Наведите курсор на графики — увидите точные суммы по месяцам, менеджерам и регионам.",
  demoStep2: "Посмотрите воронку продаж — на каком этапе клиенты «отваливаются».",
  demoStep3: "Полистайте таблицу сделок ниже: поиск, сортировка по клику на заголовок.",
  demoWhyTitle: "Зачем загружать свои данные и регистрироваться?",
  demoWhy1:
    "Здесь вы видите чужую (выдуманную) компанию. Чтобы увидеть свои продажи — загрузите свою выгрузку (Excel / CSV / из CRM).",
  demoWhy2:
    "Регистрация нужна, чтобы данные сохранялись и были доступны только вам (никто другой их не видит).",
  demoWhy3:
    "Только на своих данных заработают AI-инсайты («почему упала выручка и что делать») и экспорт отчёта в PDF.",
};

const DICTS = { en, ru } as const;

export type Dictionary = typeof en;
export function getDict(locale: Locale): Dictionary {
  return (locale === "ru" ? (ru as unknown as Dictionary) : en);
}
