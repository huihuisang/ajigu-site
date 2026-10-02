# Nameplate Template Integration

- The independent source project is `/Users/huisang/Documents/GitHub/nameplate-studio`. Commit `738d9cc` added Navy & Gold, Coral Pop, and Forest on 2026-09-21. These changes had not been copied to ajigu-site before the SEO release. The published catalog still contained only Blank and Classic.
- Sync the source catalog selectively. Do not run its old `deploy-ajigu.sh`: it removes the entire destination and overwrites the static language pages and SEO integration. It also does not copy the additional template backgrounds.
- The published catalog now includes Blank, Classic, Navy & Gold, Coral Pop, and Forest. New images are copied from the source project's `assets/templates/` into `nameplate/assets/templates/`.
- Classic uses the lower half of the legacy square artwork. New backgrounds are complete 2:1 panels and must not use Classic's source crop. Template text coordinates use a 2362 by 1181 reference panel and scale with the current card size.
- Load the background images before building thumbnails or applying the initial template. Resolve their URLs against the shared app script directory, not the active locale path.
- Locale switches rebuild localized thumbnails and translate only the built-in sample name. User-entered names and the selected template remain unchanged.
- Run `node --test scripts/seo.test.mjs scripts/templates.test.mjs`, `node --check nameplate/app.js`, and `node scripts/build-nameplate.mjs --check` before release.
- Validation for the template sync: all 11 tests passed. Browser checks showed five template options, retained a custom name and selected template during a locale switch, and showed PNG success messages for all four designed templates. Downloaded PNG file contents were not inspected.
