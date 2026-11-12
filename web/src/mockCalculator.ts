import type { CalculatorClient } from "./calculatorClient";

const DELAY_MS = 300;
const DECIMAL_PLACES = 10;

function evaluate(expression: string): number {
  return Function(`return ${expression}`)();
}

export const mockCalculator: CalculatorClient = {
  async calculate(expression) {
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

    try {
      const value = evaluate(expression);
      if (!Number.isFinite(value)) {
        return {
          kind: "calculationError",
          code: "DIVISION_BY_ZERO",
          message: "Can't divide by zero.",
        };
      }
      return {
        kind: "result",
        result: String(Number(value.toFixed(DECIMAL_PLACES))),
      };
    } catch {
      return {
        kind: "calculationError",
        code: "INVALID_EXPRESSION",
        message: "The expression is not valid.",
      };
    }
  },
};
