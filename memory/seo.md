# SEO Operations

- `ajigu.com` is the studio site. It lists product sites on separate subdomains.
- Each subdomain must retain its own `robots.txt`, sitemap, canonical URLs, and Google Search Console sitemap submission.
- `snorz.ajigu.com` is retired and must not be configured. The live product is `https://gosleep.ajigu.com/`, which is deployed from `huihuisang/snorz-site` and has an approved GitHub Pages certificate.
- Google Search Console coverage is the source of truth for index status. `site:` queries are only a rough discovery signal.
- 2026-09-20 baseline for the `sc-domain:ajigu.com` property: 12 indexed pages, 37 not indexed pages, and 3 total web search clicks. The not-indexed set had 34 "Discovered - currently not indexed", 2 redirects, and 1 "Crawled - currently not indexed".
- Submitted sitemaps: root, TypeNote, Go Sleep, Daily APOD, and Moodsk. The first four had `Success`; Moodsk was submitted on 2026-09-20 but Search Console initially reported `Couldn't fetch` despite a public HTTP 200 response. Recheck this report before treating Moodsk as indexed.
- Prioritize canonical entry pages for URL Inspection requests. Do not request each translated page individually; let Google discover them through the sitemap and internal links.
