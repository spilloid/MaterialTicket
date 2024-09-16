export interface TimeEntry {
  TimeEntryID: number;
  TimeStart: string;
  TimeStop: string;
  TimeNote: string;
  Technician: Technician | null;
}

export interface Technician {
  TechnicianID: number;
  FirstName: string;
  LastName: string;
  Username: string;
}

export interface Company {
  CompanyName: string;
  Acronym: string;
  PrimaryEngagementMgr: string;
}

export interface Note {
  id: string;
  dateCreated: string;
  text: string;
  authorId: string;
  authorName: string;
  type: "note" | "timeEntry";
  timeStart?: string;
  timeStop?: string;
}

export interface Ticket {
  status: string;
  ticketnumber: number;
  company: Company;
  ticketSummary: string;
  ticketTitle: string;
  technician: Technician | null;
  priority: string;
  timeEntries: TimeEntry[];
  dateEntered: string;
}
