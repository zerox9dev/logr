import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStore } from "../store";

// Helper: fresh store hook
function setup() {
  return renderHook(() => useStore());
}

// ══════════════════════════════════════════════
// PROJECTS
// ══════════════════════════════════════════════
describe("Projects", () => {
  it("starts empty", () => {
    const { result } = setup();
    expect(result.current.projects).toEqual([]);
  });

  it("adds with required fields", () => {
    const { result } = setup();
    act(() => { result.current.addProject({ name: "Alpha", clientId: null, hourlyRate: 75 }); });
    expect(result.current.projects).toHaveLength(1);
    const p = result.current.projects[0];
    expect(p.name).toBe("Alpha");
    expect(p.hourlyRate).toBe(75);
    expect(p.clientId).toBeNull();
    expect(typeof p.id).toBe("string");
    expect(p.id.length).toBeGreaterThan(0);
    expect(p.createdAt).toBeInstanceOf(Date);
  });

  it("sets default status=active, budgetHours=null, notes=empty, auto color", () => {
    const { result } = setup();
    act(() => { result.current.addProject({ name: "P", clientId: null, hourlyRate: null }); });
    const p = result.current.projects[0];
    expect(p.status).toBe("active");
    expect(p.budgetHours).toBeNull();
    expect(p.notes).toBe("");
    expect(p.color).toMatch(/^#/);
  });

  it("accepts optional status, budgetHours, notes, color", () => {
    const { result } = setup();
    act(() => {
      result.current.addProject({
        name: "Custom", clientId: null, hourlyRate: null,
        status: "completed", budgetHours: 200, notes: "Important", color: "#ff0000",
      });
    });
    const p = result.current.projects[0];
    expect(p.status).toBe("completed");
    expect(p.budgetHours).toBe(200);
    expect(p.notes).toBe("Important");
    expect(p.color).toBe("#ff0000");
  });

  it("cycles through 10 colors", () => {
    const { result } = setup();
    const colors: string[] = [];
    for (let i = 0; i < 11; i++) {
      act(() => { result.current.addProject({ name: `P${i}`, clientId: null, hourlyRate: null }); });
      colors.push(result.current.projects[0].color); // newest first
    }
    // Color 11 should cycle back to color 1
    expect(colors[10]).toBe(colors[0]);
  });

  it("prepends new projects (newest first)", () => {
    const { result } = setup();
    act(() => { result.current.addProject({ name: "First", clientId: null, hourlyRate: null }); });
    act(() => { result.current.addProject({ name: "Second", clientId: null, hourlyRate: null }); });
    expect(result.current.projects[0].name).toBe("Second");
    expect(result.current.projects[1].name).toBe("First");
  });

  it("updates partial fields", () => {
    const { result } = setup();
    act(() => { result.current.addProject({ name: "Old", clientId: null, hourlyRate: 50 }); });
    const id = result.current.projects[0].id;
    act(() => { result.current.updateProject(id, { name: "New", status: "archived", hourlyRate: 100 }); });
    const p = result.current.projects[0];
    expect(p.name).toBe("New");
    expect(p.status).toBe("archived");
    expect(p.hourlyRate).toBe(100);
  });

  it("update non-existent id does nothing", () => {
    const { result } = setup();
    act(() => { result.current.addProject({ name: "X", clientId: null, hourlyRate: null }); });
    act(() => { result.current.updateProject("fake-id", { name: "Changed" }); });
    expect(result.current.projects[0].name).toBe("X");
  });

  it("deletes by id", () => {
    const { result } = setup();
    act(() => { result.current.addProject({ name: "A", clientId: null, hourlyRate: null }); });
    act(() => { result.current.addProject({ name: "B", clientId: null, hourlyRate: null }); });
    const idA = result.current.projects[1].id; // A is second (prepended)
    act(() => { result.current.deleteProject(idA); });
    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0].name).toBe("B");
  });

  it("delete non-existent id does nothing", () => {
    const { result } = setup();
    act(() => { result.current.addProject({ name: "A", clientId: null, hourlyRate: null }); });
    act(() => { result.current.deleteProject("fake"); });
    expect(result.current.projects).toHaveLength(1);
  });

  it("links project to client", () => {
    const { result } = setup();
    act(() => { result.current.addClient({ name: "C", email: "", company: "" }); });
    const clientId = result.current.clients[0].id;
    act(() => { result.current.addProject({ name: "P", clientId, hourlyRate: null }); });
    expect(result.current.projects[0].clientId).toBe(clientId);
  });
});

// ══════════════════════════════════════════════
// CLIENTS
// ══════════════════════════════════════════════
describe("Clients", () => {
  it("starts empty", () => {
    const { result } = setup();
    expect(result.current.clients).toEqual([]);
  });

  it("adds with required fields + defaults", () => {
    const { result } = setup();
    act(() => { result.current.addClient({ name: "John", email: "j@t.com", company: "Acme" }); });
    const c = result.current.clients[0];
    expect(c.name).toBe("John");
    expect(c.email).toBe("j@t.com");
    expect(c.company).toBe("Acme");
    expect(c.phone).toBe("");
    expect(c.address).toBe("");
    expect(c.notes).toBe("");
    expect(c.status).toBe("active");
    expect(typeof c.id).toBe("string");
    expect(c.createdAt).toBeInstanceOf(Date);
  });

  it("accepts optional phone, address, notes, status", () => {
    const { result } = setup();
    act(() => {
      result.current.addClient({
        name: "Jane", email: "j@j.com", company: "",
        phone: "+380", address: "Kyiv", notes: "VIP", status: "inactive",
      });
    });
    const c = result.current.clients[0];
    expect(c.phone).toBe("+380");
    expect(c.address).toBe("Kyiv");
    expect(c.notes).toBe("VIP");
    expect(c.status).toBe("inactive");
  });

  it("updates partial fields", () => {
    const { result } = setup();
    act(() => { result.current.addClient({ name: "A", email: "a@a", company: "" }); });
    const id = result.current.clients[0].id;
    act(() => { result.current.updateClient(id, { name: "B", status: "inactive", phone: "+1" }); });
    const c = result.current.clients[0];
    expect(c.name).toBe("B");
    expect(c.status).toBe("inactive");
    expect(c.phone).toBe("+1");
    expect(c.email).toBe("a@a"); // unchanged
  });

  it("deletes by id", () => {
    const { result } = setup();
    act(() => { result.current.addClient({ name: "Del", email: "", company: "" }); });
    const id = result.current.clients[0].id;
    act(() => { result.current.deleteClient(id); });
    expect(result.current.clients).toHaveLength(0);
  });

  it("multiple clients are independent", () => {
    const { result } = setup();
    act(() => { result.current.addClient({ name: "A", email: "", company: "" }); });
    act(() => { result.current.addClient({ name: "B", email: "", company: "" }); });
    act(() => { result.current.addClient({ name: "C", email: "", company: "" }); });
    expect(result.current.clients).toHaveLength(3);
    const idB = result.current.clients[1].id;
    act(() => { result.current.deleteClient(idB); });
    expect(result.current.clients).toHaveLength(2);
    expect(result.current.clients.map((c) => c.name)).toEqual(["C", "A"]);
  });
});

// ══════════════════════════════════════════════
// TIME ENTRIES
// ══════════════════════════════════════════════
describe("Time Entries", () => {
  it("starts empty", () => {
    const { result } = setup();
    expect(result.current.entries).toEqual([]);
  });

  it("adds billable entry", () => {
    const { result } = setup();
    const now = new Date();
    act(() => {
      result.current.addEntry({ description: "Coding", projectId: null, duration: 3600, startedAt: now, billable: true });
    });
    const e = result.current.entries[0];
    expect(e.description).toBe("Coding");
    expect(e.duration).toBe(3600);
    expect(e.billable).toBe(true);
    expect(e.startedAt).toBe(now);
  });

  it("adds non-billable entry", () => {
    const { result } = setup();
    act(() => {
      result.current.addEntry({ description: "Meeting", projectId: null, duration: 1800, startedAt: new Date(), billable: false });
    });
    expect(result.current.entries[0].billable).toBe(false);
  });

  it("defaults billable to true when undefined", () => {
    const { result } = setup();
    act(() => {
      result.current.addEntry({ description: "X", projectId: null, duration: 60, startedAt: new Date() } as any);
    });
    expect(result.current.entries[0].billable).toBe(true);
  });

  it("links entry to project", () => {
    const { result } = setup();
    act(() => { result.current.addProject({ name: "P", clientId: null, hourlyRate: null }); });
    const pid = result.current.projects[0].id;
    act(() => {
      result.current.addEntry({ description: "Work on P", projectId: pid, duration: 7200, startedAt: new Date(), billable: true });
    });
    expect(result.current.entries[0].projectId).toBe(pid);
  });

  it("updates description, duration, billable", () => {
    const { result } = setup();
    act(() => { result.current.addEntry({ description: "A", projectId: null, duration: 60, startedAt: new Date(), billable: true }); });
    const id = result.current.entries[0].id;
    act(() => { result.current.updateEntry(id, { description: "B", duration: 120, billable: false }); });
    expect(result.current.entries[0].description).toBe("B");
    expect(result.current.entries[0].duration).toBe(120);
    expect(result.current.entries[0].billable).toBe(false);
  });

  it("deletes entry", () => {
    const { result } = setup();
    act(() => { result.current.addEntry({ description: "X", projectId: null, duration: 60, startedAt: new Date(), billable: true }); });
    act(() => { result.current.deleteEntry(result.current.entries[0].id); });
    expect(result.current.entries).toHaveLength(0);
  });

  it("handles many entries", () => {
    const { result } = setup();
    for (let i = 0; i < 50; i++) {
      act(() => { result.current.addEntry({ description: `E${i}`, projectId: null, duration: i * 60, startedAt: new Date(), billable: i % 2 === 0 }); });
    }
    expect(result.current.entries).toHaveLength(50);
    const billable = result.current.entries.filter((e) => e.billable);
    expect(billable).toHaveLength(25);
  });
});

// ══════════════════════════════════════════════
// INVOICES
// ══════════════════════════════════════════════
describe("Invoices", () => {
  it("starts empty", () => {
    const { result } = setup();
    expect(result.current.invoices).toEqual([]);
  });

  it("adds with auto number and defaults", () => {
    const { result } = setup();
    act(() => {
      result.current.addInvoice({
        clientId: null, projectId: null, status: "draft",
        items: [{ id: "i1", description: "Design", hours: 10, rate: 50 }],
        notes: "Thanks", dueDate: new Date("2026-04-01"),
      });
    });
    const inv = result.current.invoices[0];
    expect(inv.number).toMatch(/^INV-\d{4}$/);
    expect(inv.status).toBe("draft");
    expect(inv.taxRate).toBe(0);
    expect(inv.discount).toBe(0);
    expect(inv.paidAt).toBeNull();
    expect(inv.notes).toBe("Thanks");
    expect(inv.items).toHaveLength(1);
  });

  it("sequential invoice numbers", () => {
    const { result } = setup();
    const makeInvoice = () => ({
      clientId: null, projectId: null, status: "draft" as const,
      items: [{ id: "x", description: "W", hours: 1, rate: 1 }],
      notes: "", dueDate: new Date(),
    });
    act(() => { result.current.addInvoice(makeInvoice()); });
    act(() => { result.current.addInvoice(makeInvoice()); });
    act(() => { result.current.addInvoice(makeInvoice()); });
    const numbers = result.current.invoices.map((i) => i.number);
    // Newest first, so numbers are descending
    const sorted = [...numbers].sort();
    expect(new Set(numbers).size).toBe(3); // all unique
  });

  it("adds with tax and discount", () => {
    const { result } = setup();
    act(() => {
      result.current.addInvoice({
        clientId: null, projectId: null, status: "draft",
        items: [{ id: "i1", description: "Work", hours: 5, rate: 100 }],
        notes: "", dueDate: new Date(), taxRate: 20, discount: 50,
      });
    });
    expect(result.current.invoices[0].taxRate).toBe(20);
    expect(result.current.invoices[0].discount).toBe(50);
  });

  it("updates status draft → sent → paid with paidAt", () => {
    const { result } = setup();
    act(() => {
      result.current.addInvoice({
        clientId: null, projectId: null, status: "draft",
        items: [{ id: "i1", description: "W", hours: 1, rate: 100 }],
        notes: "", dueDate: new Date(),
      });
    });
    const id = result.current.invoices[0].id;

    act(() => { result.current.updateInvoice(id, { status: "sent" }); });
    expect(result.current.invoices[0].status).toBe("sent");
    expect(result.current.invoices[0].paidAt).toBeNull();

    const paidAt = new Date();
    act(() => { result.current.updateInvoice(id, { status: "paid", paidAt }); });
    expect(result.current.invoices[0].status).toBe("paid");
    expect(result.current.invoices[0].paidAt).toBe(paidAt);
  });

  it("updates items and notes", () => {
    const { result } = setup();
    act(() => {
      result.current.addInvoice({
        clientId: null, projectId: null, status: "draft",
        items: [{ id: "i1", description: "Old", hours: 1, rate: 1 }],
        notes: "Old note", dueDate: new Date(),
      });
    });
    const id = result.current.invoices[0].id;
    const newItems = [{ id: "i2", description: "New", hours: 5, rate: 50 }];
    act(() => { result.current.updateInvoice(id, { items: newItems, notes: "New note" }); });
    expect(result.current.invoices[0].items[0].description).toBe("New");
    expect(result.current.invoices[0].notes).toBe("New note");
  });

  it("deletes invoice", () => {
    const { result } = setup();
    act(() => {
      result.current.addInvoice({
        clientId: null, projectId: null, status: "draft",
        items: [], notes: "", dueDate: new Date(),
      });
    });
    act(() => { result.current.deleteInvoice(result.current.invoices[0].id); });
    expect(result.current.invoices).toHaveLength(0);
  });

  it("links invoice to client and project", () => {
    const { result } = setup();
    act(() => { result.current.addClient({ name: "C", email: "", company: "" }); });
    act(() => { result.current.addProject({ name: "P", clientId: null, hourlyRate: null }); });
    const cid = result.current.clients[0].id;
    const pid = result.current.projects[0].id;
    act(() => {
      result.current.addInvoice({
        clientId: cid, projectId: pid, status: "sent",
        items: [{ id: "i1", description: "W", hours: 1, rate: 50 }],
        notes: "", dueDate: new Date(),
      });
    });
    expect(result.current.invoices[0].clientId).toBe(cid);
    expect(result.current.invoices[0].projectId).toBe(pid);
  });

  it("multiple items calculate correctly (type-level)", () => {
    const items = [
      { id: "1", description: "Design", hours: 10, rate: 50 },
      { id: "2", description: "Code", hours: 20, rate: 75 },
      { id: "3", description: "QA", hours: 5, rate: 40 },
    ];
    const subtotal = items.reduce((s, i) => s + i.hours * i.rate, 0);
    expect(subtotal).toBe(10 * 50 + 20 * 75 + 5 * 40); // 500 + 1500 + 200 = 2200
    const discount = 100;
    const taxRate = 20;
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * (taxRate / 100);
    const total = afterDiscount + tax;
    expect(total).toBe(2520); // (2200-100) + (2100*0.2) = 2100 + 420
  });
});

// ══════════════════════════════════════════════
// FUNNELS
// ══════════════════════════════════════════════
describe("Funnels", () => {
  it("starts empty", () => {
    const { result } = setup();
    expect(result.current.funnels).toEqual([]);
    expect(result.current.deals).toEqual([]);
  });

  it("creates funnel with ordered stages", () => {
    const { result } = setup();
    act(() => {
      result.current.addFunnel({
        name: "Sales",
        stages: [
          { name: "Lead", color: "#3b82f6" },
          { name: "Proposal", color: "#f59e0b" },
          { name: "Won", color: "#10b981" },
        ],
      });
    });
    const f = result.current.funnels[0];
    expect(f.name).toBe("Sales");
    expect(f.stages).toHaveLength(3);
    expect(f.stages[0].order).toBe(0);
    expect(f.stages[1].order).toBe(1);
    expect(f.stages[2].order).toBe(2);
    expect(f.stages[0].name).toBe("Lead");
    expect(f.stages[2].name).toBe("Won");
    expect(f.createdAt).toBeInstanceOf(Date);
    // Each stage has unique id
    const ids = f.stages.map((s) => s.id);
    expect(new Set(ids).size).toBe(3);
  });

  it("returns created funnel from addFunnel", () => {
    const { result } = setup();
    let funnel: any;
    act(() => {
      funnel = result.current.addFunnel({ name: "F", stages: [{ name: "A", color: "#a" }, { name: "B", color: "#b" }] });
    });
    expect(funnel.id).toBeTruthy();
    expect(funnel.name).toBe("F");
  });

  it("multiple funnels coexist", () => {
    const { result } = setup();
    act(() => { result.current.addFunnel({ name: "Sales", stages: [{ name: "A", color: "#a" }, { name: "B", color: "#b" }] }); });
    act(() => { result.current.addFunnel({ name: "Hiring", stages: [{ name: "X", color: "#x" }, { name: "Y", color: "#y" }] }); });
    expect(result.current.funnels).toHaveLength(2);
    expect(result.current.funnels[0].name).toBe("Hiring"); // newest first
  });

  it("updates funnel name", () => {
    const { result } = setup();
    act(() => { result.current.addFunnel({ name: "Old", stages: [{ name: "A", color: "#a" }, { name: "B", color: "#b" }] }); });
    act(() => { result.current.updateFunnel(result.current.funnels[0].id, { name: "New" }); });
    expect(result.current.funnels[0].name).toBe("New");
  });

  it("deletes funnel", () => {
    const { result } = setup();
    act(() => { result.current.addFunnel({ name: "F", stages: [{ name: "A", color: "#a" }, { name: "B", color: "#b" }] }); });
    act(() => { result.current.deleteFunnel(result.current.funnels[0].id); });
    expect(result.current.funnels).toHaveLength(0);
  });

  it("deleting funnel cascades to deals", () => {
    const { result } = setup();
    let funnelId: string;
    act(() => {
      const f = result.current.addFunnel({ name: "F", stages: [{ name: "A", color: "#a" }, { name: "B", color: "#b" }] });
      funnelId = f.id;
    });
    const stageId = result.current.funnels[0].stages[0].id;
    act(() => { result.current.addDeal({ funnelId: funnelId!, stageId, title: "D1", company: "", value: null, contactName: "", contactEmail: "", url: "", notes: "" }); });
    act(() => { result.current.addDeal({ funnelId: funnelId!, stageId, title: "D2", company: "", value: null, contactName: "", contactEmail: "", url: "", notes: "" }); });
    expect(result.current.deals).toHaveLength(2);
    act(() => { result.current.deleteFunnel(funnelId!); });
    expect(result.current.deals).toHaveLength(0);
  });

  it("deleting one funnel keeps other funnel's deals", () => {
    const { result } = setup();
    let f1Id: string, f2Id: string;
    act(() => {
      const f1 = result.current.addFunnel({ name: "F1", stages: [{ name: "A", color: "#a" }, { name: "B", color: "#b" }] });
      f1Id = f1.id;
    });
    act(() => {
      const f2 = result.current.addFunnel({ name: "F2", stages: [{ name: "X", color: "#x" }, { name: "Y", color: "#y" }] });
      f2Id = f2.id;
    });
    act(() => { result.current.addDeal({ funnelId: f1Id!, stageId: result.current.funnels[1].stages[0].id, title: "D1", company: "", value: null, contactName: "", contactEmail: "", url: "", notes: "" }); });
    act(() => { result.current.addDeal({ funnelId: f2Id!, stageId: result.current.funnels[0].stages[0].id, title: "D2", company: "", value: null, contactName: "", contactEmail: "", url: "", notes: "" }); });
    expect(result.current.deals).toHaveLength(2);
    act(() => { result.current.deleteFunnel(f1Id!); });
    expect(result.current.deals).toHaveLength(1);
    expect(result.current.deals[0].title).toBe("D2");
  });
});

// ══════════════════════════════════════════════
// DEALS
// ══════════════════════════════════════════════
describe("Deals", () => {
  function setupWithFunnel() {
    const hook = setup();
    let funnelId: string;
    let stages: any[];
    act(() => {
      const f = hook.result.current.addFunnel({
        name: "Pipeline",
        stages: [
          { name: "Lead", color: "#blue" },
          { name: "Proposal", color: "#yellow" },
          { name: "Won", color: "#green" },
          { name: "Lost", color: "#red" },
        ],
      });
      funnelId = f.id;
      stages = f.stages;
    });
    return { hook, funnelId: funnelId!, stages: stages! };
  }

  it("adds a deal with all fields", () => {
    const { hook, funnelId, stages } = setupWithFunnel();
    act(() => {
      hook.result.current.addDeal({
        funnelId, stageId: stages[0].id,
        title: "Acme Corp", company: "Acme", value: 5000,
        contactName: "John", contactEmail: "john@acme.com",
        url: "https://acme.com", notes: "Hot lead",
      });
    });
    const d = hook.result.current.deals[0];
    expect(d.title).toBe("Acme Corp");
    expect(d.company).toBe("Acme");
    expect(d.value).toBe(5000);
    expect(d.contactName).toBe("John");
    expect(d.contactEmail).toBe("john@acme.com");
    expect(d.url).toBe("https://acme.com");
    expect(d.notes).toBe("Hot lead");
    expect(d.funnelId).toBe(funnelId);
    expect(d.stageId).toBe(stages[0].id);
    expect(d.createdAt).toBeInstanceOf(Date);
    expect(d.updatedAt).toBeInstanceOf(Date);
  });

  it("adds deal with null value", () => {
    const { hook, funnelId, stages } = setupWithFunnel();
    act(() => {
      hook.result.current.addDeal({
        funnelId, stageId: stages[0].id,
        title: "No Value", company: "", value: null,
        contactName: "", contactEmail: "", url: "", notes: "",
      });
    });
    expect(hook.result.current.deals[0].value).toBeNull();
  });

  it("moves deal to next stage", () => {
    const { hook, funnelId, stages } = setupWithFunnel();
    act(() => {
      hook.result.current.addDeal({
        funnelId, stageId: stages[0].id,
        title: "Mover", company: "", value: null,
        contactName: "", contactEmail: "", url: "", notes: "",
      });
    });
    const id = hook.result.current.deals[0].id;
    const oldUpdatedAt = hook.result.current.deals[0].updatedAt;

    act(() => { hook.result.current.moveDeal(id, stages[1].id); });
    expect(hook.result.current.deals[0].stageId).toBe(stages[1].id);
    expect(hook.result.current.deals[0].updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());

    act(() => { hook.result.current.moveDeal(id, stages[2].id); });
    expect(hook.result.current.deals[0].stageId).toBe(stages[2].id);
  });

  it("moves deal backwards", () => {
    const { hook, funnelId, stages } = setupWithFunnel();
    act(() => {
      hook.result.current.addDeal({
        funnelId, stageId: stages[2].id,
        title: "Back", company: "", value: null,
        contactName: "", contactEmail: "", url: "", notes: "",
      });
    });
    const id = hook.result.current.deals[0].id;
    act(() => { hook.result.current.moveDeal(id, stages[0].id); });
    expect(hook.result.current.deals[0].stageId).toBe(stages[0].id);
  });

  it("updates deal fields", () => {
    const { hook, funnelId, stages } = setupWithFunnel();
    act(() => {
      hook.result.current.addDeal({
        funnelId, stageId: stages[0].id,
        title: "Old", company: "OldCo", value: 100,
        contactName: "", contactEmail: "", url: "", notes: "",
      });
    });
    const id = hook.result.current.deals[0].id;
    act(() => { hook.result.current.updateDeal(id, { title: "New", company: "NewCo", value: 9999, notes: "Updated" }); });
    const d = hook.result.current.deals[0];
    expect(d.title).toBe("New");
    expect(d.company).toBe("NewCo");
    expect(d.value).toBe(9999);
    expect(d.notes).toBe("Updated");
  });

  it("deletes a deal", () => {
    const { hook, funnelId, stages } = setupWithFunnel();
    act(() => {
      hook.result.current.addDeal({ funnelId, stageId: stages[0].id, title: "Del", company: "", value: null, contactName: "", contactEmail: "", url: "", notes: "" });
    });
    act(() => { hook.result.current.deleteDeal(hook.result.current.deals[0].id); });
    expect(hook.result.current.deals).toHaveLength(0);
  });

  it("multiple deals in different stages", () => {
    const { hook, funnelId, stages } = setupWithFunnel();
    for (let i = 0; i < 4; i++) {
      act(() => {
        hook.result.current.addDeal({
          funnelId, stageId: stages[i].id,
          title: `Deal ${i}`, company: "", value: (i + 1) * 1000,
          contactName: "", contactEmail: "", url: "", notes: "",
        });
      });
    }
    expect(hook.result.current.deals).toHaveLength(4);
    const totalValue = hook.result.current.deals.reduce((s, d) => s + (d.value || 0), 0);
    expect(totalValue).toBe(1000 + 2000 + 3000 + 4000);
  });
});

// ══════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════
describe("Settings", () => {
  it("has all defaults", () => {
    const { result } = setup();
    const s = result.current.settings;
    expect(s.name).toBe("");
    expect(s.email).toBe("");
    expect(s.company).toBe("");
    expect(s.address).toBe("");
    expect(s.defaultRate).toBe(50);
    expect(s.currency).toBe("USD");
    expect(s.invoicePrefix).toBe("INV");
    expect(s.paymentTermsDays).toBe(30);
    expect(s.invoiceNotes).toBe("");
    expect(s.dateFormat).toBe("DD/MM/YYYY");
    expect(s.timeFormat).toBe("24h");
    expect(s.weekStart).toBe("monday");
    expect(s.defaultProjectId).toBe("");
  });

  it("updates single field", () => {
    const { result } = setup();
    act(() => { result.current.updateSettings({ name: "Vadim" }); });
    expect(result.current.settings.name).toBe("Vadim");
    expect(result.current.settings.currency).toBe("USD"); // unchanged
  });

  it("updates multiple fields", () => {
    const { result } = setup();
    act(() => {
      result.current.updateSettings({
        name: "V", email: "v@t.com", currency: "EUR", defaultRate: 100,
        dateFormat: "YYYY-MM-DD", timeFormat: "12h", weekStart: "sunday",
      });
    });
    const s = result.current.settings;
    expect(s.name).toBe("V");
    expect(s.email).toBe("v@t.com");
    expect(s.currency).toBe("EUR");
    expect(s.defaultRate).toBe(100);
    expect(s.dateFormat).toBe("YYYY-MM-DD");
    expect(s.timeFormat).toBe("12h");
    expect(s.weekStart).toBe("sunday");
  });

  it("updates invoice settings", () => {
    const { result } = setup();
    act(() => {
      result.current.updateSettings({
        invoicePrefix: "FV", paymentTermsDays: 14, invoiceNotes: "Pay within 14 days",
      });
    });
    expect(result.current.settings.invoicePrefix).toBe("FV");
    expect(result.current.settings.paymentTermsDays).toBe(14);
    expect(result.current.settings.invoiceNotes).toBe("Pay within 14 days");
  });
});

// ══════════════════════════════════════════════
// TIMER STATE
// ══════════════════════════════════════════════
describe("Timer State", () => {
  it("initial state", () => {
    const { result } = setup();
    expect(result.current.timerRunning).toBe(false);
    expect(result.current.timerSeconds).toBe(0);
    expect(result.current.timerDescription).toBe("");
  });

  it("start/stop timer", () => {
    const { result } = setup();
    act(() => { result.current.setTimerRunning(true); });
    expect(result.current.timerRunning).toBe(true);
    act(() => { result.current.setTimerRunning(false); });
    expect(result.current.timerRunning).toBe(false);
  });

  it("set timer seconds", () => {
    const { result } = setup();
    act(() => { result.current.setTimerSeconds(3661); });
    expect(result.current.timerSeconds).toBe(3661);
  });

  it("set timer description", () => {
    const { result } = setup();
    act(() => { result.current.setTimerDescription("Working on Logr"); });
    expect(result.current.timerDescription).toBe("Working on Logr");
  });

  it("reset timer state", () => {
    const { result } = setup();
    act(() => { result.current.setTimerRunning(true); });
    act(() => { result.current.setTimerSeconds(999); });
    act(() => { result.current.setTimerDescription("Something"); });
    act(() => { result.current.setTimerRunning(false); });
    act(() => { result.current.setTimerSeconds(0); });
    act(() => { result.current.setTimerDescription(""); });
    expect(result.current.timerRunning).toBe(false);
    expect(result.current.timerSeconds).toBe(0);
    expect(result.current.timerDescription).toBe("");
  });
});

// ══════════════════════════════════════════════
// LOOKUPS
// ══════════════════════════════════════════════
describe("Lookups", () => {
  it("getProjectById — found", () => {
    const { result } = setup();
    act(() => { result.current.addProject({ name: "Find", clientId: null, hourlyRate: null }); });
    const p = result.current.getProjectById(result.current.projects[0].id);
    expect(p?.name).toBe("Find");
  });

  it("getProjectById — not found", () => {
    const { result } = setup();
    expect(result.current.getProjectById("nonexistent")).toBeUndefined();
  });

  it("getProjectById — null", () => {
    const { result } = setup();
    expect(result.current.getProjectById(null)).toBeUndefined();
  });

  it("getClientById — found", () => {
    const { result } = setup();
    act(() => { result.current.addClient({ name: "Find", email: "", company: "" }); });
    const c = result.current.getClientById(result.current.clients[0].id);
    expect(c?.name).toBe("Find");
  });

  it("getClientById — not found", () => {
    const { result } = setup();
    expect(result.current.getClientById("nonexistent")).toBeUndefined();
  });

  it("getClientById — null", () => {
    const { result } = setup();
    expect(result.current.getClientById(null)).toBeUndefined();
  });
});

// ══════════════════════════════════════════════
// INTEGRATION SCENARIOS
// ══════════════════════════════════════════════
describe("Integration", () => {
  it("full workflow: client → project → entries → invoice", () => {
    const { result } = setup();

    // Create client
    act(() => { result.current.addClient({ name: "Acme", email: "bill@acme.com", company: "Acme Inc" }); });
    const clientId = result.current.clients[0].id;

    // Create project for client
    act(() => { result.current.addProject({ name: "Website Redesign", clientId, hourlyRate: 100 }); });
    const projectId = result.current.projects[0].id;

    // Track time
    act(() => { result.current.addEntry({ description: "Homepage design", projectId, duration: 7200, startedAt: new Date(), billable: true }); });
    act(() => { result.current.addEntry({ description: "About page", projectId, duration: 3600, startedAt: new Date(), billable: true }); });
    act(() => { result.current.addEntry({ description: "Team meeting", projectId, duration: 1800, startedAt: new Date(), billable: false }); });

    // 3 entries total, 2 billable
    expect(result.current.entries).toHaveLength(3);
    const billableEntries = result.current.entries.filter((e) => e.billable);
    expect(billableEntries).toHaveLength(2);
    const totalBillableHours = billableEntries.reduce((s, e) => s + e.duration, 0) / 3600;
    expect(totalBillableHours).toBe(3); // 2h + 1h

    // Create invoice
    act(() => {
      result.current.addInvoice({
        clientId, projectId, status: "draft",
        items: [
          { id: "i1", description: "Homepage design", hours: 2, rate: 100 },
          { id: "i2", description: "About page", hours: 1, rate: 100 },
        ],
        notes: "Net 30", dueDate: new Date("2026-04-01"), taxRate: 10, discount: 0,
      });
    });

    const inv = result.current.invoices[0];
    expect(inv.clientId).toBe(clientId);
    expect(inv.projectId).toBe(projectId);
    const subtotal = inv.items.reduce((s, i) => s + i.hours * i.rate, 0);
    expect(subtotal).toBe(300);
    const total = subtotal + subtotal * (inv.taxRate / 100);
    expect(total).toBe(330); // 300 + 10% = 330

    // Mark as sent then paid
    act(() => { result.current.updateInvoice(inv.id, { status: "sent" }); });
    act(() => { result.current.updateInvoice(inv.id, { status: "paid", paidAt: new Date() }); });
    expect(result.current.invoices[0].status).toBe("paid");
    expect(result.current.invoices[0].paidAt).toBeInstanceOf(Date);
  });

  it("full workflow: funnel → deals → move → close", () => {
    const { result } = setup();

    // Create sales funnel
    let funnelId: string;
    act(() => {
      const f = result.current.addFunnel({
        name: "Freelance",
        stages: [
          { name: "Lead", color: "#3b82f6" },
          { name: "Proposal Sent", color: "#f59e0b" },
          { name: "Negotiation", color: "#8b5cf6" },
          { name: "Won", color: "#10b981" },
          { name: "Lost", color: "#ef4444" },
        ],
      });
      funnelId = f.id;
    });

    const stages = result.current.funnels[0].stages;

    // Add deals
    act(() => {
      result.current.addDeal({ funnelId: funnelId!, stageId: stages[0].id, title: "Acme Website", company: "Acme", value: 5000, contactName: "John", contactEmail: "j@a.com", url: "", notes: "" });
    });
    act(() => {
      result.current.addDeal({ funnelId: funnelId!, stageId: stages[0].id, title: "Beta App", company: "Beta Inc", value: 8000, contactName: "", contactEmail: "", url: "", notes: "" });
    });

    // Move Acme through pipeline: Lead → Proposal → Won
    const acmeId = result.current.deals.find((d) => d.title === "Acme Website")!.id;
    act(() => { result.current.moveDeal(acmeId, stages[1].id); });
    act(() => { result.current.moveDeal(acmeId, stages[3].id); }); // Won!

    // Move Beta to Lost
    const betaId = result.current.deals.find((d) => d.title === "Beta App")!.id;
    act(() => { result.current.moveDeal(betaId, stages[4].id); }); // Lost

    // Check final states
    expect(result.current.deals.find((d) => d.id === acmeId)!.stageId).toBe(stages[3].id);
    expect(result.current.deals.find((d) => d.id === betaId)!.stageId).toBe(stages[4].id);

    // Pipeline value by stage
    const wonDeals = result.current.deals.filter((d) => d.stageId === stages[3].id);
    const wonValue = wonDeals.reduce((s, d) => s + (d.value || 0), 0);
    expect(wonValue).toBe(5000);
  });

  it("settings affect workflow", () => {
    const { result } = setup();

    // Update settings
    act(() => {
      result.current.updateSettings({
        name: "Vadim", company: "zerox9dev", email: "v@z.com",
        currency: "EUR", defaultRate: 75, invoicePrefix: "FV",
        paymentTermsDays: 14,
      });
    });

    expect(result.current.settings.currency).toBe("EUR");
    expect(result.current.settings.defaultRate).toBe(75);
    expect(result.current.settings.invoicePrefix).toBe("FV");
  });

  it("delete client does not cascade to projects/invoices (by design)", () => {
    const { result } = setup();
    act(() => { result.current.addClient({ name: "C", email: "", company: "" }); });
    const clientId = result.current.clients[0].id;
    act(() => { result.current.addProject({ name: "P", clientId, hourlyRate: null }); });
    act(() => {
      result.current.addInvoice({
        clientId, projectId: null, status: "draft",
        items: [{ id: "i1", description: "W", hours: 1, rate: 1 }],
        notes: "", dueDate: new Date(),
      });
    });
    act(() => { result.current.deleteClient(clientId); });
    // Project and invoice still reference deleted client (orphan refs — by design for now)
    expect(result.current.projects[0].clientId).toBe(clientId);
    expect(result.current.invoices[0].clientId).toBe(clientId);
  });
});
