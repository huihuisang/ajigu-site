# SEO Operations

- `ajigu.com` is the studio site. It lists product sites on separate subdomains.
- Each subdomain must retain its own `robots.txt`, sitemap, canonical URLs, and Google Search Console sitemap submission.
- `snorz.ajigu.com` is retired and must not be configured. The live product is `https://gosleep.ajigu.com/`, which is deployed from `huihuisang/snorz-site` and has an approved GitHub Pages certificate.
- Google Search Console coverage is the source of truth for index status. `site:` queries are only a rough discovery signal.
- 2026-09-20 baseline for the `sc-domain:ajigu.com` property: 12 indexed pages, 37 not indexed pages, and 3 total web search clicks. The not-indexed set had 34 "Discovered - currently not indexed", 2 redirects, and 1 "Crawled - currently not indexed".
- Submitted sitemaps: root, TypeNote, Go Sleep, Daily APOD, and Moodsk. The first four had `Success`; Moodsk was submitted on 2026-09-20 but Search Console initially reported `Couldn't fetch` despite a public HTTP 200 response. Recheck this report before treating Moodsk as indexed.
- Prioritize canonical entry pages for URL Inspection requests. Do not request each translated page individually; let Google discover them through the sitemap and internal links.
- 2026-09-29 canonical audit: `/ko/` and `/zh-hant/` had missing trailing slashes in their canonical URLs. Published the fixes in ajigu-site commit `be6d404`.
- 2026-09-29 guide audit: the Go Sleep and Daily APOD guide pages had malformed canonical and `mainEntityOfPage` URLs (the hostname was joined to a filename). Published corrections in `huihuisang/snorz-site` commit `23d2b01` and `huihuisang/dailyapod-site` commit `cb8f13b`.
- 2026-09-29 Nameplate Studio audit: Search Console URL Inspection reported `https://ajigu.com/nameplate/` as indexed. The English product name was absent from its HTML title and description, so the page metadata now includes the English name and purpose. Indexing and ranking are separate; monitor Search performance for the exact query.
- 2026-09-29 product-site audit: TypeNote, Go Sleep, DailyApod, Moodsk, and TUTU homepages and sitemap URLs returned HTTP 200 with self-referencing canonicals. TypeNote's three keyboard-sounds guide pages had malformed canonical and Article `mainEntityOfPage` URLs; corrected them to their sitemap URLs in `huihuisang/typenote-landing` commit `868a0f4` and updated their sitemap `lastmod` dates. Search Console has not yet confirmed the effect on indexing.
- TUTU's sitemap was not among the five submitted sitemaps in the 2026-09-20 Search Console baseline. Verify current submissions before adding `https://tutu.ajigu.com/sitemap.xml`.
