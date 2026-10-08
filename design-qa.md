# Gallery White Design QA

final result: passed

## Target, state and normalization

The selected visual truth is `design/concepts/2026-11-01/option-1.png`, a 1536 × 1024 image with two approximately 727px-wide page panels. It is the first displayed option, Gallery White. The generated TypeNote description and Mac requirements are not product facts.

The implementation was inspected in the in-app browser on local ports 8770–8775. Homepage captures use 1440, 768 and 390 CSS px; a separate 727px capture matches the reference panel width. Captures are density 1. The mock's surrounding board, labels and panel offset are excluded conceptually when comparing page regions; no pixel-identity claim is made across the whole two-panel board.

Reference and rendered images were opened together in the same comparison input. Full homepage comparison: `docs-ai/005-shadcn-redesign/evidence/home-reference-width.jpg`. Focused detail comparisons: `moodsk-hero.jpg` and `moodsk-faq.jpg`. Other evidence in that directory includes desktop/tablet/mobile home views, the last mobile tile in an actual viewport, product hero views, the TypeNote feature region, browser results and a motion recording.

The default theme is light. The homepage uses real six-product content. The detail comparison uses Moodsk's default hero and first open FAQ. The live onboarding replaces the concept's static Work screenshot because the user explicitly required the existing six-scene introduction to remain. Its additional controls and content change page height. Full-page and focused captures are evaluated separately; the 1000px hero crop does not imply the rest of the page is absent.

## Comparison history

| Earlier finding | Fix | Post-fix evidence |
| --- | --- | --- |
| P2: homepage title was too small and the intro/card rhythm was too loose at the reference width. | Use a 38px desktop title, 76px gallery navigation and a tighter intro; reduce card height/padding. Preserve the requested automatic tracks and 24px gap. | `home-before-spacing.jpg` versus `home-reference-width.jpg`, inspected with the source. |
| P2: Moodsk loaded its old showcase stylesheet and used a functional sentence as its app name. | Remove that style reference, use the product name, shared claim hierarchy and actual shadcn controls. | `moodsk-before.jpg`, then `moodsk-hero.jpg` and `moodsk-faq.jpg`. |
| P1: Astro supplied a truthy empty named art slot, hiding other detail hero mockups. | Explicit customArt selects the Moodsk slot; other detail pages always render the native mockup. | Six-product browser image assertions plus `gosleep-hero.jpg`, `dailyapod-hero.jpg`, `typenote-hero.jpg`, `tutu-desktop.jpg`, `nameplate-desktop.jpg`. |
| P2: TypeNote printed legacy br tokens as visible text. | Normalize legacy line-break markup to plain text in shared hero and feature heading. | `typenote-features.jpg` and the all-page visible-text regression. |
| P2: long Go Sleep choices and no-script guide link labels overflowed narrow screens. | Use wrapping official ToggleGroups and bounded wrapping link buttons. | 228 page/viewport checks and the six-site 320px no-script checks in `design-results.json`. |
| P2: TypeNote's language menu stayed open after a prevented anchor navigation. | Control Radix open state and close explicitly before updating language. | Browser regression verifies closed state, a second open/Escape cycle, retained input and query language. |

All rows above were fixed and rechecked. Earlier temporary failed captures are not presented as final evidence. The rejected half-width detail crop was recaptured after reading the actual target tab width; the final hero is a real 727px viewport.

## Required fidelity surfaces

- **Typography:** system UI fonts with local fallbacks; a 38px desktop homepage title, 30px mobile title, 36/32px app names and restrained 14–16px body text. Font weight, line height and wrapping were checked in full views and focused hero/FAQ/TypeNote regions. Literal br tokens are absent. The large heavy old FAQ headings and left triangles are removed. No third-party font request was observed in the main browser matrix.
- **Spacing and layout:** bounded 1320px homepage, automatic 300px-minimum tracks, 24px gaps, image-left/text-right cards and a centered shared detail header. The 11 tested widths include exact column thresholds. Card radii, icon sizing and shared elevation were checked. At the reference panel width, two columns preserve the selected composition; wider layouts intentionally use three or four columns. Mobile uses one column with readable controls.
- **Colors and tokens:** shared white background, neutral foreground/muted text, subtle border and near-black primary action. Official shadcn semantic tokens replace per-product UI themes. Product artwork keeps its native colors. No added decorative gradients or primary-color marketing panels.
- **Images and assets:** actual native icons and licensed front-view mockup exports, not the generated concept's invented UI. Device frames remain baked into complete images, with no CSS perspective or rotation. Moodsk retains its real product artwork and render timeline. TUTU comparison and Nameplate live text are functional demos, not substitutes for product screenshots. Icon corners/shadow are consistent. The native last mobile card was inspected in a separate viewport because full-page browser capture can omit an offscreen paint layer; its image was loaded and visible.
- **Copy and content:** the actual musical keyboard TypeNote copy replaces the concept's note-taking claim. Original supported systems, privacy boundaries, source attribution, download URLs and language links were retained. The four-site text/link audit restored omitted privacy and compatibility statements. No generated download counts, pricing or unverified hardware support were adopted.

## Interaction and motion verification

`browser-results.json`: 228 page/viewport checks, all main React interactions, locale/query/storage handling, denied storage, native editor export, touch, no-script, reduced motion and six build contracts passed. Site errors and external font requests are empty.

`design-results.json`: 11 widths from 320 to 1920px, repeated/invalid hash navigation, the real DailyApod gallery target, all six Moodsk chapters, keyboard navigation, cursor effects/colors, offscreen pause/resume, reduced motion and no-script 320px roots passed.

`motion-normal-and-slow.webm` is an 11.56-second actual browser recording. The first seconds cover responsive/anchor checks; the Moodsk segment includes normal playback and a 0.25× animation-playback-rate check. JavaScript-driven rendering remains tied to its normal clock during the latter. `motion-contact-sheet.jpg` was opened to inspect representative frames. This is not a claim that every canvas timeline was slowed by the browser animation override.

The page-visibility gate was exercised with a visibility event simulation. The current in-app browser host continued reporting visible when another tab was opened, so actual background-tab suspension was not observed. The source gate and event path passed review and regression. No autoplay audio was added. The optional footer response ends and respects reduced motion.

## Accepted differences and follow-up polish

No actionable P0/P1/P2 findings remain. The official Accordion uses its standard separators rather than the concept's invented boxed rows. The live Moodsk onboarding and preserved product-specific information make details longer than the static concept. Correct native assets and truthful copy differ from the generated image. These changes follow the user's explicit requirements.

A future art-only iteration could tune the baked device framing inside gallery images. This is P3 and does not block navigation, readability or the selected layout. No new asset generation or publishing is part of this handoff.

## Handoff checklist

- [x] Source and rendered views compared together, including focused regions.
- [x] All five fidelity surfaces checked and substantive findings fixed.
- [x] Responsive layout, real assets and product-specific interactions verified.
- [x] Keyboard, touch, reduced motion, no-script and console checks recorded.
- [x] Local preview retained. No commit, push or deployment performed.


## unslop refinement — 2026-11-01

The current local build includes the light polish in `docs-ai/005-shadcn-redesign/005-unslop-action.md`. It retains the selected Gallery White layout, native assets and official shadcn controls. The earlier Sparkles footer response above is historical; the current response uses the existing ajigu duck.

Three visual rounds covered the before state, refined desktop state and narrow/stable-state verification. At 1440 × 1000 CSS px, `evidence-unslop/home-before.jpg` and `home-after.jpg` show the same six products in the default light theme. The refined 224px cards use 13px descriptions and 12px metadata. Their backgrounds match the #efefef baked mockup canvas; the former upper/lower bands are gone. Native icon geometry remains unchanged. `moodsk-before.jpg` and `moodsk-after.jpg` retain scene 1, with the third hero action reduced to a link. The final home capture was repeated after the short entrance completed; no temporary animation frame is used as final evidence.

Typography, spacing, color, assets and copy were checked directly. The after images are local browser renders, not generated mockups. Shared heading punctuation and concrete demo labels were checked against real product copy. The 390px home and Moodsk captures show single-column cards, wrapping actions and complete original onboarding controls.

The new browser run passed 228 page/viewport checks, including every gallery title/description/platform boundary. The design run passed 11 widths, all six scenes, keyboard, offscreen pause, visibility-event simulation, no-script 320px and reduced motion. There were no page errors or external font requests. The actual recording remains in the registered task directory; its durable index is `evidence-unslop/visual-metrics.json`. Source review passed on the final 57-file UI baseline. No actionable P0/P1/P2 finding remains from this polish. Native framing and the real-background-tab observation limit described above still apply.

The global skill and its CC BY 4.0 attribution were verified independently of the website build. No skill script or reference artwork is shipped to site visitors. Temporary outputs are retained because no commit or publication was authorized.


## FAQ alignment correction — 2026-11-01

Removed the 800px FAQ-specific width override. The shared FAQ now uses the same 1040px responsive shell as adjacent detail content. In the in-app browser at 1211px, FAQ and feature left edges both measure 85.5px; the former FAQ edge was 205.5px. Text alignment was already start-aligned.

The six-site build passed. A targeted browser check passed 24 English/Chinese desktop/mobile cases across all six detail templates, including matching left/right edges, no horizontal overflow and keyboard expansion. Two additional Moodsk no-script checks passed. Results and the inspected FAQ crop are in `docs-ai/005-shadcn-redesign/evidence-faq-alignment`. This small follow-up was self-reviewed; prior source hashes identify earlier versions. No publishing was performed. Task outputs remain under task-artifacts task 9376659124a944bfb9b537ef9ef41167 because no verified commit was published.


## Full detail layout alignment — 2026-11-01

The current detail baseline is `docs-ai/005-shadcn-redesign/007-detail-layout-action.md`. All six products use an explicit detail-flow class, with 64px desktop / 48px mobile module gaps and 24px direct-content gaps. Modules, headings and footer content share the 1040px shell. The centered hero, wider navigation and deliberate padding inside controls/demos remain intentional.

All six desktop product renders and the TypeNote mobile render were inspected in this round; images are in evidence-detail-layout. The new layout regression passed 174 locale/width combinations, 144 chapter expansions and 14 no-script cases. It checks actual bounds and gaps, including Astro contents and expanded sections. The full 228-case browser run and motion/anchor regression also passed. No actionable alignment findings remain in the checked states. The CI configuration now includes test:layout; no remote run or publication is claimed. Source review and retained recording limits are in the action record.
