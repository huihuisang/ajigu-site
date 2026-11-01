# Product Screenshots

- Gallery mockups use transparent RGBA WebP canvases. Keep device and screenshot pixels in the existing renderer; let CSS supply the surrounding material. Do not flatten a gray background into exports. The regression checks WebP alpha and transparent preview containers; see docs-ai/011-lumno-design-system/002-transparent-previews.md.

- DailyApod must lead with its APOD home in both the main gallery mockup and the product screenshot selector. The selector then shows Discover, Search, Favorites, Sky view, Solar System, and App overview. Keep the main mockup at three devices so it remains readable.
- Capture the normal native app with live, matching images, titles, and credits. The existing home screenshot fixture pairs an astronaut image with a nebula title and must not be used for product marketing.
- Screenshot inputs and capture details are in `design/mockups/screens.json`; mockup order is in `design/mockups/products.json`. Run `scripts/render-mockups.py` after changes, then rebuild the website to copy the images into `/studio/screens/` and `/studio/products/`.
