/**
 * Single source of truth for ticket status + priority vocabulary.
 *
 * Before 1.3.0 the create dialog, Kanban board, and ticket modal each defined
 * their own status/priority lists — so a ticket set to "Assigned" in the modal
 * never appeared on the board, and priorities disagreed (labels vs 1–6). Import
 * from here everywhere instead.
 */
import type { ChipProps } from "@mui/material";

/** Active ticket statuses, in workflow order. "Deleted" is a soft-delete state
 *  the UI hides, so it's intentionally not listed here. */
export const TICKET_STATUSES = [
  "New",
  "Assigned",
  "In Progress",
  "Waiting",
  "Resolved",
  "Closed",
] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const DEFAULT_STATUS: TicketStatus = "New";
export const DEFAULT_PRIORITY: TicketPriority = "Medium";

export function statusColor(status: string): ChipProps["color"] {
  switch (status) {
    case "Resolved":
    case "Closed":
      return "success";
    case "In Progress":
    case "Assigned":
      return "warning";
    case "Waiting":
      return "default";
    case "Deleted":
      return "error";
    default:
      return "info"; // New / unknown
  }
}

export function priorityColor(priority: string): ChipProps["color"] {
  switch (priority) {
    case "Critical":
      return "error";
    case "High":
      return "warning";
    case "Medium":
      return "info";
    default:
      return "default"; // Low / unset
  }
}
