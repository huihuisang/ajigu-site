# Gallery Assets

All repository paths below are relative to the target repository root.

## Source and output map

| Path | Purpose |
| --- | --- |
| `design/mockups/README.md` | Current export procedure and capture notes |
| `design/mockups/templates.json` | Device geometry, masks, origins, and licenses |
| `design/mockups/products.json` | Product ID, device selection, and ordered screen inputs |
| `design/mockups/screens.json` | Screenshot evidence, dimensions, and hashes |
| `design/mockups/outputs.json` | Generated source and output hashes |
| `scripts/render-mockups.py` | Complete gallery image renderer |
| `apps/ajigu/public/gallery/` | Checked-in final images and selected source media |
| `apps/ajigu/src/content/gallery.json` | Generated product-to-image map |
| `packages/site-kit/icons/` | Native icons and private `sources.json` evidence |
| `THIRD_PARTY_NOTICES.md` | Required third-party credits and license terms |

Inspect the current manifest entry shape before adding data. Record real byte
hashes and capture evidence; do not paste hashes or proof from another product.
Keep private source paths and provenance manifests out of published output.

## Capture and choose media

Prefer a current native app capture. When the user names the home screen or a
specific view, capture that view; an icon or another screen does not satisfy the
request. Use existing verified media or report the missing capture if needed.

Use `sim-use` for supported mobile devices as required by project instructions.
It does not capture native macOS windows. For a Mac app, use a native window
capture and respect the source project's launch rules. Reuse an already-running
app when suitable, without restarting it or changing user data. A web product can
use a real browser capture. Record the actual installed version; newer source
code does not prove that a feature exists in the downloadable release.

Check that visible images, titles, credits, and app state agree. Label sample data
when it could be mistaken for a real result. Keep personal data, private source
media, and unlicensed artwork out of public files.

Choose a front-view device that represents the captured platform. The existing
catalog provides MacBook Pro, portrait iPhone, and portrait iPad templates. Reuse
their masks and license records. Add a device only when the current catalog
cannot represent the product and its use is licensed.

Choose enough screens to explain the product without making the card unreadable.
One desktop or tablet is the established pattern. The current phone compositions
use three devices; this is not a requirement for every future phone product.

For artwork without a device, use the renderer's existing `artwork: true` branch.
Preserve the original art and record its origin. Do not pretend that artwork is a
captured app interface.

## Image contract

| Property | Current implementation |
| --- | --- |
| Final filename | `<product-id>-mockup.webp` |
| Final canvas | 1600 by 1200 pixels, 4:3 |
| Canvas color | `#efefef` |
| Encoding | WebP quality 92, method 6 |
| Screen fit | `contain`, centered, with original proportions |
| Composition | Device frame, mask, and screen baked into one complete image |
| Browser display | One image; no separate device layers or perspective transforms |

Match `screenBackground` to the screenshot where the device screen needs padding.
Do not stretch or crop the interface to force a fit. Keep devices front-facing;
use the shared card hover feedback instead of floating or tilting device artwork.

The hero reuses the same 4:3 file. Its current display box uses 16:9 with `contain`.
Do not crop or regenerate the source as 16:9 just to match that box.

The small app icon is a separate asset. Use `AppIcon` and a verified native icon at
`packages/site-kit/icons/<product-id>.webp`. Current display sizes are 40px in the
gallery and 72px in the detail hero. Shared styles provide corners and shadow.
Inspect the existing icon dimensions and encoding; preserve source transparency.

## Core-feature media for details

Select detail media from the product's main operation and result, independently
of the gallery artwork. Show the real working state: imported content, meaningful
controls, and the resulting output or comparison. A single core screen can cover
the task; use several screens or a workflow video when motion or a sequence is
needed to explain it. Do not impose a fixed number of screenshots.

Reuse verified product demonstrations when their version, content, and publication
scope fit the task. Preserve the originals. A prior local-only delivery does not
authorize public use of personal footage; complete local review and obtain the
needed permission before uploading or pushing that media.

For video, provide a representative core-workspace poster, intrinsic dimensions,
native playback controls, and localized surrounding text. Avoid autoplay and
unrequested sound. Keep an accessible description and readable static workflow
summary so the section remains useful without playback or JavaScript. Use
captions for spoken information; describe a silent demonstration clearly.

Check the actual media, not only its filename or existence. Verify that the
demonstration covers the promised action and result, then test media loading,
playback, pause, seeking, mobile fit, and the no-script fallback in a browser.

## Export and inspect

Check Python and Pillow availability before running the renderer. Use the current
task ID from the repository's task output workflow:

```sh
task-artifacts run "$task_id" -- python3 scripts/render-mockups.py
```

This regenerates every configured product and writes the checked-in gallery files
and both generated manifests. Inspect the whole diff. If existing inputs have
changed, identify those changes before accepting unrelated regenerated output.
Do not restore or overwrite another task's files to make the diff smaller.

The website build consumes the checked-in WebP files; production does not need
Python or a mockup service. `scripts/workspace.mjs` stages gallery files under both
`/gallery/` and `/studio/products/`, screenshots under `/studio/screens/`, and icons
under `/studio/icons/`. Confirm actual output URLs after building.

Inspect the final image and its rendered card at desktop and phone widths. Check
device scale, full-frame visibility, matched background color, icon quality, and
text readability. Retain stable public URLs for existing products.
