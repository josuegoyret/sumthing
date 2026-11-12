import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CalculatorClient, Outcome } from "../calculatorClient";
import Calculator from "./Calculator";

function fakeClient(...outcomes: Outcome[]) {
  const calculate = vi.fn<CalculatorClient["calculate"]>();
  for (const outcome of outcomes) {
    calculate.mockResolvedValueOnce(outcome);
  }
  return { calculate };
}

function renderCalculator(client: CalculatorClient) {
  const user = userEvent.setup();
  render(<Calculator client={client} />);
  async function press(...names: string[]) {
    for (const name of names) {
      await user.click(screen.getByRole("button", { name }));
    }
  }
  return { press };
}

describe("Calculator", () => {
  it("sends the Expression and shows the Result under it", async () => {
    const client = fakeClient({ kind: "result", result: "28" });
    const { press } = renderCalculator(client);

    await press("1", "5", "plus", "6", "plus", "7", "equals");

    expect(client.calculate).toHaveBeenCalledWith("15+6+7");
    expect(await screen.findByRole("status")).toHaveTextContent("28");
    expect(screen.getByText("15+6+7")).toBeVisible();
  });

  it("shows a calculation error", async () => {
    const client = fakeClient({
      kind: "calculationError",
      code: "DIVISION_BY_ZERO",
      message: "Can't divide by zero.",
    });
    const { press } = renderCalculator(client);

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
    const { press } = renderCalculator(client);

    await press("2", "plus", "3", "equals");
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Can't reach the calculator.",
    );

    await press("equals");
    expect(await screen.findByRole("status")).toHaveTextContent("5");
    expect(client.calculate).toHaveBeenNthCalledWith(2, "2+3");
  });

  it("disables equals while it waits for the server", async () => {
    const client = { calculate: vi.fn(() => new Promise<Outcome>(() => {})) };
    const { press } = renderCalculator(client);

    await press("2", "plus", "3", "equals");

    expect(screen.getByRole("button", { name: "equals" })).toBeDisabled();
  });

  it("shows the last Operator as pressed until the next Number", async () => {
    const { press } = renderCalculator(fakeClient());

    await press("5", "multiply");
    expect(screen.getByRole("button", { name: "multiply" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await press("2");
    expect(screen.getByRole("button", { name: "multiply" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it.each([
    "clear",
    "backspace",
    "divide",
    "multiply",
    "minus",
    "plus",
    "point",
    "equals",
  ])("names the %s key", (name) => {
    renderCalculator(fakeClient());

    expect(screen.getByRole("button", { name })).toBeInTheDocument();
  });
});
