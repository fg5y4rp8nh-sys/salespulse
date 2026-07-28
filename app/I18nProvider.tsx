"use client";

import { createContext, useContext } from "react";
import { getDict, type Dictionary, type Locale } from "@/lib/i18n";

const LocaleContext = createContext<Locale>("en");

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useT(): Dictionary {
  return getDict(useContext(LocaleContext));
}
