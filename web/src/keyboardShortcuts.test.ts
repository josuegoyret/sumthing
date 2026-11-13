import { describe, expect, it } from "vitest";
import type { KeyAction } from "./calculatorState";
import { keyActionFor, keyActionId, shortcutsFor } from "./keyboardShortcuts";

describe("keyActionFor", () => {
  it.each([
    ["7", { type: "digit", digit: "7" }],
    [".", { type: "point" }],
    [",", { type: "point" }],
    ["+", { type: "operator", operator: "+" }],
    ["-", { type: "operator", operator: "-" }],
    ["*", { type: "operator", operator: "*" }],
    ["x", { type: "operator", operator: "*" }],
    ["/", { type: "operator", operator: "/" }],
    ["^", { type: "operator", operator: "^" }],
    ["%", { type: "percent" }],
    ["r", { type: "squareRoot" }],
    ["Enter", { type: "equals" }],
    ["=", { type: "equals" }],
    ["Backspace", { type: "backspace" }],
    ["Escape", { type: "clear" }],
    ["Delete", { type: "clear" }],
  ])("maps %s", (key, action) => {
    expect(keyActionFor(key)).toEqual(action);
  });

  it.each(["a", " ", "Tab", "F5", "ArrowLeft"])("ignores %j", (key) => {
    expect(keyActionFor(key)).toBeUndefined();
  });
});

describe("keyActionId", () => {
  it("is the same for equal actions", () => {
    expect(keyActionId({ type: "digit", digit: "7" })).toBe(
      keyActionId({ type: "digit", digit: "7" }),
    );
    expect(keyActionId({ type: "operator", operator: "+" })).not.toBe(
      keyActionId({ type: "operator", operator: "-" }),
    );
  });
});

describe("shortcutsFor", () => {
  const cases: [KeyAction, string | undefined][] = [
    [{ type: "equals" }, "Enter ="],
    [{ type: "operator", operator: "+" }, "Plus"],
    [{ type: "operator", operator: "*" }, "* x"],
    [{ type: "clear" }, "Escape Delete"],
    [{ type: "square" }, undefined],
  ];

  it.each(cases)("lists the keys for %o", (action, shortcuts) => {
    expect(shortcutsFor(action)).toBe(shortcuts);
  });
});
