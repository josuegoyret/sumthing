export type Outcome =
  | { kind: "result"; result: string }
  | { kind: "calculationError"; code: string; message: string }
  | { kind: "unreachable" };

export interface CalculatorClient {
  calculate(expression: string): Promise<Outcome>;
}
