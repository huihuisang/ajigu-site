import { useEffect, useRef, useState } from "react";
import { Download } from "@ajigu/ui/icons";
import { Button } from "@ajigu/ui/components/button";
import { SiteHeader } from "@ajigu/site-kit/components/SiteHeader";
import { SiteFooter } from "@ajigu/site-kit/components/SiteFooter";
import { ProductHero } from "@ajigu/site-kit/components/ProductHero";
import { Faq } from "@ajigu/site-kit/components/Faq";

import { getCopy } from "@ajigu/site-kit/copy";
import translations from "../content/translations.json";
import {
  htmlLocale,
  languageURL,
  normalizeLanguage,
  readPreference,
  resolveLanguage,
  type TypeLanguage,
} from "../lib/language";
import { SoundPreview } from "./SoundPreview";
import { Features, Notation, Privacy, DownloadSection } from "./TypeNoteSections";
import { observeEntrances } from "@ajigu/site-kit/scripts/enhance";
import { release, repository } from "../content/product";

const languageItems = [
  { code: "en", label: "English", href: "/?lang=en" },
  { code: "zh", label: "简体中文", href: "/?lang=zh" },
  { code: "zht", label: "繁體中文", href: "/?lang=zht" },
  { code: "ja", label: "日本語", href: "/?lang=ja" },
  { code: "ko", label: "한국어", href: "/?lang=ko" },
];

export default function TypeNotePage() {
  // The first render must match static HTML before applying URL or saved preferences.
  const [language, setLanguage] = useState<TypeLanguage>("en");
  const main = useRef<HTMLElement>(null);
  useEffect(() => (main.current ? observeEntrances(main.current) : undefined), []);
  useEffect(() => {
    const resolve = () => {
      let saved: string | null = null;
      try {
        saved = readPreference(window.localStorage);
      } catch {}
      setLanguage(resolveLanguage(location.search, saved));
    };
    resolve();
    window.addEventListener("popstate", resolve);
    return () => window.removeEventListener("popstate", resolve);
  }, []);
  useEffect(() => {
    document.documentElement.lang = htmlLocale(language);
    document.documentElement.dataset.locale = htmlLocale(language);
  }, [language]);
  function changeLanguage(code: string) {
    const next = normalizeLanguage(code);
    if (!next) return;
    setLanguage(next);
    try {
      localStorage.setItem("tn-lang", next);
    } catch {}
    history.replaceState(history.state, "", languageURL(location.href, next));
  }
  const text = translations[language];
  const copy = getCopy(htmlLocale(language));
  const screenshots =
    language === "ja" ? "ja" : language === "zh" || language === "zht" ? "zh" : "en";
  const guide = `/guides/keyboard-sounds/${screenshots === "en" ? "" : screenshots === "zh" ? "zh-hans/" : "ja/"}`;
  const questions = [1, 2, 3, 4].map((number) => ({
    question: text.faq[`q${number}` as "q1" | "q2" | "q3" | "q4"],
    answer: text.faq[`a${number}` as "a1" | "a2" | "a3" | "a4"],
  }));
  return (
    <>
      <a className="studio-skip" href="#main">
        {copy.skip}
      </a>
      <SiteHeader
        appId="typenote"
        name="TypeNote"
        icon="/assets/app-icon.png"
        route={language === "en" ? "/" : `/?lang=${language}`}
        copy={copy}
        languages={languageItems}
        language={language}
        onLanguageChange={changeLanguage}
      />
      <main className="detail-flow" id="main" ref={main}>
        <ProductHero
          id="typenote"
          name="TypeNote"
          claim={text.hero.title}
          intro={text.hero.sub}
          actions={
            <>
              <Button asChild>
                <a href={release} target="_blank" rel="noopener noreferrer">
                  <Download data-icon="inline-start" />
                  {text.hero.cta1}
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="#features">{text.hero.cta2}</a>
              </Button>
            </>
          }
        />
        <section className="studio-demo studio-shell" id="showcase">
          <h2>{copy.demos.typenote}</h2>
          <SoundPreview copy={copy} />
        </section>
        <Features text={text} screenshots={screenshots} />
        <Notation text={text} />
        <Privacy text={text} />
        <Faq title={text.faq.title} questions={questions} />
        <DownloadSection text={text} />
      </main>
      <SiteFooter
        signatureLabel={copy.signatureLabel}
        name="TypeNote"
        links={[
          { href: "https://ajigu.com/", label: "ajigu" },
          { href: repository, label: "GitHub" },
          { href: guide, label: text.nav.sound },
        ]}
      />
    </>
  );
}
