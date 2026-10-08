# Studio Redesign

- The user selected option 1, Gallery White. Current design authority: docs-ai/005-shadcn-redesign/000-plan.md; requirements: 001-layout-motion.md; implementation and evidence: 003-action.md. Older Bauhaus/Pop Art records describe superseded marketing layouts.
- All six marketing sites live in apps/ and share packages/ui and packages/site-kit. Keep domains, routes, locale links, download targets, native Nameplate editors, guides and frozen public resources stable.
- Use official shadcn Radix new-york components with shared neutral tokens. Page code composes layout and product behavior. Do not restore bespoke buttons, menus or FAQ controls.
- The homepage has a 1320px cap, 300px minimum card tracks and 24px gaps. CSS Grid auto-fit selects 1–4 columns. Each tile shows one real front-view mockup image plus concise product copy. Do not tilt, layer or animate device frames.
- AppIcon uses 40px gallery icons and 72px detail hero icons, 22% corners and one shared shadow. Keep verified native artwork and private provenance in packages/site-kit/icons.
- ProductHero uses an explicit customArt flag for Moodsk. Astro can pass a truthy empty named slot; never use slot truthiness to select a fallback image.
- Keep Moodsk six-scene onboarding, TypeNote sound opt-in, Go Sleep sample timeline, DailyApod current sky/solar views, TUTU comparison and Nameplate name preview. React owns shadcn controls; the Moodsk source adapter owns stage/copy nodes and cleans up observers, RAF, WAAPI and GL. Frozen public showcase modules remain unchanged.
- TypeNote query localization requires JavaScript; no-JS English is an existing static-host boundary. Its controlled language menu must close explicitly before changing language because preventDefault bypasses Radix automatic selection close.
- Reduced motion disables CSS animation/transition and Moodsk playback. Background visibility is tested through event simulation; real background-tab suspension was not observed in the local browser host. Keep audio off until explicit opt-in.
- Mockup source/licensing remains in design/mockups and THIRD_PARTY_NOTICES.md. Re-export complete images with scripts/render-mockups.py when native screenshots change.

- Light polish with unslop is recorded in docs-ai/005-shadcn-redesign/004-unslop-plan.md and 005-unslop-action.md; evidence-unslop is the current comparison baseline. Keep 224px-minimum content-growing cards, 13px descriptions, 12px metadata and #efefef media canvas. Use explicit entrance markers and explicit transition properties.
- The current footer response uses the existing ajigu duck, triggered on click, with a short reduced-motion-aware nod. Do not replace it with a generic decorative icon. Keep concrete localized demo labels and the third Moodsk hero action as a link.
- unslop is installed globally at /Users/ajigu/.codex/skills/unslop, pinned to 1d13095e4bef6ad6c74f1dd828d84c4ba309a4dc. Attribution: Damir Sokolovsky, CC BY 4.0. The global skill is a development tool, not a site dependency.

- FAQ uses the same responsive 1040px studio-shell as adjacent content. Do not restore a centered 800px override; it shifts the FAQ left edge inward by 120px on desktop. Follow-up evidence: docs-ai/005-shadcn-redesign/evidence-faq-alignment.

- All three detail entry templates use .detail-flow. It owns 64px desktop / 48px mobile module gaps; section content uses 24px gaps. Keep the original main/main-content ids and avoid local module margins or repeated shell gutters inside accordions. Navigation remains wider; the hero stays centered.
- pnpm test:layout measures all 29 localized details at six widths, expanded chapters and six-product no-script fallbacks. It is included in release-candidate CI. Current layout evidence and source baseline: docs-ai/005-shadcn-redesign/007-detail-layout-action.md and evidence-detail-layout; prior evidence manifests describe historical versions.
