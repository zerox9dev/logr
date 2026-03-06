import { describe, it, expect } from "vitest";
import type { Project, Client, TimeEntry, Invoice, InvoiceStatus, Funnel, FunnelDeal, Settings } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";

describe("types", () => {
  it("Project has all fields", () => {
    const project: Project = {
      id: "1", name: "Test", color: "#000", clientId: null,
      hourlyRate: null, status: "active", budgetHours: null, notes: "", createdAt: new Date(),
    };
    expect(project.status).toBe("active");
  });

  it("Client has all fields", () => {
    const client: Client = {
      id: "1", name: "John", email: "j@t.com", phone: "", company: "Acme",
      address: "", notes: "", status: "active", createdAt: new Date(),
    };
    expect(client.status).toBe("active");
  });

  it("TimeEntry has billable", () => {
    const entry: TimeEntry = {
      id: "1", description: "Work", projectId: null,
      duration: 3600, startedAt: new Date(), billable: true,
    };
    expect(entry.billable).toBe(true);
  });

  it("Invoice has tax and discount", () => {
    const invoice: Invoice = {
      id: "1", number: "INV-0001", clientId: null, projectId: null,
      status: "draft", items: [], taxRate: 20, discount: 10,
      notes: "", dueDate: new Date(), paidAt: null, createdAt: new Date(),
    };
    expect(invoice.taxRate).toBe(20);
  });

  it("Funnel has stages", () => {
    const funnel: Funnel = {
      id: "1", name: "Sales",
      stages: [{ id: "s1", name: "Lead", color: "#blue", order: 0 }],
      createdAt: new Date(),
    };
    expect(funnel.stages).toHaveLength(1);
  });

  it("FunnelDeal links to funnel", () => {
    const deal: FunnelDeal = {
      id: "1", funnelId: "f1", stageId: "s1", title: "Deal", company: "",
      value: 1000, contactName: "", contactEmail: "", url: "", notes: "",
      createdAt: new Date(), updatedAt: new Date(),
    };
    expect(deal.funnelId).toBe("f1");
  });

  it("InvoiceStatus types", () => {
    const statuses: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];
    expect(statuses).toHaveLength(4);
  });

  it("DEFAULT_SETTINGS has all fields", () => {
    expect(DEFAULT_SETTINGS.currency).toBe("USD");
    expect(DEFAULT_SETTINGS.dateFormat).toBe("DD/MM/YYYY");
    expect(DEFAULT_SETTINGS.timeFormat).toBe("24h");
    expect(DEFAULT_SETTINGS.weekStart).toBe("monday");
    expect(DEFAULT_SETTINGS.defaultProjectId).toBe("");
  });
});
