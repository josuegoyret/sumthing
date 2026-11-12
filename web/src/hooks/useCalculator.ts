import { useReducer } from "react";
import type { CalculatorClient } from "../calculatorClient";
import {
  type KeyAction,
  initialState,
  nextState,
  screenOf,
  sendableExpression,
} from "../calculatorState";

export function useCalculator(client: CalculatorClient) {
  const [state, dispatch] = useReducer(nextState, initialState);

  async function submit() {
    const expression = sendableExpression(state);
    if (expression === null) return;
    dispatch({ type: "sent", expression });
    const outcome = await client.calculate(expression);
    dispatch({ type: "outcome", outcome });
  }

  function press(action: KeyAction) {
    if (action.type === "equals") {
      submit();
      return;
    }
    dispatch(action);
  }

  return { screen: screenOf(state), press };
}
