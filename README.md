# ajigu.com

Main brand site for ajigu — the home of [TypeNote](https://typenote.ajigu.com/) (macOS) and [Go Sleep](https://gosleep.ajigu.com/) (iPhone).

Static HTML, no build step. Deployed via GitHub Pages with a custom domain (`CNAME`).

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

## Editing

Edit the HTML files directly, commit to `main`, and GitHub Pages will publish.
When adding studio copy, update all five homepage locales. Update sitemap dates only for pages that changed.
