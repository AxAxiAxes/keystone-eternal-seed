# 2026-09-11 Public site TLS status

**Status:** Read-only public availability observation

## Observed at 2026-09-11T07:49Z

| Endpoint | Standard HTTPS result | Additional observation |
| --- | --- | --- |
| `https://xiiom.com/` | `200` | Public root reachable. |
| `https://xiiom.com/health` | `200` | Health endpoint reachable. |
| `https://xiiom.com/support` | `401` | Expected authenticated-operator route response. |
| `https://axescontracting.com/` | TLS validation failure | The presented certificate is expired. |
| `https://www.axescontracting.com/` | TLS validation failure | The presented certificate is expired. |

`xiiom.com` presented a certificate valid from 2026-09-05 through
2026-12-04. Both AXES Contracting hostnames resolved to `35.215.76.145`.
With certificate verification explicitly disabled for diagnosis only, the AXES
Contracting apex returned `200`, `www` redirected to the apex, and `/health`
returned `404`.

## Interpretation and boundary

The AXES Contracting service may still be reachable behind its TLS endpoint,
but an expired certificate prevents normal browser access. The evidence does
not establish the host owner, active deployment version, DNS correctness,
production readiness, security posture, or a remedy.

No Railway, DNS, certificate, account, deployment, credential, or application
configuration was changed. Restoring browser access requires an authorized
operator with access to the service currently terminating TLS to renew or
reissue the certificate, then verify both hostnames with normal certificate
validation.
