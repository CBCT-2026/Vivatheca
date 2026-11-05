# `vivatheca.com` domain preparation — TDD record

## User journey

As an authorized preview visitor, I want the protected Vivatheca platform to identify `https://vivatheca.com` as its canonical origin so links and social previews are ready for the final domain without changing the landing experience.

## RED

Commit `df7d1d9` added a Playwright guarantee for the canonical link, `og:url`, Open Graph image and X image. The focused desktop and mobile run failed because no canonical link existed and relative social images had no production-domain base.

## GREEN

Commit `9c5303b` added the `https://vivatheca.com` metadata base, canonical link and Open Graph URL. After rebuilding the production output, the same focused desktop and mobile run passed 2/2 tests.

Release validation passed all 18/18 Playwright tests across desktop and mobile Chromium, ESLint with no errors, and the Vinext production build.

## Guarantees

| What is guaranteed | Test | Type | Result |
| --- | --- | --- | --- |
| Canonical metadata identifies `https://vivatheca.com` | `production metadata uses the vivatheca.com canonical origin` | Playwright E2E | PASS |
| Open Graph and X images resolve to the apex production origin | Same test | Playwright E2E | PASS |

The DNS and edge-authentication controls are external hosting configuration. Their activation checks are recorded in `docs/hosting/vivatheca-com-cutover.md` and cannot be completed until the Cloudflare DNS records propagate.
