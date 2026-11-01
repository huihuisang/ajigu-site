# ajigu Websites

This repository owns the studio and all five product website sources. It uses a
pnpm workspace with Astro, React, TypeScript, Tailwind CSS and shadcn/ui. All six
sites build as independent static websites with their existing domains and URLs.

## Workspace

- `apps/ajigu`: studio homepages and Nameplate introductions.
- `apps/typenote`: TypeNote React marketing page, translations and static guides.
- `apps/moodsk`: Moodsk marketing pages, six-scene demo and static tutorials.
- `apps/gosleep`: Go Sleep marketing pages, sample timeline and static support pages.
- `apps/dailyapod`: DailyApod marketing pages, screenshot gallery and static guides.
- `apps/tutu`: TUTU marketing pages and aligned photo comparison.
- `packages/ui`: shared design tokens, styles and adapted shadcn/ui primitives.
- `packages/site-kit`: metadata, navigation, product layout, FAQ and shared media.

The studio homepage uses a responsive gallery of complete front-view device
mockups. Inputs, template licenses and export instructions are in `design/mockups`.
Native app icon provenance remains in `packages/site-kit/icons/sources.json`;
that manifest is excluded from public output. Gallery captions and product
navigation use the shared `AppIcon` component for size, corners and shadow.

Node 22.23.4 or later is required; CI uses Node 24. The package manager version is
pinned in `package.json`. Install with `pnpm install --frozen-lockfile`.

```sh
pnpm dev ajigu
pnpm dev typenote
pnpm check
pnpm test
pnpm build
pnpm preview
```

The dev and preview servers bind to loopback. Default ports are 8770 for the
studio, 8771 for Moodsk, 8772 for TUTU, 8773 for Go Sleep, 8774 for DailyApod,
and 8775 for TypeNote. Preview maps navigation between all six local sites while
preserving production metadata. Use `pnpm dev <site>` to select one development
server, or `pnpm preview <site>` to preview one built site.

`pnpm build` collects final websites in `dist/<site>` for all six apps. Each
contains its own CNAME, sitemap and static assets. During agent tasks, run it
through the registered task-artifacts task; it then collects into that task's
`dist/` directory. `STUDIO_OUTPUT_DIR` can select another final output root.
The preview and build checker use the same output settings.

Astro compiler staging uses the shared `node_modules/.cache/studio-build/`
directory on the source volume; this avoids cross-device rename failures.
Dependency, compiler and generated-type caches are excluded from version control.

```sh
task-artifacts run TASK_ID -- pnpm verify
task-artifacts run TASK_ID -- pnpm test:browser
task-artifacts run TASK_ID -- pnpm test:layout
```

Browser checks use Playwright with installed Chrome locally and installed
Playwright Chromium in CI. They cover all six websites and their language routes,
static compatibility pages, responsive layouts, product demos, sound opt-in,
storage failures and the original PNG export.
Layout checks cover every localized product detail page at six viewport widths.
They measure module and heading alignment, shared spacing, expanded chapters and
no-script fallbacks. The release-candidate workflow runs them after browser checks.
Use `pnpm format:check` to check the new workspace code style.

## Source and publication boundaries

Edit the new marketing sources in `apps/` and `packages/`. The root landing HTML
and `studio/` are the previous static reference, used by legacy regression tests.
The root `nameplate/` and `assets/` remain the original editor and asset sources;
the workspace build includes them without applying its new layout or CSS.
Do not edit generated output or maintain the old product checkouts in parallel.

The main site publishes from the verified `ajigu-com` CI artifact through
`.github/workflows/deploy-studio.yml`. Its deployment job has Pages and OIDC
permissions; the reusable candidate workflow remains read-only.

The five product sites use fixed existing repositories and dedicated
`ajigu-site-production` artifact branches. The guarded publisher downloads the five fixed artifact names directly from a
successful `Deploy studio website` run for the current source main revision.
It checks the target domains and release metadata;
without `--apply` it only prints the publication plan.

```sh
task-artifacts run TASK_ID -- node scripts/publish-products.mjs --revision SOURCE_SHA --run RUN_ID
task-artifacts run TASK_ID -- node scripts/publish-products.mjs --revision SOURCE_SHA --run RUN_ID --apply
```

Downloaded artifacts stay inside the registered task directory. Product source branches remain
historical references; maintain website source here. No cross-repository token is
stored in Actions. Product publication uses the operator's existing GitHub CLI
identity and jj credentials. After the first Pages source switch, request a Pages build
with `gh api repos/OWNER/REPO/pages/builds --method POST` if no build was queued.
Always check the published branch SHA and the live release marker before declaring
success. See `docs-ai/006-production-release/000-plan.md` and
its release record for target mapping, verification and rollback boundaries.

## Languages

- `/` — English (default)
- `/zh-hans/` — 简体中文
- `/ja/` — 日本語
- `/zh-hant/` — 繁體中文
- `/ko/` — 한국어

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
`apps/typenote/src/content/`. Product interactions are React components;
marketing layout and metadata are shared workspace modules.

For the four route-based product sites, edit `apps/<site>/src/content/pages.json`
and the app's React demo components. They use `ProductLanding.astro` from the shared
site kit. Editorial section HTML is trusted source checked into the app; do not
insert user input or fetched HTML. Moodsk retains its local six-scene renderer in
`apps/moodsk/public/showcase/`.

Legal, support, tutorial and guide pages remain in each app's `public/` directory.
The import baseline in `compatibility.json` records original URLs and file hashes,
including documented metadata repairs. Update it only for reviewed changes.
The old product repositories remain intact as historical deployment targets;
production publication uses the guarded artifact process above.
