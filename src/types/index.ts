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
