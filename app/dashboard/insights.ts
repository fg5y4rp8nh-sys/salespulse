"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/db";
import { deals } from "@/db/schema";

export type InsightResult = { ok: true; text: string } | { ok: false; error: string };

// Серверное действие: анализирует сделки пользователя через Gemini.
export async function getInsights(): Promise<InsightResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Не авторизован" };

  const rows = await db.select().from(deals).where(eq(deals.userId, userId));

  if (rows.length === 0) {
    return { ok: false, error: "Нет сделок для анализа — добавьте хотя бы одну." };
  }

  // Компактная сводка для модели.
  const summary = rows
    .map((d) => `- ${d.customer}: ${d.amount} руб, статус ${d.status}`)
    .join("\n");

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `Ты — аналитик продаж. Вот сделки пользователя:\n\n${summary}\n\nДай краткий анализ (3-5 пунктов) на русском: сильные стороны, риски и конкретные рекомендации, что улучшить. Пиши по делу, без воды.`,
    });
    return { ok: true, text: response.text ?? "Пустой ответ модели." };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Неизвестная ошибка";
    return { ok: false, error: `Gemini недоступен: ${msg}` };
  }
}
