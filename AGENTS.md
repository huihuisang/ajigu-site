# ajigu Website Agent Guide

## Project Scope

This pnpm workspace owns the ajigu website and its listed applications. Use [README.md](README.md) for the workspace and publication boundaries.

## Required Constraints

- Push only when the user explicitly requests it for the current change.
- Keep source and publication boundaries in the README. Build the public artifact through the workspace scripts and deploy only with explicit authorization.
- Preserve locale routing, permanent redirects, public asset ownership, and third-party notices.

## Verification

- For prose-only changes, check the document and any edited links. For code or content that feeds the site, run `pnpm check` or the affected `pnpm test` suite. Run `pnpm verify` for changes to shared build, routing, or output contracts.
- For visual or navigation changes, use the matching browser, layout, locale, or redirect check documented in the README.

## Read for This Task

- Adding a product → [ajigu-add-product](.agents/skills/ajigu-add-product/SKILL.md).
- Layout, shared components, or accessibility → [design QA](design-qa.md) and the design-system section of the README.
- Publishing or changing routes and assets → the source and publication section of the README and [third-party notices](THIRD_PARTY_NOTICES.md).
