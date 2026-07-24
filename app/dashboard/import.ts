"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { eq } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/db";
import { deals, type NewDeal } from "@/db/schema";

export type ImportResult =
  | { ok: true; imported: number; skipped: number; duplicates: number; aiUsed: boolean }
  | { ok: false; error: string };

type Row = Record<string, unknown>;

// Наши поля и словарь синонимов заголовков (рус/англ) для быстрого распознавания.
const FIELDS = ["customer", "manager", "region", "source", "amount", "status", "date"] as const;
type Field = (typeof FIELDS)[number];
type Mapping = Partial<Record<Field, string>>; // поле -> имя колонки в файле

const DICTIONARY: Record<Field, string[]> = {
  customer: ["customer", "клиент", "company", "компания", "client", "заказчик"],
  manager: ["manager", "менеджер", "owner", "ответственный", "продавец", "sales rep"],
  region: ["region", "регион", "area", "область", "территория"],
  source: ["source", "источник", "channel", "канал"],
  amount: ["amount", "сумма", "revenue", "выручка", "value", "deal value", "стоимость"],
  status: ["status", "статус", "stage", "этап"],
  date: ["date", "дата", "deal_date", "дата сделки", "created", "closed date"],
};

// ─── Разбор файла в массив строк-объектов ───
async function parseFile(file: File): Promise<Row[]> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".json")) {
    const data = JSON.parse(await file.text());
    if (Array.isArray(data)) return data as Row[];
    if (Array.isArray((data as { data?: unknown }).data))
      return (data as { data: Row[] }).data;
    throw new Error("JSON должен быть массивом объектов.");
  }

  if (name.endsWith(".csv") || name.endsWith(".tsv") || name.endsWith(".txt")) {
    const parsed = Papa.parse<Row>(await file.text(), {
      header: true,
      skipEmptyLines: true,
    });
    if (parsed.errors.length > 0) {
      throw new Error(`Ошибка чтения таблицы: ${parsed.errors[0].message}`);
    }
    return parsed.data;
  }

  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) throw new Error("В файле нет ни одного листа с данными.");
  return XLSX.utils.sheet_to_json<Row>(sheet, { defval: "", raw: false });
}

// Сопоставление по словарю (быстро, без AI).
function mapByDictionary(headers: string[]): Mapping {
  const map: Mapping = {};
  for (const field of FIELDS) {
    const hit = headers.find((h) =>
      DICTIONARY[field].includes(h.trim().toLowerCase()),
    );
    if (hit) map[field] = hit;
  }
  return map;
}

// Сопоставление через Gemini: отправляем ТОЛЬКО заголовки, получаем карту полей.
async function mapByAI(headers: string[]): Promise<Mapping> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Есть таблица продаж с такими заголовками колонок: ${JSON.stringify(headers)}.
Сопоставь каждому нашему полю подходящий заголовок из списка (или пустую строку, если подходящего нет).
Поля: customer (клиент/компания), manager (менеджер/владелец сделки), region (регион),
source (источник/канал сделки), amount (сумма/стоимость сделки), status (статус: выиграна/проиграна/в работе),
date (дата сделки).
Верни СТРОГО JSON без пояснений вида:
{"customer":"","manager":"","region":"","source":"","amount":"","status":"","date":""}
Значения — точные заголовки из списка выше.`;

  const res = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  const parsed = JSON.parse(res.text ?? "{}") as Record<string, string>;
  const map: Mapping = {};
  for (const field of FIELDS) {
    const header = parsed[field];
    // Берём только если такой заголовок реально есть в файле.
    if (header && headers.includes(header)) map[field] = header;
  }
  return map;
}

function valueOf(row: Row, header: string | undefined): string {
  if (!header) return "";
  return String(row[header] ?? "").trim();
}

// Определяет валюту по символу/коду в тексте суммы. По умолчанию — рубли.
function detectCurrency(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("$") || s.includes("usd") || s.includes("долл")) return "USD";
  if (s.includes("€") || s.includes("eur") || s.includes("евро")) return "EUR";
  return "RUB";
}

// Разбирает сумму с любыми разделителями: "1 234 567,89", "1,234,567.89", "45000".
function parseAmount(raw: string): number {
  let s = raw.replace(/[^\d.,-]/g, ""); // убираем валюту, пробелы, буквы
  if (!s) return NaN;

  const hasComma = s.includes(",");
  const hasDot = s.includes(".");

  if (hasComma && hasDot) {
    // Десятичным считаем тот разделитель, что стоит правее.
    const decimal = s.lastIndexOf(",") > s.lastIndexOf(".") ? "," : ".";
    const thousands = decimal === "," ? "." : ",";
    s = s.split(thousands).join("").replace(decimal, ".");
  } else if (hasComma) {
    // Одна запятая с 1–2 цифрами после — десятичная; иначе разделитель тысяч.
    const parts = s.split(",");
    s = parts.length === 2 && parts[1].length <= 2 ? parts.join(".") : parts.join("");
  } else if (hasDot) {
    // Несколько точек = разделители тысяч.
    const parts = s.split(".");
    if (parts.length > 2) s = parts.join("");
  }
  return Number(s);
}

// Разбирает дату из разных форматов: ISO, ДД.ММ.ГГГГ, ДД/ММ/ГГГГ и т.п.
function parseDate(raw: string): Date | null {
  const s = raw.trim();
  if (!s) return null;

  // ISO: 2026-01-15
  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  // ДД.ММ.ГГГГ / ДД/ММ/ГГГГ / ДД-ММ-ГГГГ
  const m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  if (m) {
    let [, dd, mm, yy] = m;
    // Формат с '/' и первым числом >12 — это точно ДД/ММ; иначе тоже трактуем как ДД/ММ (ру).
    let day = Number(dd);
    let mon = Number(mm);
    if (mon > 12 && day <= 12) [day, mon] = [mon, day]; // страховка для ММ/ДД
    let year = Number(yy);
    if (year < 100) year += 2000;
    const d = new Date(year, mon - 1, day);
    return isNaN(d.getTime()) ? null : d;
  }

  const fallback = new Date(s);
  return isNaN(fallback.getTime()) ? null : fallback;
}

function normalizeStatus(raw: string): string {
  const s = raw.trim().toLowerCase();
  if (["won", "выиграна", "закрыта", "success", "closed won", "closed", "выиграно"].includes(s))
    return "won";
  if (["lost", "проиграна", "fail", "closed lost", "проиграно"].includes(s)) return "lost";
  return "open";
}

export async function importFile(formData: FormData): Promise<ImportResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Не авторизован" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Файл не выбран." };
  }

  let rows: Row[];
  try {
    rows = await parseFile(file);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Не удалось прочитать файл." };
  }

  if (rows.length === 0) {
    return { ok: false, error: "Файл пуст — нет ни одной строки данных." };
  }

  const headers = Object.keys(rows[0]);

  // 1) Быстрое сопоставление по словарю.
  let map = mapByDictionary(headers);
  let aiUsed = false;

  // 2) Если ключевые поля не нашлись — просим Gemini разобраться в заголовках.
  if (!map.customer || !map.amount) {
    try {
      const aiMap = await mapByAI(headers);
      map = { ...aiMap, ...map }; // словарные совпадения важнее — они точные
      aiUsed = true;
    } catch {
      // Если AI недоступен — продолжаем с тем, что есть от словаря.
    }
  }

  if (!map.customer || !map.amount) {
    return {
      ok: false,
      error:
        "Не удалось понять колонки файла. Нужны как минимум колонки с клиентом и суммой сделки.",
    };
  }

  // Подпись существующих сделок пользователя — чтобы не задваивать при повторной загрузке.
  const existing = await db
    .select({
      customer: deals.customer,
      amount: deals.amount,
      dealDate: deals.dealDate,
      manager: deals.manager,
    })
    .from(deals)
    .where(eq(deals.userId, userId));
  const signature = (customer: string, amount: string, date: Date, manager: string) =>
    `${customer}|${amount}|${date.toISOString().slice(0, 10)}|${manager}`;
  const seen = new Set(
    existing.map((d) => signature(d.customer, d.amount, d.dealDate, d.manager)),
  );

  const toInsert: NewDeal[] = [];
  let skipped = 0; // некорректные строки
  let duplicates = 0; // дубли

  for (const row of rows) {
    const customer = valueOf(row, map.customer);
    const amount = parseAmount(valueOf(row, map.amount));

    if (!customer || !Number.isFinite(amount) || amount <= 0) {
      skipped++;
      continue;
    }

    const status = normalizeStatus(valueOf(row, map.status));
    const date = parseDate(valueOf(row, map.date)) ?? new Date();
    const manager = valueOf(row, map.manager);
    const isClosed = status === "won" || status === "lost";
    const amountStr = amount.toFixed(2);

    const sig = signature(customer, amountStr, date, manager);
    if (seen.has(sig)) {
      duplicates++;
      continue;
    }
    seen.add(sig); // ловим дубли и внутри самого файла

    toInsert.push({
      userId,
      customer,
      manager,
      region: valueOf(row, map.region),
      source: valueOf(row, map.source),
      amount: amountStr,
      currency: detectCurrency(valueOf(row, map.amount)),
      status,
      stage: isClosed ? "closed" : "lead",
      probability: status === "won" ? 100 : status === "lost" ? 0 : 20,
      dealDate: date,
      closedAt: isClosed ? new Date() : null,
    });
  }

  if (toInsert.length === 0) {
    const reason =
      duplicates > 0
        ? "Все строки уже есть в базе (дубли не добавляем)."
        : "Колонки распознаны, но не нашлось ни одной корректной строки (проверьте суммы).";
    return { ok: false, error: reason };
  }

  // Вставляем частями, чтобы не упереться в лимит запроса Postgres на больших файлах.
  const CHUNK = 500;
  for (let i = 0; i < toInsert.length; i += CHUNK) {
    await db.insert(deals).values(toInsert.slice(i, i + CHUNK));
  }
  revalidatePath("/dashboard");

  return { ok: true, imported: toInsert.length, skipped, duplicates, aiUsed };
}
