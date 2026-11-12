import type { Outcome } from "./calculatorClient";
import { toDisplay } from "./displayFormat";

export type Operator = "+" | "-" | "*" | "/";

type EditAction =
  | { type: "digit"; digit: string }
  | { type: "point" }
  | { type: "operator"; operator: Operator }
  | { type: "clear" }
  | { type: "backspace" };

export type KeyAction = EditAction | { type: "equals" };

export type Action =
  | EditAction
  | { type: "sent"; expression: string }
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

export const initialState: CalculatorState = {
  mode: "typing",
  expression: "",
  sentExpression: "",
  message: "",
};

function operatorOf(character: string | undefined) {
  return OPERATORS.find((operator) => operator === character);
}

function endsWithOperatorOrPoint(expression: string) {
  const last = expression.at(-1);
  return operatorOf(last) !== undefined || last === ".";
}

function currentNumber(expression: string) {
  const lastOperatorIndex = Math.max(
    ...OPERATORS.map((operator) => expression.lastIndexOf(operator)),
  );
  return expression.slice(lastOperatorIndex + 1);
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
  const base = endsWithOperatorOrPoint(expression)
    ? expression.slice(0, -1)
    : expression;
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
  const { sentExpression } = state;
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

export function sendableExpression(state: CalculatorState) {
  if (state.mode !== "typing" && state.mode !== "unreachable") return null;
  const hasOperator = OPERATORS.some(
    (operator) => state.expression.indexOf(operator, 1) !== -1,
  );
  if (!hasOperator) return null;
  return endsWithOperatorOrPoint(state.expression)
    ? state.expression.slice(0, -1)
    : state.expression;
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
    case "sent":
      return {
        ...initialState,
        mode: "pending",
        expression: action.expression,
        sentExpression: action.expression,
      };
    case "outcome":
      return state;
    default:
      return action satisfies never;
  }
}

function mainLineOf(state: CalculatorState) {
  if (state.mode === "error" || state.mode === "unreachable") {
    return state.message;
  }
  return toDisplay(state.expression || EMPTY_MAIN_LINE);
}

export function screenOf(state: CalculatorState) {
  const hasOutcome = state.mode !== "typing" && state.mode !== "pending";
  const expressionLine = hasOutcome ? state.sentExpression : "";
  const trailingOperator = operatorOf(state.expression.at(-1));

  return {
    mode: state.mode,
    expressionLine: toDisplay(expressionLine),
    mainLine: mainLineOf(state),
    selectedOperator:
      state.mode === "typing" ? (trailingOperator ?? null) : null,
  };
}
