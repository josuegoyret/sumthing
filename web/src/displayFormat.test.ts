import { describe, expect, it } from "vitest";
import { toDisplay } from "./displayFormat";

describe("toDisplay", () => {
  it.each([
    ["a single digit", "0", "0"],
    ["wire operators as UI symbols", "5*3/2-1+4", "5×3÷2−1+4"],
    ["a negative Number with a real minus", "-3+1", "−3+1"],
    ["thousands in each Number", "1234.5+6000", "1,234.5+6,000"],
    ["millions", "1234567", "1,234,567"],
    ["no grouping in decimals", "0.12345", "0.12345"],
    ["a long Result", "22333.3333333333", "22,333.3333333333"],
    ["a trailing point", "1000.", "1,000."],
    ["a trailing Operator", "1000*", "1,000×"],
  ])("shows %s", (_, wire, shown) => {
    expect(toDisplay(wire)).toBe(shown);
  });
});
