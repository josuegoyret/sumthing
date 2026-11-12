import type { Outcome } from "./calculatorClient";
import { toDisplay } from "./displayFormat";

export type Operator = "+" | "-" | "*" | "/";

export type Action =
  | { type: "digit"; digit: string }
  | { type: "point" }
  | { type: "operator"; operator: Operator }
  | { type: "equals" }
  | { type: "clear" }
  | { type: "backspace" }
  | { type: "outcome"; outcome: Outcome };

export type Mode = "typing" | "pending" | "result" | "error" | "unreachable";

export type CalculatorState = {
  mode: Mode;
  expression: string;
  sentExpression: string;
  message: string;
};

export const MAX_EXPRESSION_LENGTH = 100;
export const UNREACHABLE_MESSAGE = "Can't reach the calculator.";

const OPERATORS: Operator[] = ["+", "-", "*", "/"];
const EMPTY_MAIN_LINE = "0";
const CURRENT_NUMBER = /[\d.]*$/;
const TRAILING_OPERATOR = /[+\-*/]$/;
const OPERATOR_AFTER_FIRST_CHARACTER = /.[+\-*/]/;
const TRAILING_POINT = /\.$/;

export const initialState: CalculatorState = {
  mode: "typing",
  expression: "",
  sentExpression: "",
  message: "",
};

function currentNumber(expression: string) {
  return expression.match(CURRENT_NUMBER)?.[0] ?? "";
}

function withDigit(expression: string, digit: string) {
  if (currentNumber(expression) === "0") {
    return expression.slice(0, -1) + digit;
  }
  return expression + digit;
}

function withPoint(expression: string) {
  const number = currentNumber(expression);
  if (number.includes(".")) return expression;
  if (number === "") return expression + "0.";
  return expression + ".";
}

function withOperator(expression: string, operator: Operator) {
  if (expression === "") return EMPTY_MAIN_LINE + operator;
  const base = expression
    .replace(TRAILING_OPERATOR, "")
    .replace(TRAILING_POINT, "");
  return base + operator;
}

function withoutLastCharacter(expression: string) {
  const shorter = expression.slice(0, -1);
  return shorter === "-" ? "" : shorter;
}

function typed(state: CalculatorState, expression: string): CalculatorState {
  if (expression.length > MAX_EXPRESSION_LENGTH) return state;
  return { ...initialState, expression };
}

function afterOutcome(
  state: CalculatorState,
  outcome: Outcome,
): CalculatorState {
  const sentExpression = state.expression;
  switch (outcome.kind) {
    case "result":
      return {
        ...initialState,
        mode: "result",
        expression: outcome.result,
        sentExpression,
      };
    case "calculationError":
      return {
        ...initialState,
        mode: "error",
        sentExpression,
        message: outcome.message,
      };
    case "unreachable":
      return { ...state, mode: "unreachable", message: UNREACHABLE_MESSAGE };
    default:
      return outcome satisfies never;
  }
}

function sent(state: CalculatorState): CalculatorState {
  if (!OPERATOR_AFTER_FIRST_CHARACTER.test(state.expression)) return state;
  const expression = state.expression
    .replace(TRAILING_OPERATOR, "")
    .replace(TRAILING_POINT, "");
  return { ...initialState, mode: "pending", expression };
}

export function nextState(
  state: CalculatorState,
  action: Action,
): CalculatorState {
  if (state.mode === "pending") {
    return action.type === "outcome"
      ? afterOutcome(state, action.outcome)
      : state;
  }

  const startsFresh = state.mode === "result" || state.mode === "error";
  const freshOrCurrent = startsFresh ? "" : state.expression;
  const continuable = state.mode === "error" ? "" : state.expression;

  switch (action.type) {
    case "digit":
      return typed(state, withDigit(freshOrCurrent, action.digit));
    case "point":
      return typed(state, withPoint(freshOrCurrent));
    case "operator":
      return typed(state, withOperator(continuable, action.operator));
    case "backspace":
      return startsFresh
        ? state
        : typed(state, withoutLastCharacter(state.expression));
    case "clear":
      return initialState;
    case "equals":
      return startsFresh ? state : sent(state);
    case "outcome":
      return state;
    default:
      return action satisfies never;
  }
}

export function screenOf(state: CalculatorState) {
  const showsMessage = state.mode === "error" || state.mode === "unreachable";
  const expressionLine = {
    typing: "",
    pending: "",
    result: state.sentExpression,
    error: state.sentExpression,
    unreachable: state.expression,
  }[state.mode];
  const trailingOperator = OPERATORS.find((operator) =>
    state.expression.endsWith(operator),
  );

  return {
    mode: state.mode,
    expressionLine: toDisplay(expressionLine),
    mainLine: showsMessage
      ? state.message
      : toDisplay(state.expression || EMPTY_MAIN_LINE),
    selectedOperator:
      state.mode === "typing" ? (trailingOperator ?? null) : null,
  };
}
