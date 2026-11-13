import type { CalculatorClient } from "../calculatorClient";
import type { KeyAction } from "../calculatorState";
import { useCalculator } from "../hooks/useCalculator";
import { useDictation } from "../hooks/useDictation";
import DictationBanner from "./DictationBanner";
import Display from "./Display";
import Keypad from "./Keypad";
import "./Calculator.css";

type CalculatorProps = {
  client: CalculatorClient;
};

export default function Calculator({ client }: CalculatorProps) {
  const calculator = useCalculator(client);
  const dictation = useDictation({
    client,
    screen: calculator.dictationScreen,
    onDictated: calculator.showDictation,
  });
  const { screen } = calculator;

  function press(action: KeyAction) {
    if (action.type === "dictate") {
      dictation.toggle();
      return;
    }
    calculator.press(action);
  }

  return (
    <section className="calculator" aria-label="Calculator">
      <DictationBanner
        banner={dictation.banner}
        isOpen={dictation.isBannerOpen}
        elapsedMs={dictation.elapsedMs}
        onDismiss={dictation.dismissBanner}
      />
      <Display
        expressionLine={screen.expressionLine}
        mainLine={screen.mainLine}
        mode={screen.mode}
      />
      <Keypad
        selectedOperator={screen.selectedOperator}
        isPending={screen.mode === "pending"}
        dictationStatus={dictation.status}
        dictationLevel={dictation.level}
        onPress={press}
      />
    </section>
  );
}
