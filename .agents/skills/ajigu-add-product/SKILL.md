---
name: ajigu-add-product
description: Add a product to the ajigu.com website, including gallery artwork, localized homepage cards, and an optional shared product detail page. Use when adding or onboarding a new product in ajigu-site. Do not use for building the product app, changing Nameplate editor templates, or general website redesign.
---

# Add an ajigu Product

Deliver a working product entry in the existing website. Keep the Gallery White
design and the single Astro application. Use current repository sources as the
authority when this guide and the implementation differ.

## Locate the project and define the result

Find the repository from the current workspace. Confirm that it contains
`apps/ajigu/src/content/home.json`, `design/mockups/products.json`, and
`packages/site-kit/src/layouts/ProductLanding.astro`. Do not search unrelated
folders for a missing checkout. Ask for the repository location if needed.

Read applicable `AGENTS.md` files, `README.md`, and relevant project memory.
Inspect the current working changes with the repository's version control flow.
Preserve edits from other tasks. Use the current checkout unless instructed
otherwise.

Establish these inputs from the request, product sources, or authorized links:

- Stable lowercase product ID, display name, supported platforms, and true claims.
- Verified download, release, store, or website URL and its release status.
- Original icon, authentic screenshots or artwork, and evidence of their origin.
- Required languages, homepage position, and the intended destination.

Choose the scope from the user's request:

| Scope | Result |
| --- | --- |
| Gallery only | Localized homepage cards link to a verified external destination. No detail page is created. |
| Gallery and detail | Cards link to localized routes in the existing application, with shared layout and appropriate product content. |

Honor an explicit choice. If the destination is unclear, recommend the scope
supported by the available content and ask only for that missing decision.
Continue independent asset and source checks while waiting. Do not invent a
download URL, release status, price, capability, testimonial, or screenshot.

## Add the gallery entry

Read [Gallery assets](references/gallery-assets.md) before preparing media.
Read the gallery section of [Repository integration](references/integration.md)
before editing content. Reuse an existing product entry to learn the current
schema, without copying its claims, metadata, or links.

Use original artwork when no authentic interface capture is available. An app
icon is acceptable artwork; a fabricated interface is not an app screenshot.
If neither a verified icon nor suitable artwork is available, report the missing
asset and complete only the independent work.

Add the product to every current homepage locale. Preserve existing order and
use the same position across locales unless the user specifies a different order.
Keep descriptions concise and consistent with the source product facts.

## Add a detail page when in scope

Read the detail section of [Repository integration](references/integration.md).
Compose the shared template and components. Keep product-specific behavior in
the demo slot.

Every detail page must have a dedicated, visible core-feature section, separate
from the hero. Identify the main user task, its key action, and its visible result
before choosing media. Use authentic core-screen captures or an actual workflow
video to explain that task. Read the core-feature section of
[Gallery assets](references/gallery-assets.md) when selecting this media.

An overview-only home image, app icon, empty state, or text-only feature list does
not satisfy this section. A home screen can qualify when it is the actual core
workspace and visibly demonstrates the main action and result. The gallery image
and the detail demonstration serve different purposes.
Keep a short localized explanation of the demonstrated action and result beside
the media. If suitable core media is missing, obtain it or report the gap before
calling the detail page complete; do not silently repeat the homepage.

Separate new product routes from historical domain migration. Check routing,
public asset staging, sitemap generation, and test coverage together. A new
product is not a retired website and does not need a fake legacy host or import
contract.

Follow project requirements for a specification and decision record when the
work introduces an important feature or changes shared architecture. Reuse an
existing decision when authorized; do not reopen settled design choices.

## Verify and deliver

Use the repository's task output workflow before captures, rendering, or builds.
The media renderer writes checked-in assets and manifests; a task output wrapper
does not redirect those files. Review its diff and preserve unrelated changes.

Follow the validation section of [Repository integration](references/integration.md).
Include the new product in checks that previously enumerated products or routes.
Run real browser checks for new observable behavior and record what was actually
tested. Inspect desktop and mobile media for clipping and unreadable composition.

Report the added destinations and languages, asset sources, changed files, checks,
and any missing inputs or unverified behavior. Update a focused project memory
entry when the task establishes a reusable project rule.

Stop at the authorized delivery boundary. Commit, push, deployment, live service
changes, or external messages require authorization from the current task or
applicable existing instructions. This skill grants none of those permissions.
