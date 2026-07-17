"use client";

import { useLanguage, LANGUAGES } from "@/contexts/LanguageContext";

import { HELP_SECTIONS, HELP_PAGE_INTRO } from "@/lib/helpContent";

export default function HelpPage() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="gx-page">
      <div className="gx-container">
        <div className="gx-page-header">
          <h1 className="gx-dash-title">{HELP_PAGE_INTRO.title[lang]}</h1>
          <p className="gx-dash-sub">{HELP_PAGE_INTRO.subtitle[lang]}</p>
        </div>

        <div className="gx-role-group gx-lang-toggle" style={{ maxWidth: 520 }}>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              className={
                "gx-role-option" + (lang === l.code ? " gx-role-option-active" : "")
              }
              onClick={() => setLang(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div>
          {HELP_SECTIONS.map((section, index) => (
            <div className="gx-form-card" key={index} style={{ marginBottom: 16 }}>
              <h3 className="gx-part-name" style={{ marginBottom: 8 }}>
                {section.question[lang]}
              </h3>
              <p className="gx-part-desc" style={{ margin: 0 }}>
                {section.answer[lang]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
