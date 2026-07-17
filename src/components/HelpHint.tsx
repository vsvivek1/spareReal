"use client";

import { useLanguage } from "@/contexts/LanguageContext";

import type { Translated } from "@/lib/helpContent";

export default function HelpHint({ text }: { text: Translated }) {
  const { lang } = useLanguage();

  return <p className="gx-hint">{text[lang]}</p>;
}
