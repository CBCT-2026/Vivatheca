# `vivatheca.com` protected-domain cutover

## Prepared state

- The validated Vivatheca platform remains hosted by the existing Cloudflare-backed Sites project.
- `https://vivatheca.com` is the canonical production origin used by canonical, Open Graph and X metadata.
- The apex custom domain has been registered with the hosting project and is pending DNS verification and certificate issuance.
- Hosted access remains `custom`, owner-only. Do not change the project to public while the private preview period is active.
- No password, token or Cloudflare credential belongs in this repository or in browser-delivered JavaScript.

## Cloudflare DNS records required for activation

The `vivatheca.com` zone is already delegated to Cloudflare nameservers. In Cloudflare DNS, add the records below exactly as supplied by the hosting platform. Review and resolve any conflicting apex `A`, `AAAA` or `CNAME` records before adding them. The Sites and Cloudflare dashboards remain authoritative for the proxy-state control because it is not included in the domain-registration response.

| Type | Name | Content |
| --- | --- | --- |
| `A` | `@` | `162.159.143.30` |
| `A` | `@` | `172.66.3.26` |
| `TXT` | `_openai-site-verification` | `openai-site-verification=W-UPOHWi2cmU_XQUWPotIfVFWPYtoR2qSdrWi8JMVQA` |
| `TXT` | `_cf-custom-hostname` | `a7b650dc-027c-4dbf-b6af-06545e08edf8` |

After DNS propagation, refresh the custom-domain status. Activation is complete only when domain status is `active`, provider status is active, SSL status is active, and `https://vivatheca.com` presents a valid certificate.

`www.vivatheca.com` is deliberately not configured in this release. Add it later as a redirect to the apex only when that hostname is explicitly requested.

## Temporary protected access

The current owner-only Sites policy is the initial password-protected gate: visitors must authenticate and only the named owner is authorized. Preserve this policy through domain activation.

If additional preview viewers are needed, use identity-based Cloudflare Access rather than a reusable shared Basic Auth password:

1. Create a self-hosted Access application for `vivatheca.com/*`.
2. Allow only explicit email addresses or verified Cloudflare account members.
3. Use Cloudflare identity or email one-time PIN as the login method.
4. Never use `Everyone` or an unrestricted “all valid emails” rule.
5. Keep a short preview session duration and remove viewers when review ends.

This keeps credentials out of source control, provides revocation and auditability, and prevents a shared password from being forwarded or reused.

## Acceptance checks

- An unauthenticated visitor is challenged before any landing-page HTML, GLB or generated asset is returned.
- An authorized visitor can load the complete landing page, manipulate the 3D model, navigate with keyboard and touch, and access downloads exactly as on the validated hosted build.
- Canonical, `og:url`, Open Graph image and X image metadata resolve to `https://vivatheca.com`.
- HTTPS is valid at the apex and HTTP redirects to HTTPS.
- The existing `chatgpt.site` address remains private and is not treated as the canonical public origin.

