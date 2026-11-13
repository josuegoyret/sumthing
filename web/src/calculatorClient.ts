export type Outcome =
  | { kind: "result"; result: string }
  | { kind: "calculationError"; code: string; message: string }
  | { kind: "unreachable" };

export type Dictation = {
  transcript: string;
  expression: string;
  result: string;
};

export type DictationOutcome =
  | ({ kind: "result" } & Dictation)
  | { kind: "calculationError"; code: string; message: string }
  | { kind: "unreachable" };

export interface CalculatorClient {
  calculate(expression: string): Promise<Outcome>;
  dictate(audio: Blob, screen: string): Promise<DictationOutcome>;
}
