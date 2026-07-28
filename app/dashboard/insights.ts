"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq, gte } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/db";
import { deals, insights } from "@/db/schema";

export type InsightResult = { ok: true; text: string } | { ok: false; error: string };

export type InsightFilters = {
  locale?: "en" | "ru";
  period?: string;
  manager?: string;
  region?: string;
  status?: string;
};

const MODEL = "gemini-flash-latest";

// Анализирует сделки пользователя (с учётом фильтров) через Gemini и сохраняет результат.
export async function getInsights(filters: InsightFilters = {}): Promise<InsightResult> {
  const ru = filters.locale === "ru";
  const { userId } = await auth();
  if (!userId) return { ok: false, error: ru ? "Не авторизован" : "Not authorized" };

  const conds = [eq(deals.userId, userId)];
  if (filters.status) conds.push(eq(deals.status, filters.status));
  if (filters.manager) conds.push(eq(deals.manager, filters.manager));
  if (filters.region) conds.push(eq(deals.region, filters.region));
  const days = filters.period && filters.period !== "all" ? Number(filters.period) : null;
  if (days) conds.push(gte(deals.dealDate, new Date(Date.now() - days * 86400000)));

  const rows = await db.select().from(deals).where(and(...conds));
  if (rows.length === 0) {
    return {
      ok: false,
      error: ru
        ? "Нет сделок для анализа — измените фильтры или добавьте данные."
        : "No deals to analyze — change filters or add data.",
    };
  }

  // Богатая сводка: с менеджером, регионом, датой и этапом.
  const summary = rows
    .slice(0, 400)
    .map(
      (d) =>
        `${d.dealDate.toISOString().slice(0, 10)} | ${d.customer} | менеджер ${d.manager || "—"} | регион ${d.region || "—"} | ${d.amount} ${d.currency} | этап ${d.stage} | ${d.status}`,
    )
    .join("\n");

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const prompt = ru
      ? `Ты — аналитик продаж. Данные сделок (дата | клиент | менеджер | регион | сумма | этап | статус):\n\n${summary}\n\nДай 3–5 конкретных инсайтов на русском. Опирайся на менеджеров, регионы и динамику по датам: где просадка и ПОЧЕМУ (какой менеджер/регион), что улучшить. Формулируй как «проблема → причина → рекомендация». Кратко, по делу.`
      : `You are a sales analyst. Deal data (date | customer | manager | region | amount | stage | status):\n\n${summary}\n\nGive 3–5 concrete insights in English. Rely on managers, regions and date trends: where the drop is and WHY (which manager/region), what to improve. Format as "problem → cause → recommendation". Short and to the point.`;

    const response = await ai.models.generateContent({ model: MODEL, contents: prompt });

    const text = response.text ?? (ru ? "Пустой ответ модели." : "Empty model response.");
    // Сохраняем инсайт в историю.
    await db.insert(insights).values({ userId, content: text, model: MODEL });
    return { ok: true, text };
  } catch (e) {
    const msg = e instanceof Error ? e.message : ru ? "Неизвестная ошибка" : "Unknown error";
    return { ok: false, error: `${ru ? "Gemini недоступен" : "Gemini unavailable"}: ${msg}` };
  }
}
