import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Alert,
} from "@mui/material";
import * as api from "../api/client";
import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  DEFAULT_STATUS,
  DEFAULT_PRIORITY,
} from "../ticketVocab";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const emptyForm = {
  title: "",
  summary: "",
  description: "",
  status: DEFAULT_STATUS as string,
  priority: DEFAULT_PRIORITY as string,
  companyName: "",
  assigneeId: "" as number | "",
};

export default function CreateTicketDialog({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState({ ...emptyForm });
  const [assignees, setAssignees] = useState<api.Assignee[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) api.listAssignees().then(setAssignees).catch(() => setAssignees([]));
  }, [open]);

  const setField = (field: string, value: unknown) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const assignee = assignees.find((a) => a.id === form.assigneeId);
      await api.createTicket({
        title: form.title,
        summary: form.summary,
        description: form.description,
        status: form.status,
        priority: form.priority,
        companyName: form.companyName,
        assigneeId: form.assigneeId === "" ? undefined : form.assigneeId,
        assignee: assignee ? assignee.displayName || assignee.username : undefined,
        source: "local",
      });
      setForm({ ...emptyForm });
      onCreated();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New ticket</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
          <TextField label="Title" required value={form.title} onChange={(e) => setField("title", e.target.value)} fullWidth autoFocus />
          <TextField label="Summary" value={form.summary} onChange={(e) => setField("summary", e.target.value)} fullWidth />
          <TextField label="Description" value={form.description} onChange={(e) => setField("description", e.target.value)} fullWidth multiline rows={4} />
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={form.status} label="Status" onChange={(e) => setField("status", e.target.value)}>
                {TICKET_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select value={form.priority} label="Priority" onChange={(e) => setField("priority", e.target.value)}>
                {TICKET_PRIORITIES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField label="Company" value={form.companyName} onChange={(e) => setField("companyName", e.target.value)} fullWidth />
            <FormControl fullWidth size="small">
              <InputLabel>Assignee</InputLabel>
              <Select value={form.assigneeId} label="Assignee" displayEmpty
                onChange={(e) => setField("assigneeId", e.target.value === "" ? "" : Number(e.target.value))}>
                <MenuItem value="">Unassigned</MenuItem>
                {assignees.map((a) => <MenuItem key={a.id} value={a.id}>{a.displayName || a.username} · {a.role}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving}>
          {saving ? "Creating…" : "Create ticket"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
