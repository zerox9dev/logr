import { describe, expect, it } from "vitest";
import { suggestFromHistory, type SessionLike } from "./suggest-session";

const projects = [{ id: "acme" }, { id: "globex" }];

function s(name: string, project_id: string | null): SessionLike {
  return { name, project_id };
}

describe("suggestFromHistory", () => {
  it("returns null when there is no text", () => {
    expect(suggestFromHistory("", [s("Acme landing page", "acme")], projects)).toBeNull();
  });

  it("returns null with no labelled history", () => {
    expect(suggestFromHistory("landing page", [s("landing page", null)], projects)).toBeNull();
  });

  it("matches a project by overlapping words in past session names", () => {
    const sessions = [
      s("Acme landing page redesign", "acme"),
      s("Globex API integration", "globex"),
    ];
    const r = suggestFromHistory("landing page tweaks", sessions, projects);
    expect(r?.projectId).toBe("acme");
    expect(r?.source).toBe("history");
    expect(r!.confidence).toBeGreaterThan(0.34);
  });

  it("ignores stopwords and short tokens", () => {
    const sessions = [s("invoice the client for work", "globex")];
    // Only "invoice", "client", "work" are meaningful; "the", "for" dropped.
    const r = suggestFromHistory("invoice client", sessions, projects);
    expect(r?.projectId).toBe("globex");
  });

  it("rewards recurring tasks over one-offs", () => {
    const sessions = [
      s("standup meeting", "acme"),
      s("standup meeting", "acme"),
      s("standup notes", "globex"),
    ];
    const r = suggestFromHistory("standup meeting", sessions, projects);
    expect(r?.projectId).toBe("acme");
  });

  it("returns null when two projects tie (no clear margin)", () => {
    const sessions = [s("design review", "acme"), s("design review", "globex")];
    expect(suggestFromHistory("design review", sessions, projects)).toBeNull();
  });

  it("skips sessions whose project no longer exists", () => {
    const sessions = [s("deleted project work", "ghost")];
    expect(suggestFromHistory("deleted project work", sessions, projects)).toBeNull();
  });
});
