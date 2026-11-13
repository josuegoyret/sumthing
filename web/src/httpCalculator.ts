import type { CalculatorClient, Dictation } from "./calculatorClient";

// The API sleeps when it has no traffic, and a cold start can take about a
// minute. Both timeouts wait for it to wake up instead of failing early.
const CALCULATE_TIMEOUT_MS = 90000;
const DICTATE_TIMEOUT_MS = 90000;
const AUDIO_FILE_NAME = "dictation";

type ErrorBody = { error: { code: string; message: string } };
type CalculateResponse = { result: string } | ErrorBody;
type DictateResponse = Dictation | ErrorBody;

function fileExtensionOf(mimeType: string) {
  const subtype = mimeType.split("/")[1] ?? "";
  return subtype.split(";")[0];
}

async function postWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export function warmUp(apiUrl: string) {
  fetch(`${apiUrl}/healthz`).catch(() => {});
}

export function createHttpCalculator(apiUrl: string): CalculatorClient {
  return {
    async calculate(expression) {
      try {
        const body: CalculateResponse = await postWithTimeout(
          `${apiUrl}/v1/calculate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ expression }),
          },
          CALCULATE_TIMEOUT_MS,
        );
        if ("error" in body) {
          return { kind: "calculationError", ...body.error };
        }
        return { kind: "result", result: body.result };
      } catch {
        return { kind: "unreachable" };
      }
    },

    async dictate(audio, screen) {
      const form = new FormData();
      form.append(
        "audio",
        audio,
        `${AUDIO_FILE_NAME}.${fileExtensionOf(audio.type)}`,
      );
      form.append("expression", screen);
      try {
        const body: DictateResponse = await postWithTimeout(
          `${apiUrl}/v1/dictate`,
          { method: "POST", body: form },
          DICTATE_TIMEOUT_MS,
        );
        if ("error" in body) {
          return { kind: "calculationError", ...body.error };
        }
        return { kind: "result", ...body };
      } catch {
        return { kind: "unreachable" };
      }
    },
  };
}
