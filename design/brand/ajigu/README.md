# ajigu Official Mascot

The user designated the supplied plush chick as ajigu's official mascot on 2026-11-02.

## Assets

| File | Use |
| --- | --- |
| `reference.png` | Original supplied image. This is the identity reference. |
| `mascot-three-view.png` | Front, left-profile and back character reference sheet. |
| `mascot-promo-banner.png` | Wide promotional artwork with the existing studio headline. |
| `prompts.md` | Image generation prompts and identity constraints. |
| `manifest.json` | File dimensions, sizes and SHA-256 records. |

Keep the cream-white plush body, yellow hood with one yellow star, yellow sunglasses, orange beak, pink cheeks and red knitted scarf. Keep the soft plush material and rounded proportions.

The supplied reference shows the upper body. The full lower body, orange feet and rear costume details in the generated sheet are derived design details. The delivered side view faces left. Use the original reference if generated details conflict with it.

Both generated assets use the built-in image generation tool. They are project files, not temporary previews. They are not copied into the public website by the build.

## Website assets

Website icons are resized from `reference.png`, not from the generated sheet. Keep aspect ratio and transparency. Do not stretch, repaint or crop the character.

- `assets/logo.png` and `assets/logo.webp`: 256px square studio logo.
- `assets/favicon.png` and `assets/favicon.webp`: 64px square favicon.
- `nameplate/assets/ajigu-logo.png` and `.webp`: 128px studio attribution.
- `apps/ajigu/public/<product>/assets/ajigu-logo.png`: studio attribution in retained product pages.
- `packages/site-kit/media/ajigu.webp`: shared 128px footer mascot.
- `studio/media/ajigu.webp`: matching legacy source asset.

The product app icons and product favicons remain separate from the studio identity.

To rebuild the square PNG variants, run from the repository root:

```sh
magick design/brand/ajigu/reference.png -resize 240x240 -gravity center -background none -extent 256x256 assets/logo.png
magick design/brand/ajigu/reference.png -resize 120x120 -gravity center -background none -extent 128x128 nameplate/assets/ajigu-logo.png
magick design/brand/ajigu/reference.png -resize 60x60 -gravity center -background none -extent 64x64 assets/favicon.png
node scripts/build-images.mjs
```

Then sync the 128px attribution copies, update their reviewed compatibility digests and media byte counts, and run the repository checks. Agent runs must use their registered task-artifacts directory.
