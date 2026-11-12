import { describe, expect, it } from "vitest";
import {
  type Action,
  type CalculatorState,
  initialState,
  nextState,
  screenOf,
  sendableExpression,
} from "./calculatorState";

const KEY_ACTIONS: Record<string, Action> = {
  ".": { type: "point" },
  "+": { type: "operator", operator: "+" },
  "-": { type: "operator", operator: "-" },
  "*": { type: "operator", operator: "*" },
  "/": { type: "operator", operator: "/" },
  "^": { type: "operator", operator: "^" },
  "√": { type: "squareRoot" },
  s: { type: "square" },
  "%": { type: "percent" },
  C: { type: "clear" },
  "<": { type: "backspace" },
};

function afterKey(state: CalculatorState, key: string) {
  if (key !== "=") {
    return nextState(state, KEY_ACTIONS[key] ?? { type: "digit", digit: key });
  }
  const expression = sendableExpression(state);
  if (expression === null) return state;
  return nextState(state, { type: "sent", expression });
}

function press(keys: string, from: CalculatorState = initialState) {
  return [...keys].reduce(afterKey, from);
}

function result(value: string): Action {
  return { type: "outcome", outcome: { kind: "result", result: value } };
}

const divisionByZero: Action = {
  type: "outcome",
  outcome: {
    kind: "calculationError",
    code: "DIVISION_BY_ZERO",
    message: "Can't divide by zero.",
  },
};

const unreachable: Action = {
  type: "outcome",
  outcome: { kind: "unreachable" },
};

describe("typing", () => {
  it.each([
    ["starts at 0", "", "0"],
    ["shows digits", "15", "15"],
    ["groups thousands", "1234", "1,234"],
    ["shows UI symbols", "5*3/2-1", "5×3÷2−1"],
    ["replaces a lone 0 with a digit", "07", "7"],
    ["replaces a lone 0 after an Operator", "5+07", "5+7"],
    ["keeps 0 after a point", "0.05", "0.05"],
    ["types 0. for a point with no Number", ".5", "0.5"],
    ["types 0. for a point after an Operator", "5+.", "5+0."],
    ["ignores a second point in one Number", "1.2.3", "1.23"],
    ["allows a point in the next Number", "1.2+3.4", "1.2+3.4"],
    ["starts from 0 for an Operator first", "+", "0+"],
    ["replaces an Operator with the next one", "5+*", "5×"],
    ["drops a trailing point before an Operator", "5.+", "5+"],
    ["removes the last character", "123<", "12"],
    ["shows 0 when everything is removed", "1<", "0"],
    ["clears everything", "12+3C", "0"],
    ["types a square root", "√9", "√9"],
    ["types a square root after an Operator", "2+√9", "2+√9"],
    ["ignores a square root after a digit", "5√", "5"],
    ["ignores a second square root", "√√9", "√9"],
    ["ignores an Operator after a bare square root", "√+", "√"],
    ["types 0. for a point after a square root", "√.", "√0."],
    ["replaces a lone 0 after a square root", "√07", "√7"],
    ["types a power", "2^3", "2^3"],
    ["ignores a second power in one term", "2^3^", "2^3"],
    ["ignores a power that would make a chain", "2^3*^", "2^3×"],
    ["types a square", "5s", "5^2"],
    ["ignores a square with no Number", "5+s", "5+"],
    ["types a Percent", "50%", "50%"],
    ["drops a trailing point before a Percent", "5.%", "5%"],
    ["ignores a Percent with no Number", "5+%", "5+"],
    ["ignores a second Percent", "5%%", "5%"],
    ["ignores digits after a Percent", "5%3", "5%"],
    ["types an Operator after a Percent", "5%+", "5%+"],
    ["removes a Percent", "5%<", "5"],
  ])("%s", (_, keys, mainLine) => {
    expect(screenOf(press(keys)).mainLine).toBe(mainLine);
  });

  it("selects the power like an Operator", () => {
    expect(screenOf(press("2^")).selectedOperator).toBe("^");
  });

  it("selects the last Operator until the next Number", () => {
    expect(screenOf(press("5*")).selectedOperator).toBe("*");
    expect(screenOf(press("5*3")).selectedOperator).toBeNull();
  });

  it("ignores input past 100 characters", () => {
    const full = press("1".repeat(100));
    expect(press("2", full)).toBe(full);
  });
});

describe("equals", () => {
  it("does nothing with no Operator", () => {
    const typed = press("15");
    expect(press("=", typed)).toBe(typed);
  });

  it("sends the Expression and waits", () => {
    const state = press("15+6+7=");
    expect(state.mode).toBe("pending");
    expect(state.expression).toBe("15+6+7");
  });

  it.each([
    ["a trailing Operator", "5+=", "5"],
    ["a trailing point", "5+2.=", "5+2"],
  ])("drops %s", (_, keys, sent) => {
    expect(press(keys).expression).toBe(sent);
  });

  it("keeps the Expression on the main line while it waits", () => {
    expect(screenOf(press("2+3="))).toMatchObject({
      expressionLine: "",
      mainLine: "2+3",
      mode: "pending",
    });
  });

  it("ignores keys while pending", () => {
    const pending = press("2+3=");
    expect(press("4", pending)).toBe(pending);
  });
});

describe("sendableExpression", () => {
  const negativeNumber = press("+<", nextState(press("1-4="), result("-3")));

  it.each([
    ["no Operator", press("15")],
    ["only a leading minus", negativeNumber],
    ["pending", press("2+3=")],
    ["a Result", nextState(press("2+3="), result("5"))],
    ["a calculation error", nextState(press("5/0="), divisionByZero)],
  ])("is null with %s", (_, state) => {
    expect(sendableExpression(state)).toBeNull();
  });

  it.each([
    ["the Expression", "15+6", "15+6"],
    ["the Expression without a trailing Operator", "5+2*", "5+2"],
    ["the Expression without a trailing point", "5+2.", "5+2"],
    ["a lone square root", "√9", "√9"],
    ["a lone Percent", "50%", "50%"],
    ["the Expression without a bare square root", "2+√", "2"],
    ["the Expression without a trailing power", "2^", "2"],
  ])("is %s", (_, keys, sent) => {
    expect(sendableExpression(press(keys))).toBe(sent);
  });

  it("is the Expression again when unreachable", () => {
    expect(sendableExpression(nextState(press("2+3="), unreachable))).toBe(
      "2+3",
    );
  });
});

describe("after a Result", () => {
  const shown = nextState(press("15+6+7="), result("28"));

  it("shows the Expression above the Result", () => {
    expect(screenOf(shown)).toMatchObject({
      expressionLine: "15+6+7",
      mainLine: "28",
      mode: "result",
    });
  });

  it("groups a long Result", () => {
    const big = nextState(press("22333*1="), result("22333"));
    expect(screenOf(big).mainLine).toBe("22,333");
  });

  it.each([
    ["a Percent", "%", "28%"],
    ["a square", "s", "28^2"],
  ])("continues from the Result with %s", (_, keys, mainLine) => {
    expect(screenOf(press(keys, shown)).mainLine).toBe(mainLine);
  });

  it("starts a new Expression with a square root", () => {
    expect(screenOf(press("√", shown)).mainLine).toBe("√");
  });

  it("continues from the Result with an Operator", () => {
    expect(screenOf(press("+", shown)).mainLine).toBe("28+");
  });

  it("continues from a negative Result", () => {
    const negative = nextState(press("1-4="), result("-3"));
    expect(screenOf(press("+", negative)).mainLine).toBe("−3+");
  });

  it.each([
    ["a digit", "4", "4"],
    ["a point", ".", "0."],
  ])("starts a new Expression with %s", (_, keys, mainLine) => {
    expect(screenOf(press(keys, shown)).mainLine).toBe(mainLine);
  });

  it.each([["<"], ["="]])("ignores %s", (keys) => {
    expect(press(keys, shown)).toBe(shown);
  });

  it("ignores an outcome when nothing is pending", () => {
    expect(nextState(shown, result("1"))).toBe(shown);
  });
});

describe("after a calculation error", () => {
  const failed = nextState(press("5/0="), divisionByZero);

  it("shows the message with the Expression above", () => {
    expect(screenOf(failed)).toMatchObject({
      expressionLine: "5÷0",
      mainLine: "Can't divide by zero.",
      mode: "error",
    });
  });

  it.each([
    ["a digit starts fresh", "7", "7"],
    ["an Operator starts from 0", "+", "0+"],
  ])("%s", (_, keys, mainLine) => {
    expect(screenOf(press(keys, failed)).mainLine).toBe(mainLine);
  });
});

describe("when the calculator is unreachable", () => {
  const offline = nextState(press("2+3="), unreachable);

  it("says so and keeps the Expression", () => {
    expect(screenOf(offline)).toMatchObject({
      expressionLine: "2+3",
      mainLine: "Can't reach the calculator.",
      mode: "unreachable",
    });
  });

  it("tries again on equals", () => {
    expect(press("=", offline)).toMatchObject({
      mode: "pending",
      expression: "2+3",
    });
  });

  it("keeps editing the Expression", () => {
    expect(screenOf(press("4", offline)).mainLine).toBe("2+34");
  });
});
