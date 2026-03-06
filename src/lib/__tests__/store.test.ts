import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStore } from "../store";

describe("useStore", () => {
  // ── Projects ──
  describe("projects", () => {
    it("adds a project with defaults", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addProject({ name: "Test", clientId: null, hourlyRate: 50 });
      });
      expect(result.current.projects).toHaveLength(1);
      const p = result.current.projects[0];
      expect(p.name).toBe("Test");
      expect(p.hourlyRate).toBe(50);
      expect(p.color).toBeTruthy();
      expect(p.status).toBe("active");
      expect(p.budgetHours).toBeNull();
      expect(p.notes).toBe("");
    });

    it("adds with custom status and budget", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addProject({ name: "P", clientId: null, hourlyRate: null, status: "completed", budgetHours: 100, notes: "Done" });
      });
      expect(result.current.projects[0].status).toBe("completed");
      expect(result.current.projects[0].budgetHours).toBe(100);
    });

    it("updates a project", () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.addProject({ name: "Old", clientId: null, hourlyRate: null }); });
      act(() => { result.current.updateProject(result.current.projects[0].id, { name: "New", status: "archived" }); });
      expect(result.current.projects[0].name).toBe("New");
      expect(result.current.projects[0].status).toBe("archived");
    });

    it("deletes a project", () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.addProject({ name: "Del", clientId: null, hourlyRate: null }); });
      act(() => { result.current.deleteProject(result.current.projects[0].id); });
      expect(result.current.projects).toHaveLength(0);
    });
  });

  // ── Clients ──
  describe("clients", () => {
    it("adds a client with defaults", () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.addClient({ name: "John", email: "j@t.com", company: "Acme" }); });
      const c = result.current.clients[0];
      expect(c.name).toBe("John");
      expect(c.phone).toBe("");
      expect(c.address).toBe("");
      expect(c.notes).toBe("");
      expect(c.status).toBe("active");
    });

    it("adds with optional fields", () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.addClient({ name: "A", email: "", company: "", phone: "+1", address: "NYC", notes: "VIP", status: "inactive" }); });
      expect(result.current.clients[0].phone).toBe("+1");
      expect(result.current.clients[0].status).toBe("inactive");
    });

    it("updates and deletes", () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.addClient({ name: "X", email: "", company: "" }); });
      const id = result.current.clients[0].id;
      act(() => { result.current.updateClient(id, { name: "Y" }); });
      expect(result.current.clients[0].name).toBe("Y");
      act(() => { result.current.deleteClient(id); });
      expect(result.current.clients).toHaveLength(0);
    });
  });

  // ── Time Entries ──
  describe("entries", () => {
    it("adds with billable default", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addEntry({ description: "Work", projectId: null, duration: 3600, startedAt: new Date(), billable: true });
      });
      expect(result.current.entries).toHaveLength(1);
      expect(result.current.entries[0].billable).toBe(true);
    });

    it("adds non-billable entry", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addEntry({ description: "Meeting", projectId: null, duration: 1800, startedAt: new Date(), billable: false });
      });
      expect(result.current.entries[0].billable).toBe(false);
    });

    it("updates an entry", () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.addEntry({ description: "A", projectId: null, duration: 60, startedAt: new Date(), billable: true }); });
      const id = result.current.entries[0].id;
      act(() => { result.current.updateEntry(id, { description: "B", duration: 120 }); });
      expect(result.current.entries[0].description).toBe("B");
      expect(result.current.entries[0].duration).toBe(120);
    });

    it("deletes an entry", () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.addEntry({ description: "X", projectId: null, duration: 60, startedAt: new Date(), billable: true }); });
      act(() => { result.current.deleteEntry(result.current.entries[0].id); });
      expect(result.current.entries).toHaveLength(0);
    });
  });

  // ── Invoices ──
  describe("invoices", () => {
    it("adds with defaults", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addInvoice({
          clientId: null, projectId: null, status: "draft",
          items: [{ id: "1", description: "Design", hours: 10, rate: 50 }],
          notes: "", dueDate: new Date(),
        });
      });
      const inv = result.current.invoices[0];
      expect(inv.number).toMatch(/^INV-/);
      expect(inv.status).toBe("draft");
      expect(inv.taxRate).toBe(0);
      expect(inv.discount).toBe(0);
      expect(inv.paidAt).toBeNull();
    });

    it("adds with tax and discount", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addInvoice({
          clientId: null, projectId: null, status: "draft",
          items: [{ id: "1", description: "Work", hours: 5, rate: 100 }],
          notes: "", dueDate: new Date(), taxRate: 20, discount: 50,
        });
      });
      expect(result.current.invoices[0].taxRate).toBe(20);
      expect(result.current.invoices[0].discount).toBe(50);
    });

    it("updates status with paidAt", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addInvoice({
          clientId: null, projectId: null, status: "draft",
          items: [{ id: "1", description: "W", hours: 1, rate: 100 }],
          notes: "", dueDate: new Date(),
        });
      });
      const id = result.current.invoices[0].id;
      const paidAt = new Date();
      act(() => { result.current.updateInvoice(id, { status: "paid", paidAt }); });
      expect(result.current.invoices[0].status).toBe("paid");
      expect(result.current.invoices[0].paidAt).toBe(paidAt);
    });

    it("deletes an invoice", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addInvoice({
          clientId: null, projectId: null, status: "draft",
          items: [{ id: "1", description: "W", hours: 1, rate: 1 }],
          notes: "", dueDate: new Date(),
        });
      });
      act(() => { result.current.deleteInvoice(result.current.invoices[0].id); });
      expect(result.current.invoices).toHaveLength(0);
    });
  });

  // ── Funnels ──
  describe("funnels", () => {
    it("creates a funnel with stages", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addFunnel({
          name: "Sales",
          stages: [{ name: "Lead", color: "#blue" }, { name: "Won", color: "#green" }],
        });
      });
      expect(result.current.funnels).toHaveLength(1);
      expect(result.current.funnels[0].name).toBe("Sales");
      expect(result.current.funnels[0].stages).toHaveLength(2);
      expect(result.current.funnels[0].stages[0].order).toBe(0);
      expect(result.current.funnels[0].stages[1].order).toBe(1);
    });

    it("deletes funnel and its deals", () => {
      const { result } = renderHook(() => useStore());
      let funnelId: string;
      act(() => {
        const f = result.current.addFunnel({ name: "F", stages: [{ name: "A", color: "#a" }, { name: "B", color: "#b" }] });
        funnelId = f.id;
      });
      act(() => {
        result.current.addDeal({ funnelId: funnelId!, stageId: result.current.funnels[0].stages[0].id, title: "D1", company: "", value: null, contactName: "", contactEmail: "", url: "", notes: "" });
      });
      expect(result.current.deals).toHaveLength(1);
      act(() => { result.current.deleteFunnel(funnelId!); });
      expect(result.current.funnels).toHaveLength(0);
      expect(result.current.deals).toHaveLength(0);
    });
  });

  // ── Deals ──
  describe("deals", () => {
    it("adds and moves a deal", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addFunnel({ name: "F", stages: [{ name: "A", color: "#a" }, { name: "B", color: "#b" }] });
      });
      const stages = result.current.funnels[0].stages;
      act(() => {
        result.current.addDeal({ funnelId: result.current.funnels[0].id, stageId: stages[0].id, title: "Deal", company: "Co", value: 1000, contactName: "", contactEmail: "", url: "", notes: "" });
      });
      expect(result.current.deals[0].stageId).toBe(stages[0].id);
      act(() => { result.current.moveDeal(result.current.deals[0].id, stages[1].id); });
      expect(result.current.deals[0].stageId).toBe(stages[1].id);
    });
  });

  // ── Settings ──
  describe("settings", () => {
    it("has defaults", () => {
      const { result } = renderHook(() => useStore());
      expect(result.current.settings.currency).toBe("USD");
      expect(result.current.settings.defaultRate).toBe(50);
      expect(result.current.settings.weekStart).toBe("monday");
    });

    it("updates settings", () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.updateSettings({ name: "Vadim", currency: "EUR" }); });
      expect(result.current.settings.name).toBe("Vadim");
      expect(result.current.settings.currency).toBe("EUR");
    });
  });

  // ── Lookups ──
  describe("lookups", () => {
    it("finds project by id", () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.addProject({ name: "P", clientId: null, hourlyRate: null }); });
      expect(result.current.getProjectById(result.current.projects[0].id)?.name).toBe("P");
      expect(result.current.getProjectById("fake")).toBeUndefined();
      expect(result.current.getProjectById(null)).toBeUndefined();
    });

    it("finds client by id", () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.addClient({ name: "C", email: "", company: "" }); });
      expect(result.current.getClientById(result.current.clients[0].id)?.name).toBe("C");
      expect(result.current.getClientById(null)).toBeUndefined();
    });
  });

  // ── Timer state ──
  describe("timer", () => {
    it("has initial timer state", () => {
      const { result } = renderHook(() => useStore());
      expect(result.current.timerRunning).toBe(false);
      expect(result.current.timerSeconds).toBe(0);
      expect(result.current.timerDescription).toBe("");
    });

    it("updates timer state", () => {
      const { result } = renderHook(() => useStore());
      act(() => { result.current.setTimerRunning(true); });
      act(() => { result.current.setTimerSeconds(42); });
      act(() => { result.current.setTimerDescription("Working"); });
      expect(result.current.timerRunning).toBe(true);
      expect(result.current.timerSeconds).toBe(42);
      expect(result.current.timerDescription).toBe("Working");
    });
  });
});
