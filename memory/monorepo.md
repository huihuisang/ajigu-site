# Website Monorepo

- The user approved a pnpm workspace in ajigu-site with Astro, React, TypeScript, Tailwind CSS and shadcn/ui on 2026-10-31.
- Phase one covers ajigu.com and typenote.ajigu.com. Preserve existing domains, paths, TypeNote query languages, download targets and editor behaviour.
- The plan and acceptance criteria are in docs-ai/002-monorepo-migration/000-plan.md. Other product sites remain separate until a later migration.
- Source migration does not authorize DNS changes, production publication, or deletion of the old TypeNote checkout.
- Phase two adds apps/moodsk, apps/gosleep, apps/dailyapod and apps/tutu, approved on 2026-10-31. All six sites now use this workspace. Its plan is docs-ai/002-monorepo-migration/004-four-sites-plan.md.
- The four route-based product apps share ProductLanding.astro. Their public directories retain legal, support, tutorial and guide URLs; compatibility.json records the import baseline. Moodsk keeps its local six-scene renderer.
- Keep the original four checkouts unchanged. The Go Sleep guide canonical and JSON-LD URL repairs apply only to imported files; their bodies remain unchanged.

- On 2026-11-01 the user explicitly authorized push and production publication of all six sites. Current release authority: docs-ai/006-production-release. Main uses verified CI artifacts and Pages/OIDC; product repositories host ajigu-site-production branches and retain their original source branches. No DNS or cross-repository token change is required.
