export interface Project {
  id: string;
  name: string;
  color: string;
  clientId: string | null;
  hourlyRate: number | null;
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  createdAt: Date;
}

export interface TimeEntry {
  id: string;
  description: string;
  projectId: string | null;
  duration: number;
  startedAt: Date;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface InvoiceItem {
  id: string;
  description: string;
  hours: number;
  rate: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string | null;
  projectId: string | null;
  status: InvoiceStatus;
  items: InvoiceItem[];
  notes: string;
  dueDate: Date;
  createdAt: Date;
}
