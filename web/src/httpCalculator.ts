import type { CalculatorClient } from "./calculatorClient";

const TIMEOUT_MS = 5000;

type CalculateResponse =
  { result: string } | { error: { code: string; message: string } };

export function createHttpCalculator(apiUrl: string): CalculatorClient {
  return {
    async calculate(expression) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const response = await fetch(`${apiUrl}/v1/calculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expression }),
          signal: controller.signal,
        });
        const body: CalculateResponse = await response.json();

        if ("error" in body) {
          return { kind: "calculationError", ...body.error };
        }
        return { kind: "result", result: body.result };
      } catch {
        return { kind: "unreachable" };
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
