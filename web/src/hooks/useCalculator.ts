import { useReducer } from "react";
import type { CalculatorClient } from "../calculatorClient";
import {
  type KeyAction,
  initialState,
  nextState,
  screenOf,
} from "../calculatorState";

export function useCalculator(client: CalculatorClient) {
  const [state, dispatch] = useReducer(nextState, initialState);

  function press(action: KeyAction) {
    const next = nextState(state, action);
    dispatch(action);
    if (next.mode === "pending" && state.mode !== "pending") {
      client
        .calculate(next.expression)
        .then((outcome) => dispatch({ type: "outcome", outcome }));
    }
  }

  return { screen: screenOf(state), press };
}
