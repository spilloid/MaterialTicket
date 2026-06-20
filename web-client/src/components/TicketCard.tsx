import React from "react";
import { Card, CardContent, CardActionArea, Typography, Box, Chip, Stack } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import { Ticket } from "../interfaces";
import { statusColor, priorityColor } from "../ticketVocab";

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
  shortenedSummary: string;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick, shortenedSummary }) => {
  const date = ticket.dateEntered ? new Date(ticket.dateEntered).toLocaleDateString() : "";
  const company = ticket.company?.CompanyName;

  return (
    <Card sx={{ height: "100%" }}>
      <CardActionArea onClick={onClick} sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}>
        <CardContent sx={{ flexGrow: 1, width: "100%" }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={ticket.status} color={statusColor(ticket.status)} />
            {ticket.priority && <Chip size="small" variant="outlined" label={ticket.priority} color={priorityColor(ticket.priority)} />}
          </Stack>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }} gutterBottom>
            {ticket.ticketTitle}
          </Typography>
          {shortenedSummary && (
            <Typography variant="body2" color="text.secondary">{shortenedSummary}</Typography>
          )}

          <Stack spacing={0.5} sx={{ mt: 2 }}>
            {company && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <BusinessIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary" noWrap>{company}</Typography>
              </Box>
            )}
            {ticket.assignee && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary" noWrap>{ticket.assignee}</Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
        <Box sx={{ px: 2, py: 1, borderTop: 1, borderColor: "divider", width: "100%" }}>
          <Typography variant="caption" color="text.secondary">#{ticket.ticketnumber} · {date}</Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default TicketCard;
