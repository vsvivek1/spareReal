"use client";

import { useLanguage } from "@/contexts/LanguageContext";

import { HELP_SECTIONS } from "@/lib/helpContent";

export default function HelpPage() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="gx-page">
      <div className="gx-container">
        <div className="gx-page-header">
          <h1 className="gx-dash-title">
            {lang === "ml" ? "സഹായം" : "Help"}
          </h1>
          <p className="gx-dash-sub">
            {lang === "ml"
              ? "spareX എങ്ങനെ ഉപയോഗിക്കാം എന്നതിനെക്കുറിച്ചുള്ള വിവരങ്ങൾ."
              : "How to get the most out of spareX."}
          </p>
        </div>

        <div className="gx-role-group gx-lang-toggle" style={{ maxWidth: 260 }}>
          <button
            type="button"
            className={
              "gx-role-option" + (lang === "en" ? " gx-role-option-active" : "")
            }
            onClick={() => setLang("en")}
          >
            English
          </button>

          <button
            type="button"
            className={
              "gx-role-option" + (lang === "ml" ? " gx-role-option-active" : "")
            }
            onClick={() => setLang("ml")}
          >
            മലയാളം
          </button>
        </div>

        <div>
          {HELP_SECTIONS.map((section, index) => (
            <div className="gx-form-card" key={index} style={{ marginBottom: 16 }}>
              <h3 className="gx-part-name" style={{ marginBottom: 8 }}>
                {lang === "ml" ? section.question.ml : section.question.en}
              </h3>
              <p className="gx-part-desc" style={{ margin: 0 }}>
                {lang === "ml" ? section.answer.ml : section.answer.en}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
