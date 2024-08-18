import { Card, CardContent, Typography, Box } from "@mui/material";
import { Ticket } from "../interfaces";

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick }) => {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: "pointer",
        "&:hover": {
          boxShadow: 6,
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Ticket #{ticket.ticketnumber}
        </Typography>
        <Typography variant="body1">{ticket.ticketSummary}</Typography>
        <Typography variant="body2" color="textSecondary">
          Priority: {ticket.priority}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Company: {ticket.company.CompanyName} (Acronym: {ticket.company.Acronym})
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Engagement Manager: {ticket.company.PrimaryEngagementMgr}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Technicians:</Typography>
          {/* Add optional chaining and fallback to an empty array */}
          {ticket.technicians?.length > 0 ? (
            ticket.technicians.map((tech) => (
              <Typography key={tech.TechnicianID} variant="body2">
                {tech.FirstName} {tech.LastName} ({tech.Username})
              </Typography>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No technicians available.
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TicketCard;
