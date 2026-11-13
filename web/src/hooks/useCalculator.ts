import { useReducer } from "react";
import type { CalculatorClient } from "../calculatorClient";
import {
  type KeyAction,
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

  function press(action: KeyAction) {
    if (action.type === "equals") {
      submit();
      return;
    }
    playClick();
    dispatch(action);
  }

  return { screen: screenOf(state), press };
}
