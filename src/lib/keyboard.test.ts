// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { isTypingTarget } from "./keyboard";

describe("isTypingTarget", () => {
  it("is true for fields being typed in", () => {
    for (const tag of ["input", "textarea", "select"]) {
      expect(isTypingTarget(document.createElement(tag))).toBe(true);
    }
  });

  it("is true for editable content", () => {
    const div = document.createElement("div");
    div.contentEditable = "true";
    document.body.append(div);
    // jsdom does not derive isContentEditable from the attribute.
    Object.defineProperty(div, "isContentEditable", { value: true });
    expect(isTypingTarget(div)).toBe(true);
  });

  it("is true for anything inside a dialog", () => {
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    const button = document.createElement("button");
    dialog.append(button);
    document.body.append(dialog);
    expect(isTypingTarget(button)).toBe(true);
  });

  it("is false for the page itself and for no target", () => {
    expect(isTypingTarget(document.body)).toBe(false);
    expect(isTypingTarget(document.createElement("button"))).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });
});
