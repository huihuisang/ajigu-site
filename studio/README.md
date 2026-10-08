# Shared Studio Design

The approved direction uses the Bauhaus composition from the first visual concept
and local Pop Art accents from the second. Real product artwork keeps its own colours.

## Content and builds

`content.json` is the source for this repository's marketing pages. It contains
the locale routes, metadata, trusted editorial HTML, product links and existing
feature content. The studio also has `nameplate.json` for the two new product
introduction pages. Native editor sources and article sources remain separate.

```sh
node studio/build.mjs
node studio/build.mjs --check
node --test scripts/*.test.mjs
```

The shared files are `build.mjs`, `copy.mjs`, `runtime.mjs` and `style.css`.
The product repositories contain local copies. Make shared changes in ajigu-site,
then sync each product explicitly. Content and product media are never overwritten
by the sync command.

```sh
node studio/sync.mjs --target /path/to/product-repository
node studio/sync.mjs --target /path/to/product-repository --check
```

Run the local build in each changed product repository after syncing. Keep its
existing site checks. Homepage HTML is generated; edit `studio/content.json`
instead of editing the output alone. `media.json` records the actual intrinsic
dimensions of the WebP previews in `media/`. Preserve source artwork separately.

## Local review

```sh
node studio/preview.mjs --port 8770 --site /path/to/product-repository
```

The preview binds to loopback. It rewrites links between supplied sites in served
HTML, so reviewers can move through the local family of websites. Source URLs and
production metadata are unchanged. No server is needed in production.

Browser regression checks use the existing external Playwright runtime. They do
not add dependencies to the websites. Set `PLAYWRIGHT_MODULE` to its module file
and run through the registered task-artifacts task:

```sh
task-artifacts run TASK_ID -- node scripts/check-studio-browser.mjs /path/to/repository
```

## Interaction boundaries

- TypeNote listens only to its preview input and buttons. Sound starts after an
  explicit click. The basic web tone preview does not reproduce all native sounds.
- Go Sleep uses clearly labelled sample events and requests no microphone access.
- DailyApod switches local app screenshots, without a live NASA API dependency.
- Moodsk keeps its existing localized six-scene renderer and static fallback.
- Nameplate changes preview text with `textContent`. The full editor remains at
  its existing address and owns templates, import and export.
- Motion enhances visible static content and respects reduced motion.

The authoritative decision record is `docs-ai/001-studio-redesign/000-plan.md`.

## Monorepo migration

All six sites now use the workspace sources in `apps/` and `packages/`.
Use `pnpm build` for their release candidates. This directory and the root landing
HTML are the previous static reference, retained for compatibility checks. They
are not the source for new marketing changes. The product repositories remain
historical deployment targets and must not receive design file syncs for new work.
