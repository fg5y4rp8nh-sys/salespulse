"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { deals, insights, targets } from "@/db/schema";

// Серверное действие: добавляет сделку текущего пользователя.
export async function addDeal(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Не авторизован");

  const customer = String(formData.get("customer") ?? "").trim();
  const manager = String(formData.get("manager") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const amount = String(formData.get("amount") ?? "").trim();
  const status = String(formData.get("status") ?? "open");
  const dealDateRaw = String(formData.get("dealDate") ?? "").trim();

  if (!customer || !amount) return;

  const isClosed = status === "won" || status === "lost";

  await db.insert(deals).values({
    userId,
    customer,
    manager,
    region,
    amount, // numeric в Drizzle принимается строкой
    status,
    stage: isClosed ? "closed" : "lead",
    probability: status === "won" ? 100 : status === "lost" ? 0 : 20,
    dealDate: dealDateRaw ? new Date(dealDateRaw) : new Date(),
    closedAt: isClosed ? new Date() : null,
  });

  revalidatePath("/dashboard");
}

// Серверное действие: удаляет ВСЕ данные текущего пользователя.
// activities удаляются автоматически (каскад по FK при удалении сделок).
export async function resetAll() {
  const { userId } = await auth();
  if (!userId) throw new Error("Не авторизован");

  await db.delete(deals).where(eq(deals.userId, userId));
  await db.delete(insights).where(eq(insights.userId, userId));
  await db.delete(targets).where(eq(targets.userId, userId));

  revalidatePath("/dashboard");
}
