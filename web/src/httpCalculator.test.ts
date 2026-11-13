import { afterEach, describe, expect, it, vi } from "vitest";
import { createHttpCalculator } from "./httpCalculator";

const API_URL = "http://api.test";

function respondWith(status: number, body: unknown) {
  const fetchStub = vi.fn(async () => Response.json(body, { status }));
  vi.stubGlobal("fetch", fetchStub);
  return fetchStub;
}

function calculate(expression: string) {
  return createHttpCalculator(API_URL).calculate(expression);
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("createHttpCalculator", () => {
  it("posts the Expression as JSON", async () => {
    const fetchStub = respondWith(200, { expression: "2+3", result: "5" });

    await calculate("2+3");

    expect(fetchStub).toHaveBeenCalledWith(
      `${API_URL}/v1/calculate`,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression: "2+3" }),
      }),
    );
  });

  it("returns the Result on 200", async () => {
    respondWith(200, { expression: "2+3", result: "5" });

    expect(await calculate("2+3")).toEqual({ kind: "result", result: "5" });
  });

  it.each([
    [400, "INVALID_EXPRESSION", "The expression is not valid."],
    [422, "DIVISION_BY_ZERO", "Can't divide by zero."],
    [500, "INTERNAL", "Something went wrong. Try again."],
  ])("returns the calculation error on %i", async (status, code, message) => {
    respondWith(status, { error: { code, message } });

    expect(await calculate("5/0")).toEqual({
      kind: "calculationError",
      code,
      message,
    });
  });

  it("returns unreachable when the network fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );

    expect(await calculate("2+3")).toEqual({ kind: "unreachable" });
  });

  it("returns unreachable when the response is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Bad Gateway", { status: 502 })),
    );

    expect(await calculate("2+3")).toEqual({ kind: "unreachable" });
  });

  it("returns unreachable after 90 seconds with no response", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_, reject) => {
            init.signal?.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            );
          }),
      ),
    );

    const outcome = calculate("2+3");
    await vi.advanceTimersByTimeAsync(90000);

    expect(await outcome).toEqual({ kind: "unreachable" });
  });
});
