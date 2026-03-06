export type ProjectStatus = "active" | "completed" | "archived";

export interface Project {
  id: string;
  name: string;
  color: string;
  clientId: string | null;
  hourlyRate: number | null;
  status: ProjectStatus;
  budgetHours: number | null;
  notes: string;
  createdAt: Date;
}

export type ClientStatus = "active" | "inactive";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  notes: string;
  status: ClientStatus;
  createdAt: Date;
}

export interface TimeEntry {
  id: string;
  description: string;
  projectId: string | null;
  duration: number;
  startedAt: Date;
  billable: boolean;
}

export type Currency = "USD" | "EUR" | "GBP" | "UAH" | "PLN";

export interface Settings {
  name: string;
  email: string;
  company: string;
  address: string;
  defaultRate: number;
  currency: Currency;
  invoicePrefix: string;
  paymentTermsDays: number;
  invoiceNotes: string;
}

export const DEFAULT_SETTINGS: Settings = {
  name: "",
  email: "",
  company: "",
  address: "",
  defaultRate: 50,
  currency: "USD",
  invoicePrefix: "INV",
  paymentTermsDays: 30,
  invoiceNotes: "",
};

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
  taxRate: number;
  discount: number;
  notes: string;
  dueDate: Date;
  paidAt: Date | null;
  createdAt: Date;
}
