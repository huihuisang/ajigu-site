# ajigu Website

One Astro application serves the studio and all products at ajigu.com. It uses
React, TypeScript, Tailwind CSS and shared shadcn/ui components.

## Workspace

- `apps/ajigu/src/components`: studio and Nameplate pages.
- `apps/ajigu/src/products`: TypeNote, Moodsk, Go Sleep, DailyApod, TUTU and LogLift modules.
- `apps/ajigu/public/<product>`: frozen product assets and static source documents.
- `packages/ui`: shared tokens and shadcn/ui components.
- `packages/site-kit`: navigation, layouts, content models and URL mapping.

Product URLs are `/typenote/`, `/moodsk/`, `/gosleep/`, `/dailyapod/`, `/tutu/` and `/loglift/`.
Existing locale and guide paths follow each product prefix. TypeNote keeps its
`?lang=` language parameter. Nameplate URLs stay unchanged.

LogLift uses complete namespaced paths and the shared product landing template.
Its five localized detail pages link to the published 0.1.1 release. It has no
legacy domain or redirect output. The reusable onboarding workflow is in
`.agents/skills/ajigu-add-product/SKILL.md`.

The studio homepage uses a responsive gallery of complete front-view device
mockups. Inputs, template licenses and export instructions are in `design/mockups`.
Native app icon provenance remains in `packages/site-kit/icons/sources.json`;
that manifest is excluded from public output. Gallery captions and product
navigation use the shared `AppIcon` component for size, corners and shadow.

## Design system

The current visual specification is `docs-ai/011-lumno-design-system/000-plan.md`.
It replaces the older Gallery White dimensions and surface rules. Product copy,
asset provenance, routes and interaction contracts remain authoritative.

`packages/ui/src/styles/tokens.css` owns the spacing scale, semantic layout,
surfaces, typography, radii, elevation and motion values. `global.css` maps these
roles to the existing shadcn API. Shared marketing layout lives in `site.css`;
the product gallery composes these roles in `apps/ajigu/src/styles/gallery.css`.
Use existing semantic tokens before adding a component-specific value.

Open Sans, EB Garamond and Cormorant Garamond ship as local WOFF2 assets. Their
OFL notices are in `packages/ui/licenses` and the build includes them under
`/licenses/`. CJK text uses locale-specific system fonts. Product artwork and
native demo surfaces retain their own identity.

Node 22.23.4 or later is required; CI uses Node 24. The package manager version is
pinned in `package.json`. Install with `pnpm install --frozen-lockfile`.

```sh
pnpm dev
pnpm check
pnpm test
pnpm build
pnpm preview
```

The development and preview servers bind to loopback on port 8770. All product
pages share this origin. `pnpm build` runs Astro once and collects the website in
`dist/ajigu`; the other five applications are retired.

The same command also generates five static compatibility outputs under
`dist/redirects/<product>`. They contain instant HTML redirects and retained public
assets for offline compatibility regression checks. These are not production
redirect services. Agent tasks use their registered
output directory. `STUDIO_OUTPUT_DIR` can select another root; preview and build
checks use the same setting.

Astro compiler staging uses the shared `node_modules/.cache/studio-build/`
directory on the source volume; this avoids cross-device rename failures.
Dependency, compiler and generated-type caches are excluded from version control.

```sh
task-artifacts run TASK_ID -- pnpm verify
task-artifacts run TASK_ID -- pnpm test:browser
task-artifacts run TASK_ID -- pnpm test:layout
task-artifacts run TASK_ID -- pnpm test:visual
task-artifacts run TASK_ID -- pnpm test:redirects
```

Browser checks use Playwright with installed Chrome locally and installed
Playwright Chromium in CI. They cover all six products and their language routes,
static compatibility pages, responsive layouts, product demos, sound opt-in,
storage failures and the original PNG export.
Layout checks cover every localized product detail page, including LogLift, at six viewport widths.
They measure module and heading alignment, shared spacing, expanded chapters and
no-script fallbacks. The release-candidate workflow runs them after browser checks.
Use `pnpm format:check` to check the new workspace code style.
Visual-system checks cover five homepage languages at eight widths. They verify
rendered font families, original headline text, grid geometry, nested media,
navigation bounds, local font requests and TypeNote key feedback.

## Source and publication boundaries

Edit the new marketing sources in `apps/` and `packages/`. The root landing HTML
and `studio/` are the previous static reference, used by legacy regression tests.
The root `nameplate/` and `assets/` remain the original editor and asset sources;
the workspace build includes them without applying its new layout or CSS.
Do not edit generated output or maintain the old product checkouts in parallel.

The main site publishes from the verified `ajigu-com` CI artifact through
`.github/workflows/deploy-studio.yml`. Its deployment job has Pages and OIDC
permissions; the reusable candidate workflow remains read-only.

The five legacy product domains use Cloudflare Single Redirects. Six ordered
rules preserve shared resource paths, product paths and query strings, and return
server-side HTTP 301 responses. The five DNS records are proxied CNAMEs to
ajigu.com. The existing www rule and all other DNS records stay unchanged.

The reviewed rule source is `scripts/legacy-redirect-rules.mjs`. No cross-repository
publisher is used. CI only publishes the main website artifact; local HTML
compatibility outputs remain available for offline migration regression checks.

Repository backups, restore checks, edge checks and the guarded retirement flow
are documented in `docs-ai/008-legacy-domain-retirement`. Persistent backups remain
outside task cleanup and include Git bundles and issue/PR JSON. Original GitHub
identities, URLs, stars and issue numbers cannot be restored exactly. Platform
credentials, Actions logs/caches and account-level Projects are not included.

```sh
task-artifacts run TASK_ID -- node scripts/check-edge-redirects.mjs EVIDENCE_JSON
```

## Languages

- `/` — English (default)
- `/zh-hans/` — 简体中文
- `/ja/` — 日本語
- `/zh-hant/` — 繁體中文
- `/ko/` — 한국어

Each studio language has a `contact/` page under its homepage path. The page shows
the existing support email, GitHub profile and public feedback link. Language
switching keeps the contact page open. Run `pnpm test:contact` after building to
check navigation, metadata and responsive layouts with and without JavaScript.

## Nameplate Studio

- `/nameplate/` — English
- `/nameplate/zh-hans/` — Simplified Chinese

The URL sets the editor language. A language switch keeps the current design and updates the URL, metadata, and help text. Old `?lang=` links redirect to the matching route. Traditional Chinese uses the supported Chinese editor; Japanese and Korean use the English editor.

The English HTML is the shared editor template. Text and metadata live in `nameplate/app.js`. After changes to either file, generate both static pages:

```sh
node scripts/build-nameplate.mjs
node scripts/build-nameplate.mjs --check
node --test scripts/seo.test.mjs
node --test scripts/templates.test.mjs
node --test scripts/images.test.mjs
```

The generator updates English fallback text and creates the Chinese page. Do not edit `nameplate/zh-hans/index.html` directly. Keep the guide consistent with the actual editor and export behavior.

The template catalog includes Blank, Classic, Navy & Gold, Coral Pop, and Forest. Additional panel backgrounds live in `nameplate/assets/templates/`. They load before the catalog is shown. The source designs came from `../nameplate-studio`, but its old deployment script must not be used: it removes the published directory and overwrites the locale and SEO integration. Sync changes selectively and run all regression tests.

## Images

Display images and template thumbnails use WebP. Original PNG files remain as conversion inputs and for existing external URLs. Favicons, Apple touch icons, and social preview metadata keep PNG for compatibility. PNG downloads from the editor remain unchanged.

After adding or replacing a PNG asset, install Google's `cwebp` encoder and rebuild:

```sh
node scripts/build-images.mjs
node scripts/build-nameplate.mjs
node --test scripts/*.test.mjs
```

The image generator keeps source dimensions and metadata. Icons use lossless compression; print backgrounds use quality 92 and sharp YUV conversion. `assets/image-sizes.json` records the byte counts. The three template backgrounds fall from 6,449,872 to 662,974 bytes.

Keep the logo and first product row eager. Later product icons use native lazy loading and asynchronous decoding. Declare image dimensions to reserve layout space. All five template previews are visible in the editor, so their backgrounds must load before thumbnail generation; do not add lazy loading to those required images.

## Marketing content

Edit studio content in `apps/ajigu/src/content/`, shared copy in
`packages/site-kit/src/copy.json`, and TypeNote content in
`apps/ajigu/src/products/typenote/content/`. Product interactions are React components;
marketing layout and metadata are shared workspace modules.

For the four route-based product modules, edit `apps/ajigu/src/products/<product>/content/pages.json`
and the app's React demo components. They use `ProductLanding.astro` from the shared
site kit. Editorial section HTML is trusted source checked into the app; do not
insert user input or fetched HTML. Moodsk retains its local six-scene renderer in
`apps/ajigu/public/moodsk/showcase/`.

Legal, support, tutorial and guide pages remain in `apps/ajigu/public/<product>`.
The import baseline in each product module’s `compatibility.json` records original URLs and file hashes,
including documented metadata repairs. Update it only for reviewed changes.
The old product repositories remain intact as historical deployment targets;
only compatibility publication uses the guarded redirect process above.
