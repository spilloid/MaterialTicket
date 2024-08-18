import { useState, useEffect, useCallback } from "react";
import {
  Box,
  CssBaseline,
  CircularProgress,
  ThemeProvider,
  Toolbar,
  Grid,
  Typography,
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import DashboardAppBar from "./components/DashboardAppBar";
import DashboardDrawer from "./components/DashboardDrawer";
import TicketCard from "./components/TicketCard";
import TicketDialog from "./components/TicketDialog";
import { Ticket } from "./interfaces";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/Tickets"); // Update with your DB2Rest endpoint
      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCardClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedTicket(null);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <CssBaseline />
        <DashboardAppBar drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />
        <DashboardDrawer drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: "background.default" }}>
          <Toolbar /> {/* To offset the AppBar height */}

          {error && <Typography color="error">Error: {error.message}</Typography>}
          {loading ? (
            <CircularProgress />
          ) : tickets.length > 0 ? (
            <Grid container spacing={3}>
              {tickets.map((ticket) => (
                <Grid item xs={12} sm={6} md={4} key={ticket.ticketnumber}>
                  <TicketCard ticket={ticket} onClick={() => handleCardClick(ticket)} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1">No tickets found.</Typography>
          )}
        </Box>

        {/* Ticket Dialog */}
        {selectedTicket && (
          <TicketDialog
            ticket={selectedTicket}
            open={dialogOpen}
            onClose={handleDialogClose}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
