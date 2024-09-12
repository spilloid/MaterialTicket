import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  TextField,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import UndoIcon from "@mui/icons-material/Undo";
import { Ticket } from "../interfaces";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";

// Map of priority and status colors
const priorityColors: { [key: string]: string } = {
  "High": "#f44336", // Red for high priority
  "Medium": "#ff9800", // Orange for medium priority
  "Low": "#4caf50", // Green for low priority
};

const statusColors: { [key: string]: string } = {
  "New": "#1976d2",
  "In Progress": "#ff9800",
  "Waiting on Customer": "#f44336",
  "Closed": "#4caf50",
  "Escalated": "#9c27b0",
  // Add more statuses as needed
};

interface TicketDialogProps {
  ticket: Ticket | null;
  open: boolean;
  onClose: () => void;
  shortenedSummary: string;
  notes: any[];
}

const TicketDialog: React.FC<TicketDialogProps> = ({
  ticket,
  open,
  onClose,
  shortenedSummary,
  notes,
}) => {
  if (!ticket) return null;

  const priorityColor = priorityColors[ticket.priority] || "#1976d2"; // Default color
  const statusColor = statusColors[ticket.status] || "#1976d2"; // Default color

  // Initial state to store the original values when the dialog opens
  const [initialFields, setInitialFields] = useState({
    title: ticket.ticketTitle,
    priority: ticket.priority,
    company: ticket.company.CompanyName,
  });

  // State for edit mode
  const [isEditing, setIsEditing] = useState({
    title: false,
    priority: false,
    company: false,
  });

  // Local state to store updated values during edit
  const [editableFields, setEditableFields] = useState(initialFields);

  // Sorting state for notes
  const [sortAscending, setSortAscending] = useState(true);

  // Update the initial fields whenever the dialog is opened
  useEffect(() => {
    if (ticket) {
      setInitialFields({
        title: ticket.ticketTitle,
        priority: ticket.priority,
        company: ticket.company.CompanyName,
      });
      setEditableFields({
        title: ticket.ticketTitle,
        priority: ticket.priority,
        company: ticket.company.CompanyName,
      });
    }
  }, [ticket]);

  // Handlers for starting and canceling edit mode
  const handleEdit = (field: keyof typeof isEditing) => setIsEditing((prev) => ({ ...prev, [field]: true }));
  const handleRevert = (field: keyof typeof isEditing) => {
    setEditableFields((prev) => ({ ...prev, [field]: initialFields[field] })); // Reset to initial values
    setIsEditing((prev) => ({ ...prev, [field]: false })); // Exit edit mode
  };

  // Handler for saving the changes (Simulating the network event)
  const handleSave = (field: keyof typeof isEditing) => {
    // Here we would make the network call
    console.log(`Saving ${field}: ${editableFields[field]}`);
    setIsEditing((prev) => ({ ...prev, [field]: false }));
  };

  // Toggle sorting between ascending and descending
  const toggleSort = () => setSortAscending(!sortAscending);

  // Sort the notes by date
  const sortedNotes = [...notes].sort((a, b) => {
    const dateA = new Date(a.dateCreated).getTime();
    const dateB = new Date(b.dateCreated).getTime();
    return sortAscending ? dateA - dateB : dateB - dateA;
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg" // Make the dialog wider
      fullWidth
      sx={{ "& .MuiDialog-paper": { minHeight: "80vh", maxHeight: "90vh" } }} // Increase the dialog height
    >
      {/* Ticket Title and Status */}
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Ticket Title */}
        {isEditing.title ? (
          <TextField
            variant="outlined"
            value={editableFields.title}
            onChange={(e) => setEditableFields((prev) => ({ ...prev, title: e.target.value }))}
            fullWidth
          />
        ) : (
          <Typography variant="body1">
            <b>Ticket #{ticket.ticketnumber}</b>: {editableFields.title}
          </Typography>
        )}

        {/* Status Chip */}
        <Chip label={ticket.status} sx={{ backgroundColor: statusColor, color: "#fff", fontWeight: "bold" }} />

        {/* Edit/Save/Undo for Title */}
        {isEditing.title ? (
          <>
            <IconButton onClick={() => handleSave("title")}>
              <SaveIcon />
            </IconButton>
            <IconButton onClick={() => handleRevert("title")}>
              <UndoIcon />
            </IconButton>
          </>
        ) : (
          <IconButton onClick={() => handleEdit("title")}>
            <EditIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {/* Priority and Company Section */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Box>
            <Typography variant="body1" gutterBottom>
              <strong>Priority:</strong>
            </Typography>

            {/* Edit/Save/Undo for Priority */}
            {isEditing.priority ? (
              <>
                <TextField
                  variant="outlined"
                  value={editableFields.priority}
                  onChange={(e) => setEditableFields((prev) => ({ ...prev, priority: e.target.value }))}
                  fullWidth
                />
                <IconButton onClick={() => handleSave("priority")}>
                  <SaveIcon />
                </IconButton>
                <IconButton onClick={() => handleRevert("priority")}>
                  <UndoIcon />
                </IconButton>
              </>
            ) : (
              <>
                <Chip
                  label={editableFields.priority}
                  sx={{ backgroundColor: priorityColor, color: "#fff", fontWeight: "bold" }}
                />
                <IconButton onClick={() => handleEdit("priority")}>
                  <EditIcon />
                </IconButton>
              </>
            )}
          </Box>

          <Box>
            <Typography variant="body1" gutterBottom>
              <strong>Company:</strong>
            </Typography>

            {/* Edit/Save/Undo for Company */}
            {isEditing.company ? (
              <>
                <TextField
                  variant="outlined"
                  value={editableFields.company}
                  onChange={(e) => setEditableFields((prev) => ({ ...prev, company: e.target.value }))}
                  fullWidth
                />
                <IconButton onClick={() => handleSave("company")}>
                  <SaveIcon />
                </IconButton>
                <IconButton onClick={() => handleRevert("company")}>
                  <UndoIcon />
                </IconButton>
              </>
            ) : (
              <>
                <Typography variant="body1">{editableFields.company}</Typography>
                <IconButton onClick={() => handleEdit("company")}>
                  <EditIcon />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        {/* Notes Section */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography
            variant="h6"
            onClick={toggleSort}
            sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            Notes
            {sortAscending ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
          </Typography>
        </Box>
        {notes.length > 0 ? (
          <Box sx={{ maxHeight: "60vh", overflowY: "auto", mb: 2 }}> {/* Larger scrollable area */}
            <List>
              {sortedNotes.map((note, index) => (
                <ListItem key={index} divider>
                  <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <Box sx={{ minWidth: 150 }}>
                      <Typography variant="body2" sx={{ color: "#333" }}>
                        {new Date(note.dateCreated).toLocaleTimeString()}{" "}
                        {new Date(note.dateCreated).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ maxWidth: "70%" }}>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", color: "#000" }}>
                        {note.text}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No notes available for this ticket.
          </Typography>
        )}
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
