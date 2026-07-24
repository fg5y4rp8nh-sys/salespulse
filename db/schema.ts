import {
  pgTable,
  serial,
  text,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

// Таблица сделок продаж. Каждая строка = одна сделка.
export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  // ID пользователя из Clerk — чтобы каждый видел только свои сделки.
  userId: text("user_id").notNull(),
  customer: text("customer").notNull(), // название клиента/компании
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(), // сумма сделки
  status: text("status").notNull().default("open"), // open | won | lost
  closedAt: timestamp("closed_at"), // когда сделка закрыта (если закрыта)
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Типы, выведенные из схемы — пригодятся в коде.
export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;
