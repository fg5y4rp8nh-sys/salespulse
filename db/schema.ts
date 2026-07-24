import {
  pgTable,
  serial,
  integer,
  text,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────────────────────
// Сделки (deals) — центральная сущность.
// ─────────────────────────────────────────────────────────────
export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  // ID пользователя из Clerk — чтобы каждый видел только свои сделки.
  userId: text("user_id").notNull(),
  customer: text("customer").notNull(), // название клиента/компании
  manager: text("manager").notNull().default(""), // ответственный менеджер
  region: text("region").notNull().default(""), // регион сделки
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(), // сумма
  currency: text("currency").notNull().default("RUB"), // валюта сделки

  status: text("status").notNull().default("open"), // open | won | lost

  // Воронка продаж: lead → qualified → proposal → negotiation → closed
  stage: text("stage").notNull().default("lead"),
  // Когда сделка последний раз меняла этап — основа для pipeline velocity.
  stageChangedAt: timestamp("stage_changed_at").notNull().defaultNow(),

  // Прогнозирование: вероятность выигрыша (0–100) и ожидаемая дата закрытия.
  probability: integer("probability").notNull().default(0),
  expectedCloseDate: timestamp("expected_close_date"),

  // AI-оценка «здоровья» сделки 0–100 (риск-скоринг 2026). null = ещё не считали.
  healthScore: integer("health_score"),

  source: text("source").notNull().default(""), // канал/источник (атрибуция)
  lostReason: text("lost_reason"), // причина проигрыша (если lost)

  // Сигнал вовлечённости — дата последнего касания по сделке.
  lastActivityAt: timestamp("last_activity_at"),

  dealDate: timestamp("deal_date").notNull().defaultNow(), // дата сделки (из CSV)
  closedAt: timestamp("closed_at"), // когда сделка закрыта
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;

// ─────────────────────────────────────────────────────────────
// Активности (activities) — касания по сделке: звонок/письмо/встреча.
// Основа для метрик вовлечённости и активности менеджеров.
// ─────────────────────────────────────────────────────────────
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  dealId: integer("deal_id")
    .notNull()
    .references(() => deals.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // call | email | meeting | note
  note: text("note").notNull().default(""),
  occurredAt: timestamp("occurred_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

// ─────────────────────────────────────────────────────────────
// Планы/квоты (targets) — цель по менеджеру за период.
// Основа для метрики «выполнение плана» (quota attainment).
// ─────────────────────────────────────────────────────────────
export const targets = pgTable("targets", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  manager: text("manager").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  targetAmount: numeric("target_amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Target = typeof targets.$inferSelect;
export type NewTarget = typeof targets.$inferInsert;

// ─────────────────────────────────────────────────────────────
// AI-инсайты (insights) — сохранённые ответы Gemini с датой,
// чтобы не терять их и показывать историю.
// ─────────────────────────────────────────────────────────────
export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(), // текст инсайта от Gemini
  model: text("model").notNull().default(""), // какая модель сгенерировала
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Insight = typeof insights.$inferSelect;
export type NewInsight = typeof insights.$inferInsert;
