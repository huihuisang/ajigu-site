# Website Monorepo

- The user approved a pnpm workspace in ajigu-site with Astro, React, TypeScript, Tailwind CSS and shadcn/ui on 2026-10-31.
- Phase one covers ajigu.com and typenote.ajigu.com. Preserve existing domains, paths, TypeNote query languages, download targets and editor behaviour.
- The plan and acceptance criteria are in docs-ai/002-monorepo-migration/000-plan.md. Other product sites remain separate until a later migration.
- Phase-one source migration did not authorize DNS changes, production publication, or deletion of the old TypeNote checkout. Later explicit authorizations are recorded below.
- Phase two adds apps/moodsk, apps/gosleep, apps/dailyapod and apps/tutu, approved on 2026-10-31. All six sites now use this workspace. Its plan is docs-ai/002-monorepo-migration/004-four-sites-plan.md.
- The four route-based product apps share ProductLanding.astro. Their public directories retain legal, support, tutorial and guide URLs; compatibility.json records the import baseline. Moodsk keeps its local six-scene renderer.
- During phase two the original four checkouts stayed unchanged. The Go Sleep guide canonical and JSON-LD URL repairs applied only to imported files; their bodies remained unchanged. The later local-cleanup authorization below supersedes checkout retention.

- On 2026-11-01 the user explicitly authorized push and production publication of all six sites. Current release authority: docs-ai/006-production-release. Main uses verified CI artifacts and Pages/OIDC; product repositories host ajigu-site-production branches and retain their original source branches. No DNS or cross-repository token change is required.

- All six production domains were published on 2026-11-01 from fe121d25d2392fc3f3e88937cdcbebbf0e67de17 via successful CI 41274821205. Results and rollback state: docs-ai/006-production-release/001-action.md. API Pages source changes did not enqueue initial product builds; explicit pages/builds requests completed them. Verify build SHA and live marker after every release.

- On 2026-11-01 the user superseded the multi-site architecture: use one Astro app at ajigu.com, with /typenote/, /moodsk/, /gosleep/, /dailyapod/ and /tutu/. Product modules live in apps/ajigu/src/products; frozen assets live in apps/ajigu/public/<product>. Authoritative decision: docs-ai/007-single-site.
- Legacy product domains serve generated HTML redirects on existing Pages branches. Query/hash are preserved with JavaScript; no-script uses immediate meta refresh. This is HTTP 200 HTML, not server-side 301. Keep legacy binary resources, DNS and source branches. New publication entry point: scripts/publish-redirects.mjs after successful main deployment.

- Single-site consolidation is live from 45af53d69045e635b2ba38fe3020be802f7fc330, successful CI 41283283464. The five old domains now redirect; live verification passed 91 canonical pages and 82 legacy HTML redirects. Publication receipts and the DailyApod Pages retry are in docs-ai/007-single-site. This supersedes the earlier independent-domain deployment model.

- Current retirement authority: docs-ai/008-legacy-domain-retirement and memory/legacy-redirects.md. Cloudflare now owns the five legacy-domain 301 redirects; the former GitHub repositories and, after separate explicit authorization, all five original local website checkouts were removed. Their complete remote and local backups remain private and persistent. This supersedes the earlier HTML publisher and original-checkout retention instructions. Never delete the TypeNote native app or the retained ajigu-site repository.
