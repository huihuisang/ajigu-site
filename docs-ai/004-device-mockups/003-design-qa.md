# Front-view Mockup Gallery QA

final result: passed

## Target and normalization

The user requested downloaded free iPhone, iPad and Mac templates, real screenshots inside them, and complete images displayed directly. The original reference is `docs-ai/003-gallery-home/evidence/reference.jpg` (2048 × 1192, reduced from the supplied 4218 × 2456 image).

Final in-app browser evidence is in `docs-ai/004-device-mockups/evidence/`:

- `home-desktop.jpg`: 1440 × 1040 full page, 1440 × 960 CSS viewport, density 1.
- `home-tablet.jpg` and `home-mobile.jpg`: 768px and 390px CSS widths, two columns and one column, with no horizontal overflow.
- `comparison.jpg`: source and final render together, normalized to equal content width, opened as one comparison input.
- `phone-detail.jpg`: reference phones and the actual exported Go Sleep mockup together, also opened and inspected.

State: `/zh-hans/`, default gallery. The reference contains unrelated apps, no navigation or captions, and a partial third row. The implementation retains product captions and six real products. These differences are intentional; this is not a claim of pixel identity.

## Fidelity surfaces

| Surface | Observation |
| --- | --- |
| Typography | Small system-font captions and restrained navigation remain outside images. App text stays in the actual screenshots. No added promotional type. Passed. |
| Spacing and layout | Equal 4:3 media panels and narrow gutters match the reference. All downloaded devices face forward, centered with consistent height and close group spacing. No gallery rotation, perspective or floating animation. Passed. |
| Colors | White page and neutral #efefef media backgrounds. Native app screenshots supply all other color and dark regions. Passed. |
| Image quality | One complete 1600 × 1200 WebP per tile. Actual templates, alpha masks and contain sizing preserve the screen ratio. No generated or redrawn UI. All six images load; total 518,992 bytes. Passed. |
| Copy and content | Six names, five locales and existing product targets remain. TUTU correctly lists iPhone and iPad. Passed. |
| Icons | Caption icons retain 36px dimensions and 22% corners. Device artwork and attribution come from MockUPhone. All six gallery image transforms compute to none. Passed. |

## Corrections and actual checks

The rejected CSS perspective and layered devices were replaced by exported template images. The first TypeNote native capture was inactive; the app was activated and captured again. Early two-phone spacing was tightened to 36px inside the exported canvas. Final evidence covers these corrections.

TypeNote and DailyApod use fresh native builds and captures. DailyApod shows real SkyView and SolarSystemView, with Orion selected through native Search; mismatched article fixtures were excluded. TUTU uses its verified iPad screenshot, Nameplate a fresh browser capture, and Moodsk/Go Sleep the previously verified native screens.

The in-app browser checked three widths, loaded image dimensions, zero transforms, icons and the TypeNote target. Its warning/error log was empty. The viewport was reset and the gallery remains open. The complete 228 page/viewport checks and product interactions passed, including language/storage boundaries, reduced motion, no JavaScript, PNG export and static URL contracts. Type checks and all 46 tests passed. See `browser-results.json` in the evidence directory.

## Residual observations

TUTU retains empty native editing canvas around its landscape photo in the portrait iPad. TypeNote and DailyApod retain their native dark appearance. These are actual UI states, not missing images. No actionable P0/P1/P2 finding remains in this gallery scope. Product page layouts were not redesigned.
