# TypeNote Website

The TypeNote website is now maintained in this workspace. It builds to a separate
static site for `typenote.ajigu.com`, with its existing root query languages and
three keyboard-sound guide routes.

- `src/components/`: React marketing page, content sections and sound preview.
- `src/content/translations.json`: the five existing translation catalogs.
- `src/lib/`: safe language resolution and the user-enabled Web Audio preview.
- `public/`: retained static resource URLs and guides. The homepage does not load
  the legacy translation scripts that remain available at their original URLs.

From the repository root, run `pnpm dev typenote` or `pnpm build typenote`.
Follow the root README for task outputs, tests and release boundaries. The old
TypeNote repository hosts the generated production branch. Maintain its website
source only in this workspace.
