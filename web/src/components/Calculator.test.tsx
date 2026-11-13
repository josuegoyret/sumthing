import { act, render, screen } from "@testing-library/react";
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
  return { press, user };
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

  it("keeps the Expression on the main line until the response", async () => {
    const client = { calculate: vi.fn(() => new Promise<Outcome>(() => {})) };
    const { press } = renderCalculator(client);

    await press("2", "plus", "3", "equals");

    expect(document.querySelector(".display-main")).toHaveTextContent("2+3");
    expect(document.querySelector(".display-expression")?.textContent).toBe("");
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
  });

  it("never waits without a request when keys arrive before a render", () => {
    const client = fakeClient({ kind: "result", result: "5" });
    render(<Calculator client={client} />);
    const key = (name: string) => screen.getByRole("button", { name });

    act(() => {
      for (const name of ["2", "plus", "3", "equals"]) key(name).click();
    });

    const isWaiting = key("equals").getAttribute("aria-disabled") === "true";
    const hasRequest = client.calculate.mock.calls.length > 0;
    expect(isWaiting).toBe(hasRequest);
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

  it("marks equals as disabled, and keeps it focusable, while it waits", async () => {
    const client = { calculate: vi.fn(() => new Promise<Outcome>(() => {})) };
    const { press } = renderCalculator(client);

    await press("2", "plus", "3", "equals");

    const equals = screen.getByRole("button", { name: "equals" });
    expect(equals).toHaveAttribute("aria-disabled", "true");
    expect(equals).toHaveFocus();
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

  it("opens the function keys with the f(x) toggle", async () => {
    const { press } = renderCalculator(fakeClient());
    const toggle = screen.getByRole("button", { name: "More functions" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "percent" })).toBeNull();

    await press("More functions");

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "percent" })).toBeVisible();
  });

  it("sends a Percent of the left side", async () => {
    const client = fakeClient({ kind: "result", result: "55" });
    const { press } = renderCalculator(client);

    await press("More functions", "5", "0", "plus", "1", "0", "percent");
    await press("equals");

    expect(client.calculate).toHaveBeenCalledWith("50+10%");
    expect(await screen.findByRole("status")).toHaveTextContent("55");
  });

  it.each(["square root", "square", "power", "percent"])(
    "names the %s key",
    async (name) => {
      const { press } = renderCalculator(fakeClient());

      await press("More functions");

      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    },
  );

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

  describe("with the keyboard", () => {
    it("types the Expression and sends it with Enter", async () => {
      const client = fakeClient({ kind: "result", result: "4" });
      const { user } = renderCalculator(client);

      await user.keyboard("1,5+3xr4^{Backspace}{Enter}");

      expect(client.calculate).toHaveBeenCalledWith("1.5+3*√4");
      expect(await screen.findByRole("status")).toHaveTextContent("4");
    });

    it("clears with Escape", async () => {
      const { user } = renderCalculator(fakeClient());

      await user.keyboard("12{Escape}");

      expect(document.querySelector(".display-main")?.textContent).toBe("0");
    });

    it("presses equals only once when a Key has focus", async () => {
      const client = fakeClient({ kind: "result", result: "5" });
      const { press, user } = renderCalculator(client);

      await press("2", "plus", "3");
      await user.keyboard("{Enter}");

      expect(client.calculate).toHaveBeenCalledTimes(1);
      expect(client.calculate).toHaveBeenCalledWith("2+3");
    });

    it("ignores keys with Control, so browser shortcuts still work", async () => {
      const { user } = renderCalculator(fakeClient());

      await user.keyboard("{Control>}r{/Control}");

      expect(document.querySelector(".display-main")?.textContent).toBe("0");
    });

    it("shows the Key as pressed while the physical key is held", async () => {
      const { user } = renderCalculator(fakeClient());
      const seven = screen.getByRole("button", { name: "7" });

      await user.keyboard("{7>}");
      expect(seven).toHaveAttribute("data-held", "true");

      await user.keyboard("{/7}");
      expect(seven).not.toHaveAttribute("data-held");
    });

    it("announces the shortcuts of each Key", () => {
      renderCalculator(fakeClient());

      expect(screen.getByRole("button", { name: "equals" })).toHaveAttribute(
        "aria-keyshortcuts",
        "Enter =",
      );
      expect(screen.getByRole("button", { name: "plus" })).toHaveAttribute(
        "aria-keyshortcuts",
        "Plus",
      );
    });
  });
});
