import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CalculatorClient, Outcome } from "../calculatorClient";
import Calculator from "./Calculator";

vi.mock("howler", () => ({
  Howl: vi.fn(function () {
    return { play: vi.fn() };
  }),
  Howler: { mute: vi.fn() },
}));

function fakeClient(...outcomes: Outcome[]) {
  const dictate = vi.fn<CalculatorClient["dictate"]>();
  const calculate = vi.fn<CalculatorClient["calculate"]>();
  for (const outcome of outcomes) {
    calculate.mockResolvedValueOnce(outcome);
  }
  return { calculate, dictate };
}

function renderCalculator(client: CalculatorClient) {
  const user = userEvent.setup();
  render(<Calculator client={client} />);
  async function press(...names: string[]) {
    for (const name of names) {
      await user.click(screen.getByRole("button", { name }));
    }
  }
  return press;
}

describe("Calculator", () => {
  it("sends the Expression and shows the Result under it", async () => {
    const client = fakeClient({ kind: "result", result: "28" });
    const press = renderCalculator(client);

    await press("1", "5", "plus", "6", "plus", "7", "equals");

    expect(client.calculate).toHaveBeenCalledWith("15+6+7");
    expect(await screen.findByRole("status")).toHaveTextContent("28");
    expect(screen.getByText("15+6+7")).toBeVisible();
  });

  it("keeps the Expression and disables equals while it waits", async () => {
    const client = {
      calculate: vi.fn(() => new Promise<Outcome>(() => {})),
      dictate: vi.fn(),
    };
    const press = renderCalculator(client);

    await press("2", "plus", "3", "equals");

    expect(screen.getByText("2+3")).toBeVisible();
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "equals" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("shows a calculation error", async () => {
    const press = renderCalculator(
      fakeClient({
        kind: "calculationError",
        code: "DIVISION_BY_ZERO",
        message: "Can't divide by zero.",
      }),
    );

    await press("5", "divide", "0", "equals");

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Can't divide by zero.",
    );
  });

  it("keeps the Expression when unreachable, and tries again", async () => {
    const client = fakeClient(
      { kind: "unreachable" },
      { kind: "result", result: "5" },
    );
    const press = renderCalculator(client);

    await press("2", "plus", "3", "equals");
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Can't reach the calculator.",
    );

    await press("equals");
    expect(await screen.findByRole("status")).toHaveTextContent("5");
    expect(client.calculate).toHaveBeenNthCalledWith(2, "2+3");
  });

  it("shows the last Operator as pressed until the next Number", async () => {
    const press = renderCalculator(fakeClient());
    const multiply = screen.getByRole("button", { name: "multiply" });

    await press("5", "multiply");
    expect(multiply).toHaveAttribute("aria-pressed", "true");

    await press("2");
    expect(multiply).toHaveAttribute("aria-pressed", "false");
  });

  it("opens the function keys and sends a Percent of the left side", async () => {
    const client = fakeClient({ kind: "result", result: "55" });
    const press = renderCalculator(client);
    const toggle = screen.getByRole("button", { name: "More functions" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await press("More functions", "5", "0", "plus", "1", "0", "percent");
    await press("equals");

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(client.calculate).toHaveBeenCalledWith("50+10%");
    expect(await screen.findByRole("status")).toHaveTextContent("55");
  });
});
