# AnchorDesk v1.6.0 — Email correspondence, scale, and tighter CRM links

This release makes a ticket a real two-way conversation, hardens the ticket list
for large volumes, and tightens how probes, companies, and devices relate.

## Email correspondence on a ticket

- **Compose HTML email from a ticket** with a WYSIWYG editor (bold/italic/lists/
  quotes/links), Cc, and a one-click **Reply** that prefills the recipient and a
  `Re:` subject.
- **Replies thread back onto the same ticket.** Outbound mail now sets proper
  `Message-ID` / `In-Reply-To` / `References` headers and persists its id, so a
  customer's reply lands on the original ticket instead of opening a duplicate.
- **HTML is preserved both ways and sanitized.** Inbound IMAP mail keeps its HTML
  (scripts/handlers/`javascript:` URIs stripped), and the same sanitizer runs on
  outbound; the client sanitizes again on render.
- **Conversation view.** Email shows as inbound/outbound bubbles with from/to/
  subject, distinct from internal notes, on the ticket timeline.

## Time tracking

- **Duration *or* Start–Stop.** The time card now has a mode toggle: keep the
  quick presets/manual minutes, or enter a start/stop window with a live duration
  preview. Both store canonical minutes.

## Scale & UX

- **Server-side pagination (fixes a silent cap).** The ticket list previously
  loaded at most 200 rows and rendered everything client-side — beyond 200,
  tickets were invisible. The list is now fully paged server-side and returns a
  total count.
- **Virtualized table.** The table view uses a server-paginated, virtualized data
  grid; cards paginate; the kanban board is bounded with a "showing N of total"
  notice (narrow with search/filters).
- **Server-side search & filters.** Search and the filter dialog now query the
  server (status / company / assignee from canonical sources), so results are
  correct regardless of page.
- **Card-size slider removed** in favor of a proper responsive grid
  (`xs/sm/md/lg`) that renders cards at sensible widths on every breakpoint.

## CRM / probes

- **Probes are first-class linked to companies.** `Probe.companyId` is now a real
  relation (selectable in Admin → Probes, on create and inline), and that company
  flows onto every device the probe discovers — not just a denormalized name.

## MCP

- Tool parity with the new ticket actions: `list_tickets` now returns
  `{ items, total, page, pageSize }` plus a `q` search; added `log_time` and
  `send_ticket_email` tools.

## Breaking / migration

- **`GET /tickets` response shape changed** from a bare array to
  `{ items, total, page, pageSize }`. Update any direct API consumers.
- Schema: new `Note` email columns, `Probe.companyId`, `Device.companyId` stamping
  on ingest. Apply with `prisma db push` (dev) or a migration (prod).

## Notes

- Images: `ghcr.io/spilloid/anchordesk-backend:1.6.0`, `ghcr.io/spilloid/anchordesk-web-client:1.6.0`
- License: MIT
