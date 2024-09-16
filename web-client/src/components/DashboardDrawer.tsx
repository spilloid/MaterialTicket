import { Link } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ListAltIcon from "@mui/icons-material/ListAlt";
import BusinessIcon from "@mui/icons-material/Business";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";

interface DashboardDrawerProps {
  drawerOpen: boolean;
  toggleDrawer: () => void;
  setViewMode: (viewMode: "cards" | "table" | "kanban") => void;
}

export default function DashboardDrawer({
  drawerOpen,
  toggleDrawer,
  setViewMode,
}: DashboardDrawerProps) {
  return (
    <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
      <List>
        <ListItem
          button
          onClick={() => {
            setViewMode("cards");
            toggleDrawer();
          }}
        >
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Card View" />
        </ListItem>

        <ListItem
          button
          onClick={() => {
            setViewMode("table");
            toggleDrawer();
          }}
        >
          <ListItemIcon>
            <ListAltIcon />
          </ListItemIcon>
          <ListItemText primary="Table View" />
        </ListItem>

        <ListItem
          button
          onClick={() => {
            setViewMode("kanban");
            toggleDrawer();
          }}
        >
          <ListItemIcon>
            <ViewKanbanIcon />
          </ListItemIcon>
          <ListItemText primary="Kanban Board" />
        </ListItem>

        <ListItem
          button
          component={Link}
          to="/cwManage"
          onClick={toggleDrawer}
        >
          <ListItemIcon>
            <BusinessIcon />
          </ListItemIcon>
          <ListItemText primary="CW Management" />
        </ListItem>
      </List>
    </Drawer>
  );
}
