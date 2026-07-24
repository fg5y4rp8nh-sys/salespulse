"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { deals } from "@/db/schema";

// Серверное действие: добавляет сделку текущего пользователя.
export async function addDeal(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Не авторизован");

  const customer = String(formData.get("customer") ?? "").trim();
  const amount = String(formData.get("amount") ?? "").trim();
  const status = String(formData.get("status") ?? "open");

  if (!customer || !amount) return;

  await db.insert(deals).values({
    userId,
    customer,
    amount, // numeric в Drizzle принимается строкой
    status,
    closedAt: status === "won" || status === "lost" ? new Date() : null,
  });

  revalidatePath("/dashboard");
}
