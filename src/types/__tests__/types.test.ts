import { describe, it, expect } from "vitest";
import type {
  Project, ProjectStatus, Client, ClientStatus, TimeEntry,
  Invoice, InvoiceItem, InvoiceStatus, Settings, Currency, DateFormat, TimeFormat, WeekStart,
  Funnel, FunnelStage, FunnelDeal,
} from "@/types";
import { DEFAULT_SETTINGS } from "@/types";

describe("Type contracts", () => {
  describe("Project", () => {
    it("requires all fields", () => {
      const p: Project = {
        id: "1", name: "Test", color: "#000", clientId: null,
        hourlyRate: 50, status: "active", budgetHours: 100, notes: "Note", createdAt: new Date(),
      };
      expect(p.id).toBe("1");
    });

    it("accepts all status values", () => {
      const statuses: ProjectStatus[] = ["active", "completed", "archived"];
      expect(statuses).toHaveLength(3);
    });

    it("clientId and hourlyRate can be null", () => {
      const p: Project = {
        id: "1", name: "T", color: "#000", clientId: null,
        hourlyRate: null, status: "active", budgetHours: null, notes: "", createdAt: new Date(),
      };
      expect(p.clientId).toBeNull();
      expect(p.hourlyRate).toBeNull();
      expect(p.budgetHours).toBeNull();
    });
  });

  describe("Client", () => {
    it("requires all fields", () => {
      const c: Client = {
        id: "1", name: "John", email: "j@t.com", phone: "+380",
        company: "Acme", address: "Kyiv", notes: "VIP", status: "active", createdAt: new Date(),
      };
      expect(c.name).toBe("John");
    });

    it("accepts all status values", () => {
      const statuses: ClientStatus[] = ["active", "inactive"];
      expect(statuses).toHaveLength(2);
    });
  });

  describe("TimeEntry", () => {
    it("has billable field", () => {
      const e: TimeEntry = {
        id: "1", description: "Work", projectId: null,
        duration: 3600, startedAt: new Date(), billable: true,
      };
      expect(e.billable).toBe(true);
    });

    it("projectId can be null", () => {
      const e: TimeEntry = {
        id: "1", description: "Work", projectId: null,
        duration: 3600, startedAt: new Date(), billable: false,
      };
      expect(e.projectId).toBeNull();
    });
  });

  describe("Invoice", () => {
    it("requires all fields including tax/discount/paidAt", () => {
      const inv: Invoice = {
        id: "1", number: "INV-0001", clientId: null, projectId: null,
        status: "draft", items: [], taxRate: 20, discount: 10,
        notes: "", dueDate: new Date(), paidAt: null, createdAt: new Date(),
      };
      expect(inv.taxRate).toBe(20);
      expect(inv.discount).toBe(10);
      expect(inv.paidAt).toBeNull();
    });

    it("all status values", () => {
      const statuses: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];
      expect(statuses).toHaveLength(4);
    });

    it("items have all fields", () => {
      const item: InvoiceItem = { id: "1", description: "Design", hours: 10, rate: 50 };
      expect(item.hours * item.rate).toBe(500);
    });
  });

  describe("Funnel", () => {
    it("has stages array", () => {
      const f: Funnel = {
        id: "1", name: "Sales",
        stages: [
          { id: "s1", name: "Lead", color: "#blue", order: 0 },
          { id: "s2", name: "Won", color: "#green", order: 1 },
        ],
        createdAt: new Date(),
      };
      expect(f.stages).toHaveLength(2);
      expect(f.stages[0].order).toBe(0);
    });

    it("stage has all fields", () => {
      const s: FunnelStage = { id: "s1", name: "Lead", color: "#3b82f6", order: 0 };
      expect(s.id).toBeTruthy();
      expect(s.color).toMatch(/^#/);
    });
  });

  describe("FunnelDeal", () => {
    it("has all fields", () => {
      const d: FunnelDeal = {
        id: "1", funnelId: "f1", stageId: "s1",
        title: "Deal", company: "Co", value: 1000,
        contactName: "John", contactEmail: "j@t.com",
        url: "https://t.com", notes: "Note",
        createdAt: new Date(), updatedAt: new Date(),
      };
      expect(d.funnelId).toBe("f1");
      expect(d.value).toBe(1000);
    });

    it("value can be null", () => {
      const d: FunnelDeal = {
        id: "1", funnelId: "f1", stageId: "s1",
        title: "D", company: "", value: null,
        contactName: "", contactEmail: "", url: "", notes: "",
        createdAt: new Date(), updatedAt: new Date(),
      };
      expect(d.value).toBeNull();
    });
  });

  describe("Settings", () => {
    it("DEFAULT_SETTINGS has all fields", () => {
      expect(DEFAULT_SETTINGS.name).toBe("");
      expect(DEFAULT_SETTINGS.email).toBe("");
      expect(DEFAULT_SETTINGS.company).toBe("");
      expect(DEFAULT_SETTINGS.address).toBe("");
      expect(DEFAULT_SETTINGS.defaultRate).toBe(50);
      expect(DEFAULT_SETTINGS.currency).toBe("USD");
      expect(DEFAULT_SETTINGS.invoicePrefix).toBe("INV");
      expect(DEFAULT_SETTINGS.paymentTermsDays).toBe(30);
      expect(DEFAULT_SETTINGS.invoiceNotes).toBe("");
      expect(DEFAULT_SETTINGS.dateFormat).toBe("DD/MM/YYYY");
      expect(DEFAULT_SETTINGS.timeFormat).toBe("24h");
      expect(DEFAULT_SETTINGS.weekStart).toBe("monday");
      expect(DEFAULT_SETTINGS.defaultProjectId).toBe("");
    });

    it("all Currency values", () => {
      const currencies: Currency[] = ["USD", "EUR", "GBP", "UAH", "PLN"];
      expect(currencies).toHaveLength(5);
    });

    it("all DateFormat values", () => {
      const formats: DateFormat[] = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
      expect(formats).toHaveLength(3);
    });

    it("all TimeFormat values", () => {
      const formats: TimeFormat[] = ["24h", "12h"];
      expect(formats).toHaveLength(2);
    });

    it("all WeekStart values", () => {
      const starts: WeekStart[] = ["monday", "sunday"];
      expect(starts).toHaveLength(2);
    });
  });
});

describe("Invoice math", () => {
  it("subtotal calculation", () => {
    const items: InvoiceItem[] = [
      { id: "1", description: "Design", hours: 10, rate: 50 },
      { id: "2", description: "Code", hours: 20, rate: 75 },
    ];
    const subtotal = items.reduce((s, i) => s + i.hours * i.rate, 0);
    expect(subtotal).toBe(2000); // 500 + 1500
  });

  it("discount + tax", () => {
    const subtotal = 2000;
    const discount = 200;
    const taxRate = 20;
    const afterDiscount = subtotal - discount;
    expect(afterDiscount).toBe(1800);
    const tax = afterDiscount * (taxRate / 100);
    expect(tax).toBe(360);
    const total = afterDiscount + tax;
    expect(total).toBe(2160);
  });

  it("zero items = zero total", () => {
    const items: InvoiceItem[] = [];
    const subtotal = items.reduce((s, i) => s + i.hours * i.rate, 0);
    expect(subtotal).toBe(0);
  });

  it("zero hours or rate = zero amount", () => {
    const items: InvoiceItem[] = [
      { id: "1", description: "Nothing", hours: 0, rate: 100 },
      { id: "2", description: "Free", hours: 10, rate: 0 },
    ];
    const subtotal = items.reduce((s, i) => s + i.hours * i.rate, 0);
    expect(subtotal).toBe(0);
  });

  it("no discount no tax", () => {
    const subtotal = 1000;
    const total = subtotal - 0 + (subtotal - 0) * (0 / 100);
    expect(total).toBe(1000);
  });

  it("discount exceeds subtotal", () => {
    const subtotal = 100;
    const discount = 150;
    const afterDiscount = subtotal - discount;
    expect(afterDiscount).toBe(-50);
    // Negative total is technically possible (credit note)
    const total = afterDiscount + afterDiscount * (10 / 100);
    expect(total).toBe(-55);
  });
});
