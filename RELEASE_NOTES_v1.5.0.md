# AnchorDesk v1.5.0 — CRM glue and a polish pass

The CRM from 1.4.0 gets connected up: existing ticket/device data flows into real
companies, the network map filters by company, time entries are fully editable,
and the ticket list finally shows the context that matters.

## Highlights

- **🔁 One-click backfill.** "Import from ticket/device data" turns every legacy
  `companyName` string on your tickets and devices into a real **Company** record
  and links them by id — idempotent, so it's safe to re-run as new data arrives.
- **🕸️ Company-scoped network map.** From a company page, jump straight to the
  network view **filtered to that company's devices** (its `devices` now populate
  after backfill or company assignment).
- **⏱️ Editable time entries.** The ticket's time card lists each logged entry with
  author and date; edit the minutes inline or delete an entry, and the per-ticket
  and per-company totals update instantly.
- **🎫 A ticket card worth looking at.** Rebuilt on the shared theme: status and
  priority chips (consistent colors), company, and assignee at a glance — no more
  hardcoded gradients or stale status names.
- **✨ Polish.** Timeline notes use theme colors, time entries read clearly
  (`Time: 30m`), and empty states guide you toward linking companies/devices.

## Notes

- Stack: React + MUI · Fastify + TypeScript · Prisma · PostgreSQL
- Images: `ghcr.io/spilloid/anchordesk-backend:1.5.0`, `ghcr.io/spilloid/anchordesk-web-client:1.5.0`
- License: MIT
