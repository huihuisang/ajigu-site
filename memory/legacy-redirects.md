# Legacy Domain Redirects

- On 2026-11-01 the user authorized moving five legacy domains to an independent redirect service and deleting their five former repositories after verification. Decision and evidence: docs-ai/008-legacy-domain-retirement.
- Production redirects now use six Cloudflare Single Redirects plus the existing www rule. Keep the shared /studio and /licenses rule before the five exact-host product rules. Use 301 and preserve_query_string=true.
- The five CNAME records point to ajigu.com and are proxied. All 18 other DNS records remain unchanged. Full DNS snapshots stay in the private persistent backup directory; only scoped records and hashes are stored in the public repository.
- Rule source: scripts/legacy-redirect-rules.mjs. Live verification: scripts/check-edge-redirects.mjs, 184 HTTP/HTTPS cases plus real browser URL/fragment/locale checks.
- Former cross-repository publication is retired. Offline HTML compatibility fixtures remain for regression tests and are not production hosting.
- Persistent Git bundles and metadata backups were restored and verified. Do not clean the backup directory. The guarded retirement script requires fresh validation and never permits deleting ajigu-site. Repository deletion is pending sufficient GitHub credential permissions; check the action record before assuming the five repositories are absent.
