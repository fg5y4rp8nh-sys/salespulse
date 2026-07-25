import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SalesPulse",
  description: "B2B-дашборд аналитики продаж с AI-инсайтами",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="ru"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-black/10 px-4 py-4 sm:px-6 dark:border-white/10">
            <Link href="/" className="text-lg font-semibold">
              SalesPulse
            </Link>
            <div className="flex items-center gap-3 sm:gap-4">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="text-sm font-medium">Войти</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
                    Регистрация
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard" className="text-sm font-medium">
                  Дашборд
                </Link>
                <UserButton />
              </Show>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
