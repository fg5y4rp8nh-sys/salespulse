import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL не задан (проверь .env.local)");
}

const sql = neon(process.env.DATABASE_URL);

// Клиент базы данных. Импортируй `db` в серверном коде для запросов.
export const db = drizzle(sql, { schema });
