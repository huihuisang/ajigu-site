# Product Card Metadata

The layout notes below describe the earlier gallery. Use `memory/lumno-redesign.md` for the current card layout.

- Platform and pricing appear to the right of each 40px icon. The release date stays at the bottom. Shared CSS subgrid rows align each visual row using its actual content, with 12px between the summary and title and 6px between the title and description. Reset the shared CardHeader inline-size containment in this component so its row subgrid works.
- The homepage has at most three columns. Breakpoints are 688px and 1012px. Titles use their actual line count; description rows fill remaining space. Do not restore fixed summary or title spacer rows.
- Release dates and pricing categories live in `apps/ajigu/src/content/product-facts.json`. Keep source URLs and check dates. Use Apple `releaseDate` and GitHub `published_at`, not update dates or repository creation dates.
- Apple developer ID 1437463749 lists Go Sleep (6799618137), TUTU (6480340301), Moodsk (6752535811) and DailyApod (1573247808). Go Sleep and TUTU first appeared on the App Store on 2026-10-28. All 13 product-page languages now use the official App Store download URLs. TUTU no longer advertises a TestFlight beta; its FAQ and structured data state that Premium is required to save edited photos. See `docs-ai/013-app-store-release/001-action.md`.
- Apple lookup on 2026-11-02 returned both apps for the US store, with version 1.0, a free download, and iOS 17.0 minimum. The CN lookup returned no results. The public App Store website redirected requests from this environment to the CN Today page, so website changes do not prove availability for a mainland China Apple Account. Use the exact US `trackViewUrl` from Apple, not a region-neutral link that may open the Today page.
- TUTU is free to try, but saving edited photos requires Premium. Moodsk, Go Sleep and DailyApod have in-app purchases. LogLift is a free preview. TypeNote and Nameplate are free.
- At the user's request, Nameplate uses the estimated launch date 2026-09-04 with an approximation mark. Initial source commit: 2026-09-02. First retained successful Pages deployment: 2026-09-04 00:33 in Asia/Shanghai, followed by main-site integration that morning. This is an estimate, not a confirmed first availability date. See `docs-ai/003-gallery-home/004-nameplate-launch-estimate.md`.
- Sources and responsive evidence: `docs-ai/003-gallery-home/003-card-metadata.md` and `docs-ai/003-gallery-home/evidence-card-metadata/`.

- Icon-side metadata layout was checked on 2026-11-02 in all five homepage languages at 320, 360, 390, 688, 768, 1012, 1440 and 1920px. Evidence: `docs-ai/003-gallery-home/evidence-card-metadata/icon-metadata-layout.json` and the matching `icon-metadata-*.jpg` screenshots. Historical screenshots in the same directory show earlier layouts.

- Homepage cards sort by first release date, newest first, in `HomePage.astro`. Same-day releases keep their source order; missing dates sort last. The Nameplate estimate remains marked. Current order: LogLift, Go Sleep, TUTU, Moodsk, Nameplate Studio, TypeNote, DailyApod.

- The spacing and newest-first update is recorded in `docs-ai/003-gallery-home/005-spacing-polish.md`. Final sorted layout evidence covers 60 language/width cases in `evidence-spacing/layout.json`; the earlier 72px summary-row screenshots are historical.
