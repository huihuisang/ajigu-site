# Gallery mockups

Each gallery tile displays one complete WebP image. Device frames, masks and
screenshots are production inputs here; they are not browser layers.

Templates come from MockUPhone revision
`7e570f420ad91d895df926214c206d0833fb53a5`. See `templates.json` and
`../../THIRD_PARTY_NOTICES.md` for origins, credits, hashes and licenses.
`products.json` selects screenshots and devices. `screens.json` records screenshot
provenance. Screenshots use contain sizing to retain their full aspect ratio.

To export with Python 3 and Pillow installed:

```sh
task-artifacts run TASK_ID -- python3 scripts/render-mockups.py
pnpm format
```

The script updates `apps/ajigu/public/gallery/*-mockup.webp`,
`apps/ajigu/src/content/gallery.json` and `outputs.json`. Website builds consume
these checked-in images and do not need Python or a mockup service. Existing
public image URLs remain available.

TypeNote and DailyApod screenshots were captured from fresh native builds without
editing their sources. DailyApod shows the real SkyView and SolarSystemView;
the older media fixtures with mismatched titles were excluded. Nameplate uses a
fresh browser capture. TUTU uses its verified native iPad screenshot. Go Sleep and
Moodsk reuse the previously verified native screenshots.

LogLift uses a lossless capture of the installed 0.1.0 (1) app's camera-selection
home, taken on 2026-11-02 in Simplified Chinese with Dark appearance. The app was
already running; the capture did not change its source, settings, or user data.
Its full native window is contained in the existing MacBook Pro template. The
former icon artwork remains available as a historical input and stable public URL.
