import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStore } from "../store";

describe("useStore", () => {
  describe("projects", () => {
    it("adds a project", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addProject({ name: "Test Project", clientId: null, hourlyRate: 50 });
      });
      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].name).toBe("Test Project");
      expect(result.current.projects[0].hourlyRate).toBe(50);
      expect(result.current.projects[0].color).toBeTruthy();
    });

    it("updates a project", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addProject({ name: "Old Name", clientId: null, hourlyRate: null });
      });
      const id = result.current.projects[0].id;
      act(() => {
        result.current.updateProject(id, { name: "New Name" });
      });
      expect(result.current.projects[0].name).toBe("New Name");
    });

    it("deletes a project", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addProject({ name: "To Delete", clientId: null, hourlyRate: null });
      });
      const id = result.current.projects[0].id;
      act(() => {
        result.current.deleteProject(id);
      });
      expect(result.current.projects).toHaveLength(0);
    });
  });

  describe("clients", () => {
    it("adds a client", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addClient({ name: "John", email: "john@test.com", company: "Acme" });
      });
      expect(result.current.clients).toHaveLength(1);
      expect(result.current.clients[0].name).toBe("John");
      expect(result.current.clients[0].email).toBe("john@test.com");
    });

    it("updates a client", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addClient({ name: "Old", email: "", company: "" });
      });
      const id = result.current.clients[0].id;
      act(() => {
        result.current.updateClient(id, { name: "Updated" });
      });
      expect(result.current.clients[0].name).toBe("Updated");
    });

    it("deletes a client", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addClient({ name: "Gone", email: "", company: "" });
      });
      const id = result.current.clients[0].id;
      act(() => {
        result.current.deleteClient(id);
      });
      expect(result.current.clients).toHaveLength(0);
    });
  });

  describe("time entries", () => {
    it("adds a time entry", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addEntry({
          description: "Coding",
          projectId: null,
          duration: 3600,
          startedAt: new Date(),
        });
      });
      expect(result.current.entries).toHaveLength(1);
      expect(result.current.entries[0].description).toBe("Coding");
      expect(result.current.entries[0].duration).toBe(3600);
    });
  });

  describe("invoices", () => {
    it("adds an invoice", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addInvoice({
          clientId: null,
          projectId: null,
          status: "draft",
          items: [{ id: "1", description: "Design", hours: 10, rate: 50 }],
          notes: "",
          dueDate: new Date(),
        });
      });
      expect(result.current.invoices).toHaveLength(1);
      expect(result.current.invoices[0].number).toMatch(/^INV-/);
      expect(result.current.invoices[0].status).toBe("draft");
    });

    it("updates invoice status", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addInvoice({
          clientId: null,
          projectId: null,
          status: "draft",
          items: [{ id: "1", description: "Work", hours: 5, rate: 100 }],
          notes: "",
          dueDate: new Date(),
        });
      });
      const id = result.current.invoices[0].id;
      act(() => {
        result.current.updateInvoice(id, { status: "sent" });
      });
      expect(result.current.invoices[0].status).toBe("sent");
    });
  });

  describe("lookups", () => {
    it("finds project by id", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addProject({ name: "Find Me", clientId: null, hourlyRate: null });
      });
      const id = result.current.projects[0].id;
      expect(result.current.getProjectById(id)?.name).toBe("Find Me");
      expect(result.current.getProjectById("fake")).toBeUndefined();
      expect(result.current.getProjectById(null)).toBeUndefined();
    });

    it("finds client by id", () => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.addClient({ name: "Find Me", email: "", company: "" });
      });
      const id = result.current.clients[0].id;
      expect(result.current.getClientById(id)?.name).toBe("Find Me");
      expect(result.current.getClientById(null)).toBeUndefined();
    });
  });
});
