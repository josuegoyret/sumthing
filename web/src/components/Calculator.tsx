import type { CalculatorClient } from "../calculatorClient";
import { useCalculator } from "../hooks/useCalculator";
import Display from "./Display";
import Keypad from "./Keypad";
import "./Calculator.css";

type CalculatorProps = {
  client: CalculatorClient;
};

export default function Calculator({ client }: CalculatorProps) {
  const { screen, press } = useCalculator(client);

  return (
    <section className="calculator" aria-label="Calculator">
      <Display
        expressionLine={screen.expressionLine}
        mainLine={screen.mainLine}
        mode={screen.mode}
      />
      <Keypad
        selectedOperator={screen.selectedOperator}
        isPending={screen.mode === "pending"}
        onPress={press}
      />
    </section>
  );
}
