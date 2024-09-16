// ./components/TicketDialog.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  TextField,
  Button,
  Chip,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { Ticket, Note } from "../interfaces";
import EditableField from "./EditableField";
import NotesSection from "./NotesSection";

interface TicketDialogProps {
  ticket: Ticket;
  open: boolean;
  onClose: () => void;
  notes: Note[];
  currentUser: any;
}

const TicketDialog: React.FC<TicketDialogProps> = ({
  ticket,
  open,
  onClose,
  notes,
  currentUser,
}) => {
  const [title, setTitle] = useState(ticket.ticketTitle);
  const [priority, setPriority] = useState(ticket.priority);
  const [companyName, setCompanyName] = useState(ticket.company.CompanyName);
  const [sortAscending, setSortAscending] = useState(true);

  const handleTitleSave = (newTitle: string) => {
    console.log("New Title:", newTitle);
    // Update the ticket title in backend
    setTitle(newTitle);
  };

  const handlePrioritySave = (newPriority: string) => {
    console.log("New Priority:", newPriority);
    // Update the ticket priority in backend
    setPriority(newPriority);
  };

  const handleCompanySave = (newCompany: string) => {
    console.log("New Company:", newCompany);
    // Update the company in backend
    setCompanyName(newCompany);
  };

  const canEditNote = (note: Note) => {
    return note.authorId === currentUser.id.toString();
  };

  const toggleSort = () => {
    setSortAscending(!sortAscending);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Typography variant="h6">
          Ticket #{ticket.ticketnumber}: {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {/* Ticket Details */}
        <EditableField
          label="Ticket Title"
          value={title}
          onSave={handleTitleSave}
        />
        <EditableField
          label="Priority"
          value={priority}
          options={["1", "2", "3", "4", "5", "6"]} // Provide priority options if needed
          onSave={handlePrioritySave}
        />
        <EditableField
          label="Company"
          value={companyName}
          onSave={handleCompanySave}
        />

        {/* Notes Section */}
        <NotesSection
          notes={notes}
          sortAscending={sortAscending}
          toggleSort={toggleSort}
          canEditNote={canEditNote}
          currentUser={currentUser}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketDialog;
