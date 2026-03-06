import { describe, it, expect } from "vitest";
import type { Project, Client, TimeEntry, Invoice, InvoiceStatus } from "@/types";

describe("types", () => {
  it("Project has required fields", () => {
    const project: Project = {
      id: "1",
      name: "Test",
      color: "#000",
      clientId: null,
      hourlyRate: null,
      createdAt: new Date(),
    };
    expect(project.id).toBe("1");
  });

  it("Client has required fields", () => {
    const client: Client = {
      id: "1",
      name: "John",
      email: "j@t.com",
      company: "Acme",
      createdAt: new Date(),
    };
    expect(client.name).toBe("John");
  });

  it("TimeEntry has required fields", () => {
    const entry: TimeEntry = {
      id: "1",
      description: "Work",
      projectId: null,
      duration: 3600,
      startedAt: new Date(),
    };
    expect(entry.duration).toBe(3600);
  });

  it("Invoice status types", () => {
    const statuses: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];
    expect(statuses).toHaveLength(4);
  });
});
