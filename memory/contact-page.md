# Studio contact pages

- Decision and acceptance: `docs-ai/015-contact-page/000-plan.md`.
- Studio contact routes append `contact/` to each localized homepage route. Keep the language menu within the contact-page cluster and return the Work link to the matching homepage's `#apps` section.
- `apps/ajigu/src/components/ContactPage.astro` reuses the shared header, layout and footer. Localized content lives in `apps/ajigu/src/content/contact.json`.
- Use the existing public support address `support@ajigu.com` and homepage profile/feedback URLs. Do not add a form without a separate delivery and privacy decision. The current page does not send or store messages.
- `tests/contact.mjs` checks the built pages and actual clicks across all five languages at 320, 390 and 1440px, with and without JavaScript. CI runs it through `pnpm test:contact` and archives its evidence.
- Keep the homepage's old `#contact` anchor for existing links. Product header navigation keeps its existing feature and FAQ links.
