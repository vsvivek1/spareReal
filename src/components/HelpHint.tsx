"use client";

import { useLanguage } from "@/contexts/LanguageContext";

import type { Bilingual } from "@/lib/helpContent";

export default function HelpHint({ text }: { text: Bilingual }) {
  const { lang } = useLanguage();

  return <p className="gx-hint">{lang === "ml" ? text.ml : text.en}</p>;
}
