// В Next.js 16 файл "middleware" переименован в "proxy" (функционал тот же).
// Clerk кладём сюда через clerkMiddleware(): он проверяет вход пользователя.
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Какие маршруты требуют входа. Пока — всё внутри /dashboard.
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect(); // не вошёл -> редирект на страницу входа
  }
});

export const config = {
  matcher: [
    // Пропускаем статику и служебные файлы Next, кроме случаев с параметрами.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|svg|ico|webp|woff2?|ttf|otf|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Всегда прогоняем API-маршруты.
    "/(api|trpc)(.*)",
  ],
};
