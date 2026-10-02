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
```

The generator updates English fallback text and creates the Chinese page. Do not edit `nameplate/zh-hans/index.html` directly. Keep the guide consistent with the actual editor and export behavior.

## Editing

Edit the HTML files directly, commit to `main`, and GitHub Pages will publish.
When adding studio copy, update all five homepage locales. Update sitemap dates only for pages that changed.
