import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
  } from "@mui/material";
  import { Ticket } from "../interfaces";
  
  interface TicketDialogProps {
    ticket: Ticket | null;
    open: boolean;
    onClose: () => void;
    shortenedSummary: string;
  }
  
  const TicketDialog: React.FC<TicketDialogProps> = ({ ticket, open, onClose, shortenedSummary }) => {
    if (!ticket) return null;
  
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Ticket #{ticket.ticketnumber} - {ticket.ticketTitle}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>
            {ticket.ticketTitle}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {shortenedSummary}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Priority: {ticket.priority}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Company: {ticket.company.CompanyName} (Acronym: {ticket.company.Acronym})
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default TicketDialog;
  