import type { Outcome } from "./calculatorClient";
import { toDisplay } from "./displayFormat";

export type Operator = "+" | "-" | "*" | "/" | "^";

type EditAction =
  | { type: "digit"; digit: string }
  | { type: "point" }
  | { type: "operator"; operator: Operator }
  | { type: "squareRoot" }
  | { type: "square" }
  | { type: "percent" }
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

const OPERATORS: Operator[] = ["+", "-", "*", "/", "^"];
const EMPTY_MAIN_LINE = "0";
const SQUARE_ROOT = "√";
const PERCENT = "%";
const SQUARE_EXPONENT = "2";

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

function lastOperatorIndex(expression: string) {
  return Math.max(
    ...OPERATORS.map((operator) => expression.lastIndexOf(operator)),
  );
}

function lastOperatorOf(expression: string) {
  const index = lastOperatorIndex(expression);
  return index > 0 ? expression[index] : undefined;
}

function currentNumber(expression: string) {
  const number = expression.slice(lastOperatorIndex(expression) + 1);
  return number.startsWith(SQUARE_ROOT) ? number.slice(1) : number;
}

function withDigit(expression: string, digit: string) {
  const number = currentNumber(expression);
  if (number.includes(PERCENT)) return expression;
  if (number === "0") return expression.slice(0, -1) + digit;
  return expression + digit;
}

function withPoint(expression: string) {
  const number = currentNumber(expression);
  if (number.includes(".") || number.includes(PERCENT)) return expression;
  if (number === "") return expression + "0.";
  return expression + ".";
}

function withOperator(expression: string, operator: Operator) {
  if (expression === "") return EMPTY_MAIN_LINE + operator;
  if (expression.endsWith(SQUARE_ROOT)) return expression;
  const base = endsWithOperatorOrPoint(expression)
    ? expression.slice(0, -1)
    : expression;
  const makesPowerChain = operator === "^" && lastOperatorOf(base) === "^";
  return makesPowerChain ? expression : base + operator;
}

function withSquareRoot(expression: string) {
  const canStartNumber =
    currentNumber(expression) === "" && !expression.endsWith(SQUARE_ROOT);
  return canStartNumber ? expression + SQUARE_ROOT : expression;
}

function withSquare(expression: string) {
  const withPower = withOperator(expression, "^");
  const hasNumber = currentNumber(expression) !== "";
  if (!hasNumber || withPower === expression) return expression;
  return withDigit(withPower, SQUARE_EXPONENT);
}

function withPercent(expression: string) {
  const number = currentNumber(expression);
  if (number === "" || number.includes(PERCENT)) return expression;
  const base = expression.endsWith(".") ? expression.slice(0, -1) : expression;
  return base + PERCENT;
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

function withoutUnfinishedEnd(expression: string) {
  let finished = expression;
  while (endsWithOperatorOrPoint(finished) || finished.endsWith(SQUARE_ROOT)) {
    finished = finished.slice(0, -1);
  }
  return finished;
}

export function sendableExpression(state: CalculatorState) {
  if (state.mode !== "typing" && state.mode !== "unreachable") return null;
  const entered = state.expression;
  const needsServer =
    lastOperatorOf(entered) !== undefined ||
    entered.includes(SQUARE_ROOT) ||
    entered.includes(PERCENT);
  const expression = withoutUnfinishedEnd(entered);
  return needsServer && expression !== "" ? expression : null;
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
    case "squareRoot":
      return typed(state, withSquareRoot(freshOrCurrent));
    case "square":
      return typed(state, withSquare(continuable));
    case "percent":
      return typed(state, withPercent(continuable));
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
