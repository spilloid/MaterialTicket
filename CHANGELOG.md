# Changelog

## 1.9.1 — 2026-06-21

### Added

- `AUTH_ADMIN_EMAILS` allowlist — emails listed here are granted the admin role on every OIDC/SAML login (promotion-only; non-listed users are never demoted).

### Fixed

- Inbound email subject threading no longer re-attaches on a bare `#NNNNN`. Only the bracketed `[#NNNNN]` tag we emit on outbound mail counts, so unrelated subjects ("Invoice #10042", "PO #12345") can't mis-thread a new email onto an existing ticket.

See [RELEASE_NOTES_v1.9.1.md](RELEASE_NOTES_v1.9.1.md) for the full release notes.

## 1.9.0 — 2026-06-21

### Added

- Configurable public ticket-number sequence and UI display across all ticket surfaces.
- Subject-based email threading fallback using `[#NNNNN]`.
- Sync provider create/delete management and reusable sync badges.
- Live Tactical RMM device details on ticket open.
- SOPS-managed integration deployment secrets.

### Changed

- Widened Message-ID-bearing columns to `varchar(255)`.
- Clamped bounded ticket, note, and IMAP values before database writes.
- Ticket exports now use public ticket numbers.
- Local Compose applies the Prisma schema before backend startup.

### Fixed

- Invalid ticket/note route IDs now return HTTP 400 instead of passing `NaN` to Prisma.
- Web container health checks now use IPv4 loopback.

See [RELEASE_NOTES_v1.9.0.md](RELEASE_NOTES_v1.9.0.md) for the full release notes.
