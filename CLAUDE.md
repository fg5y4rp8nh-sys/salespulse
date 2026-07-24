@AGENTS.md

# SalesPulse

B2B-дашборд аналитики продаж с AI-инсайтами. Пользователь загружает/подключает данные продаж, видит метрики и графики, а Google Gemini генерирует текстовые инсайты и рекомендации.

## Технологический стек

| Область        | Технология                                  |
| -------------- | ------------------------------------------- |
| Фреймворк      | **Next.js 16.2.11** (App Router, без `src/`) |
| Язык           | TypeScript                                  |
| React          | 19.2.4                                       |
| Стили          | Tailwind CSS v4                             |
| База данных    | PostgreSQL (Neon)                           |
| Авторизация    | Clerk                                       |
| AI             | Google Gemini API                           |
| Хостинг        | Vercel                                      |
| Репозиторий    | GitHub                                      |

> ⚠️ **Внимание:** это модифицированная версия Next.js (16, не 15). Перед написанием кода
> читай документацию в `node_modules/next/dist/docs/`. Подробности — в `AGENTS.md`.

## Переменные окружения

Реальные значения хранятся в `.env.local` (в git НЕ попадает). Здесь — только имена:

- `DATABASE_URL` — строка подключения к Neon (PostgreSQL)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — публичный ключ Clerk
- `CLERK_SECRET_KEY` — секретный ключ Clerk
- `GEMINI_API_KEY` — ключ Google Gemini

Эти же переменные нужно добавить в настройки проекта на Vercel (Settings → Environment Variables).

## Команды

- `npm run dev` — локальный запуск (http://localhost:3000)
- `npm run build` — production-сборка
- `npm run start` — запуск собранного проекта
- `npm run lint` — проверка кода ESLint

## План на 14 дней

> TODO: вставить план (пользователь добавит). День 1 — настройка окружения,
> запуск локально, GitHub, деплой на Vercel.
