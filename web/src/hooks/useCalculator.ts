import { useReducer } from "react";
import type { CalculatorClient, Dictation } from "../calculatorClient";
import {
  type CalculatorKeyAction,
  dictationScreenOf,
  initialState,
  nextState,
  screenOf,
  sendableExpression,
} from "../calculatorState";
import { playClick, playPing } from "../keySounds";

export function useCalculator(client: CalculatorClient) {
  const [state, dispatch] = useReducer(nextState, initialState);

  async function submit() {
    const expression = sendableExpression(state);
    if (expression === null) return;
    dispatch({ type: "sent", expression });
    const outcome = await client.calculate(expression);
    dispatch({ type: "outcome", outcome });
    if (outcome.kind === "result") playPing();
  }

  function showDictation({ expression, result }: Dictation) {
    dispatch({ type: "sent", expression });
    dispatch({ type: "outcome", outcome: { kind: "result", result } });
    playPing();
  }

  function press(action: CalculatorKeyAction) {
    if (action.type === "equals") {
      submit();
      return;
    }
    playClick();
    dispatch(action);
  }

  return {
    screen: screenOf(state),
    dictationScreen: dictationScreenOf(state),
    press,
    showDictation,
  };
}
