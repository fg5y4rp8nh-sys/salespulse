import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import "./globals.css";
import { normalizeLocale, getDict } from "@/lib/i18n";
import { I18nProvider } from "./I18nProvider";
import { LangToggle } from "./LangToggle";

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
  description: "B2B sales analytics dashboard with AI insights",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = normalizeLocale((await cookies()).get("locale")?.value);
  const t = getDict(locale);

  return (
    <ClerkProvider>
      <html
        lang={locale}
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <I18nProvider locale={locale}>
            <header className="flex items-center justify-between gap-3 border-b border-black/10 px-4 py-4 sm:gap-4 sm:px-6 dark:border-white/10">
              <Link href="/" className="shrink-0 text-lg font-semibold sm:text-xl">
                SalesPulse
              </Link>
              <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                <LangToggle />
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button className="whitespace-nowrap text-sm font-medium">
                      {t.signIn}
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="whitespace-nowrap rounded-full bg-foreground px-3 py-1.5 text-sm font-medium text-background sm:px-4 sm:py-2">
                      {t.signUp}
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <Link
                    href="/dashboard"
                    className="whitespace-nowrap text-sm font-medium"
                  >
                    {t.dashboard}
                  </Link>
                  <UserButton />
                </Show>
              </div>
            </header>
            {children}
          </I18nProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
