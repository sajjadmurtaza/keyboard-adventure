import {
  isEditableTarget,
  isInspectShortcut,
  isLocalHostName,
  isSelectAllShortcut,
  NO_SELECT_CSS,
  shouldBlockSelection,
  shouldLockPageTools,
} from "@/utils/pageLock";
import { describe, expect, it } from "vitest";

describe("page lock", () => {
  it("stays unlocked on local hosts", () => {
    expect(isLocalHostName("localhost")).toBe(true);
    expect(isLocalHostName("127.0.0.1")).toBe(true);
    expect(isLocalHostName("::1")).toBe(true);
    expect(isLocalHostName("example.com")).toBe(false);
    expect(shouldLockPageTools("localhost")).toBe(false);
    expect(shouldLockPageTools("keyboard-adventure.app")).toBe(true);
  });

  it("treats inspect shortcuts as locked and leaves typing fields editable", () => {
    expect(isInspectShortcut({ key: "F12", ctrlKey: false, metaKey: false, shiftKey: false, altKey: false })).toBe(true);
    expect(
      isInspectShortcut({ key: "i", ctrlKey: true, metaKey: false, shiftKey: true, altKey: false }),
    ).toBe(true);
    expect(
      isInspectShortcut({ key: "j", ctrlKey: false, metaKey: true, shiftKey: true, altKey: false }),
    ).toBe(true);
    expect(
      isInspectShortcut({ key: "i", ctrlKey: false, metaKey: true, shiftKey: false, altKey: true }),
    ).toBe(true);
    expect(
      isInspectShortcut({ key: "f", ctrlKey: false, metaKey: false, shiftKey: false, altKey: false }),
    ).toBe(false);
    expect(
      isInspectShortcut({ key: "c", ctrlKey: true, metaKey: false, shiftKey: true, altKey: false }),
    ).toBe(true);
    expect(
      isInspectShortcut({ key: "k", ctrlKey: true, metaKey: false, shiftKey: true, altKey: false }),
    ).toBe(true);
    expect(
      isInspectShortcut({ key: "u", ctrlKey: true, metaKey: false, shiftKey: false, altKey: false }),
    ).toBe(true);
    expect(isEditableTarget(document.createElement("textarea"))).toBe(true);
    expect(isEditableTarget(document.createElement("div"))).toBe(false);
    const line = document.createElement("p");
    line.append(document.createTextNode("F"));
    expect(isEditableTarget(line.firstChild)).toBe(false);
  });

  it("blocks selecting labels and pictures, not name fields", () => {
    expect(shouldBlockSelection(null)).toBe(true);
    expect(shouldBlockSelection(document.createElement("p"))).toBe(true);
    expect(shouldBlockSelection(document.createElement("img"))).toBe(true);
    expect(shouldBlockSelection(document.createElement("input"))).toBe(false);
    expect(shouldBlockSelection(document.createElement("textarea"))).toBe(false);
    expect(isSelectAllShortcut({ key: "a", ctrlKey: true, metaKey: false })).toBe(true);
    expect(isSelectAllShortcut({ key: "a", ctrlKey: false, metaKey: true })).toBe(true);
    expect(isSelectAllShortcut({ key: "f", ctrlKey: true, metaKey: false })).toBe(false);
  });

  it("keeps page CSS from selecting body text", () => {
    expect(NO_SELECT_CSS).toMatch(/html,body,\*\{[^}]*user-select:none!important/);
    expect(NO_SELECT_CSS).toMatch(/input,textarea\{[^}]*user-select:text!important/);
    expect(NO_SELECT_CSS).toMatch(/-webkit-touch-callout:none/);
    expect(NO_SELECT_CSS).toMatch(/button:not\(:disabled\)[^}]*cursor:pointer/);
    expect(NO_SELECT_CSS).toMatch(/input,textarea\{[^}]*cursor:text/);
  });
});
