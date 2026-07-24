import "dotenv/config";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Инструмент миграций запускается вне Next.js, поэтому вручную грузим .env.local.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
