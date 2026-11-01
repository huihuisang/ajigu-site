# Repository Integration

Repository paths start at the project root. File lists within a product module
are relative to that module. Verify entry points against current code before
editing. Product and route counts can change.

## Gallery content

Edit `apps/ajigu/src/content/home.json`. Each locale has a `products` array with
`id`, `name`, `url`, `art`, `icon`, `platform`, and `description`. Match the current
schema and keep IDs unique. `HomePage.astro` selects the generated image through
`gallery.json`; changing a legacy `art` field alone does not replace the image.

Read the current locale entries rather than assuming a fixed count. Add truthful
localized descriptions and the correct destination to each entry. Use the existing
locale-specific route conventions; an external release URL may be shared.

Inspect homepage metadata and structured data for product lists and counts. Update
only data affected by the new entry. Read the user's SEO playbook and project SEO
instructions when changing indexing, search metadata, or sitemap behavior.

Keep layout in `GalleryCard.tsx` and `apps/ajigu/src/styles/gallery.css`. The shared
homepage has a 1320px maximum width and automatic grid tracks with a 300px minimum.
Card gaps are 24px, or 16px at phone widths. Preserve the left-image/right-copy
layout, 224px minimum card height, and content-driven growth.

Gallery-only work ends here after asset integration and validation. Do not add
internal routes, sitemap entries, demo titles, or legacy host configuration for an
external product destination.

## Detail routes and content

The main application is `apps/ajigu`. Add a product module under
`apps/ajigu/src/products/<product-id>/` when a detail page is requested. Inspect a
current route-based product module for the file structure:

- `content/product.json`: `ProductIdentity` values.
- `content/pages.json`: localized `ProductPage` records.
- `Page.astro`: compose the shared landing template and optional demo.
- `components/`: product-specific browser interaction, when useful.

Check required fields in `packages/site-kit/src/models.ts`. Each page needs accurate
metadata, reciprocal language links, heading, claim, intro, actions, note, sections,
footer links, route, locale, and main ID. Use empty optional content where the
schema permits it. Do not copy unsupported claims or another product's SEO data.

Register each supported route in `apps/ajigu/src/pages/[...route].astro` or the
current equivalent. Prefer path-based locales for new products. Preserve existing
products' route formats, including query-based localization.

### Route and build boundary

Read `packages/site-kit/config/urls.mjs` before using `productPath` or
`migrateContent`. Currently, `productPath` accepts only the root site and entries
in `legacySites`. It throws `Unknown product` for a new product ID.

The same `legacySites` map drives static copying, compatibility contracts,
sitemap merging, preview aliases, and redirect generation. Adding a new product
there also activates historical migration workflows. Do not invent a domain or
compatibility baseline to make those loops pass.

For a new product, use fully namespaced routes and asset URLs in its page data and
pass them directly to the shared template. Root-site URL handling can preserve
those URLs without treating the product as a legacy site. If shared URL helpers
must support new products, separate product route registration from historical
domain migration and test the boundary before adopting the change.

Read `scripts/workspace.mjs` before choosing an asset directory. It stages a
generated public directory and explicitly copies existing product trees. A new
`apps/ajigu/public/<product-id>/` folder does not automatically enter the final
output. Add the smallest explicit staging change needed for the new resources,
without adding it to legacy redirects.

Add all new canonical routes to the current sitemap source. At present, the root
`sitemap.xml` is staged and then merged by `scripts/site-output.mjs`. Verify the
built sitemap, canonical links, alternate language links, and destination files.
Do not list external release URLs in the site's sitemap.

The root sitemap also participates in `scripts/seo.test.mjs`, which checks the
older static reference pages. Extend its expected URL set for generated detail
pages while keeping the static-page checks. Prefer comparing the complete built
URL set with its source sitemaps over increasing a hardcoded total.

### Shared layout and behavior

Use `packages/site-kit/src/layouts/ProductLanding.astro`, `ProductHero`,
`ProductSections`, and shared header/footer components. TypeNote and Nameplate
have specific page composition; they are not the default scaffold for a new app.

The default reading order is hero, demo, features, supplemental chapters, FAQ,
download, and footer. `ProductSections` uses stable section IDs:

- `features` is shown directly.
- Other sections become a single-open accordion after hydration.
- `faq` and `download` follow the supplemental chapters.

Keep section IDs unique and stable so hash links can reveal chapters. The current
header links to `#features` and `#faq`; provide those targets or explicitly adapt
the header for the new page. Keep static text readable without JavaScript.

Keep the hero centered. Use the `demo` slot for the product's own preview and
`showcaseTitle` for a localized title. Supply first, second, and later hero actions
with the existing default, outline, and link hierarchy. The template's current
custom-art branch is specific to an existing product; inspect it before extending
that behavior. An empty Astro slot is truthy, so slot truthiness is not a reliable
fallback switch.

Use shared shadcn controls and neutral tokens. The `.detail-flow` container owns
64px module gaps, reduced to 48px at 640px and below. Section content gaps are
24px. Content width is capped at 1040px, with 32px desktop and 20px phone gutters.
Do not add repeated shell gutters inside accordion content or narrow the FAQ
independently. Navigation retains its wider 1320px shell.

Keep product preview behavior separate from shared UI. Reuse existing patterns
for lifecycle cleanup, keyboard interaction, reduced motion, and offscreen pause.
Audio requires explicit opt-in. Raw section HTML is trusted repository content;
do not insert user-provided or remote HTML without safe handling.

## Validation and delivery

Read package scripts and current checks before choosing commands. Common checks:

```sh
pnpm format:check
task-artifacts run "$task_id" -- pnpm verify
task-artifacts run "$task_id" -- pnpm test:browser
task-artifacts run "$task_id" -- pnpm test:layout
```

Run `test:design` when shared visual behavior or motion changes. Run redirect
checks when migration or URL handling changes. Reuse one registered task output
directory for the related build and browser checks so they inspect the same build.
Format only files in scope; a repository-wide formatter can change unrelated work.

Inspect explicit product sets and route counts in `tests/gallery.test.mjs`,
`tests/workspace.test.mjs`, `tests/browser.mjs`, `tests/detail-layout.mjs`,
`scripts/check-build.mjs`, and preview helpers. Extend coverage for the new product;
do not merely increase a count until checks pass. Preserve legacy contract checks.
Current browser helpers derive product origin aliases from legacy hosts. New
detail cases can use the root origin and their complete routes, without a fake
legacy alias. Detect homepage markup explicitly for gallery assertions; the root
origin also serves product detail pages. Include the card click, detail language
switch, and release target in the navigation checks.

Verify image hashes, local asset availability, all homepage locales, and card
destination behavior for either scope. For detail pages, also verify canonical and
language metadata, navigation anchors, actions, no-script content, keyboard controls,
and absence of horizontal overflow. Cover the current layout matrix, including
320, 390, 640, 768, 1024, and 1440px, where shared layout behavior changes.

Add focused regression tests for new stable behavior and failures. Use the existing
test style. Treat a browser command as evidence for the new product only after its
cases actually include the new entry. Document unrelated pre-existing failures
separately from failures introduced by the task.

Save required evidence outside disposable output and update the relevant project
decision record and memory index. Follow the authorized version control and
publication workflow. Keep temporary outputs when cleanup conditions are unmet.
