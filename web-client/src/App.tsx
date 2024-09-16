// ./App.tsx
import { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter as Router, // You can remove this import since we're wrapping App with BrowserRouter in main.tsx
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import {
  Box,
  CssBaseline,
  ThemeProvider,
  Toolbar,
  CircularProgress,
  Grid,
  Button,
  Typography,
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import DashboardAppBar from "./components/DashboardAppBar";
import DashboardDrawer from "./components/DashboardDrawer";
import TicketCard from "./components/TicketCard";
import FilterDialog from "./components/FilterDialog";
import CWManageView from "./components/CWManageView";
import TicketDialog from "./components/TicketDialog";
import TicketTable from "./components/TicketTable";
import KanbanBoard from "./components/KanbanBoard";
import { Ticket, Technician, Company, Note } from "./interfaces";

// Define Theme for Styling
const defaultTheme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#f50057" },
    background: { default: "#f4f6f8" },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
});

function App() {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState<boolean>(false);
  const [ticketDialogOpen, setTicketDialogOpen] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketNotes, setTicketNotes] = useState<Note[]>([]);
  const [viewMode, setViewMode] = useState<"cards" | "table" | "kanban">(
    "cards"
  );
  const [cardSize, setCardSize] = useState<number>(5);

  const [currentUser, setCurrentUser] = useState<any>({
    id: 1,
    name: "John Doe",
  });

  // Remove useNavigate if not used in this component
  // const navigate = useNavigate();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const fetchTickets = useCallback(async (forceUpdate: boolean = false) => {
    setLoading(true);
    try {
      let endpoint = `/api/Tickets/Open${forceUpdate ? "?forceUpdate=true" : ""}`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }
      const data = await response.json();

      const mappedTickets: Ticket[] = data.map((ticket: any) => ({
        ticketnumber: ticket.id,
        ticketSummary: ticket.description || "No summary provided",
        ticketTitle: ticket.summary,
        company: {
          CompanyName: ticket.company.name,
          Acronym: ticket.company.identifier,
          PrimaryEngagementMgr: ticket.company._info.updatedBy,
        } as Company,
        technician: ticket.technician
          ? {
              TechnicianID: ticket.technician.id,
              FirstName: ticket.technician.firstName,
              LastName: ticket.technician.lastName,
              Username: ticket.technician.username,
            } as Technician
          : null,
        priority: ticket.priority.sort.toString(),
        status: ticket.status.name,
        dateEntered: ticket.dateEntered,
        timeEntries: ticket.timeEntries || [],
      }));

      setTickets(mappedTickets);
      setFilteredTickets(mappedTickets);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTicketNotes = async (ticketId: number) => {
    try {
      const response = await fetch(`/api/Tickets/${ticketId}/Notes`);
      if (!response.ok) {
        throw new Error("Failed to fetch ticket notes");
      }
      const data = await response.json();
      const mappedNotes: Note[] = data.map((note: any) => ({
        id: note.id,
        dateCreated: note.dateCreated,
        text: note.text,
        authorId: note.authorId,
        authorName: note.authorName,
        type: note.type,
        timeStart: note.timeStart,
        timeStop: note.timeStop,
      }));
      return mappedNotes;
    } catch (err) {
      console.error("Error fetching notes:", err);
      return [];
    }
  };

  const handleTicketClick = async (ticket: Ticket) => {
    setLoading(true);
    setSelectedTicket(ticket);
    setTicketDialogOpen(true); // Moved this line up

    const notes = await fetchTicketNotes(ticket.ticketnumber);
    setTicketNotes(notes);
    setLoading(false);
  };

  const handleTicketDialogClose = () => {
    setTicketDialogOpen(false);
    setSelectedTicket(null);
    setTicketNotes([]);
  };

  const applyFilters = (filtered: Ticket[]) => {
    setFilteredTickets(filtered);
    setFilterDialogOpen(false);
  };

  const shortenSummary = (summary: string) => {
    return summary.length > 100 ? `${summary.slice(0, 100)}...` : summary;
  };

  const handleCardSizeChange = (event: any, newValue: number | number[]) => {
    setCardSize(newValue as number);
  };

  const handleStatusChange = (ticketId: number, newStatus: string) => {
    // Update the ticket status locally
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.ticketnumber === ticketId
          ? { ...ticket, status: newStatus }
          : ticket
      )
    );
    // Optionally, make an API call to update the status in the backend
    console.log(`Ticket ${ticketId} status changed to ${newStatus}`);
  };

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <CssBaseline />
        <DashboardAppBar
          drawerOpen={drawerOpen}
          toggleDrawer={toggleDrawer}
          currentView={viewMode}
          viewMode={viewMode}
          cardSize={cardSize}
          handleCardSizeChange={handleCardSizeChange}
        />
        <DashboardDrawer
          drawerOpen={drawerOpen}
          toggleDrawer={toggleDrawer}
          setViewMode={setViewMode}
        />

        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, backgroundColor: "background.default" }}
        >
          <Toolbar />

          {/* View Mode Buttons */}
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              onClick={() => setViewMode("cards")}
              sx={{ mr: 2 }}
              disabled={viewMode === "cards"}
            >
              Card View
            </Button>
            <Button
              variant="contained"
              onClick={() => setViewMode("table")}
              sx={{ mr: 2 }}
              disabled={viewMode === "table"}
            >
              Table View
            </Button>
            <Button
              variant="contained"
              onClick={() => setViewMode("kanban")}
              sx={{ mr: 2 }}
              disabled={viewMode === "kanban"}
            >
              Kanban View
            </Button>
            <Button
              variant="contained"
              onClick={() => setFilterDialogOpen(true)}
            >
              Filter Tickets
            </Button>
          </Box>

          {error && (
            <Typography color="error">Error: {error.message}</Typography>
          )}
          {loading ? (
            <CircularProgress />
          ) : filteredTickets.length > 0 ? (
            viewMode === "cards" ? (
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {filteredTickets.map((ticket) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={12 / cardSize}
                    key={ticket.ticketnumber}
                  >
                    <TicketCard
                      ticket={ticket}
                      onClick={() => handleTicketClick(ticket)}
                      shortenedSummary={shortenSummary(ticket.ticketSummary)}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : viewMode === "table" ? (
              <TicketTable
                tickets={filteredTickets}
                onRowClick={handleTicketClick}
              />
            ) : (
              <KanbanBoard
                tickets={filteredTickets}
                onStatusChange={handleStatusChange}
                onTicketClick={handleTicketClick}
              />
            )
          ) : (
            <Typography variant="body1">No tickets found.</Typography>
          )}
        </Box>

        <FilterDialog
          open={filterDialogOpen}
          onClose={() => setFilterDialogOpen(false)}
          tickets={tickets}
          applyFilters={applyFilters}
        />

        {selectedTicket && (
          <TicketDialog
            ticket={selectedTicket}
            open={ticketDialogOpen}
            onClose={handleTicketDialogClose}
            notes={ticketNotes}
            currentUser={currentUser}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
