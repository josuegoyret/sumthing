import { useEffect, useReducer } from "react";
import type { CalculatorClient } from "../calculatorClient";
import { initialState, nextState, screenOf } from "../calculatorState";

export function useCalculator(client: CalculatorClient) {
  const [state, dispatch] = useReducer(nextState, initialState);
  const { mode, expression } = state;

  useEffect(() => {
    if (mode !== "pending") return;

    let isCurrent = true;
    client.calculate(expression).then((outcome) => {
      if (isCurrent) dispatch({ type: "outcome", outcome });
    });

    return () => {
      isCurrent = false;
    };
  }, [client, mode, expression]);

  return { screen: screenOf(state), press: dispatch };
}
