"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "ml" | "hi" | "ta" | "te" | "kn";

export const LANGUAGES: { code: Language; label: string; speechLocale: string }[] = [
  { code: "en", label: "English", speechLocale: "en-IN" },
  { code: "ml", label: "മലയാളം", speechLocale: "ml-IN" },
  { code: "hi", label: "हिन्दी", speechLocale: "hi-IN" },
  { code: "ta", label: "தமிழ்", speechLocale: "ta-IN" },
  { code: "te", label: "తెలుగు", speechLocale: "te-IN" },
  { code: "kn", label: "ಕನ್ನಡ", speechLocale: "kn-IN" },
];

const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);

const STORAGE_KEY = "spareXLang";

const LanguageContext = createContext<{
  lang: Language;
  setLang: (lang: Language) => void;
}>({ lang: "en", setLang: () => {} });

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LANGUAGE_CODES.includes(stored as Language)) {
      setLangState(stored as Language);
    }
  }, []);

  const setLang = (next: Language) => {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
