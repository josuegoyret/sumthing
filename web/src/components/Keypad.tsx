import type { ComponentProps } from "react";
import type { KeyAction, Operator } from "../calculatorState";
import Key from "./Key";
import "./Keypad.css";

type KeyDefinition = {
  label: string;
  action: KeyAction;
  name?: string;
  variant?: ComponentProps<typeof Key>["variant"];
  size?: ComponentProps<typeof Key>["size"];
};

function digit(value: string, size?: KeyDefinition["size"]): KeyDefinition {
  return { label: value, action: { type: "digit", digit: value }, size };
}

function operator(label: string, value: Operator, name: string): KeyDefinition {
  return {
    label,
    name,
    action: { type: "operator", operator: value },
    variant: "operator",
  };
}

const KEYS: KeyDefinition[] = [
  {
    label: "C",
    name: "clear",
    action: { type: "clear" },
    variant: "secondary",
    size: "wide",
  },
  {
    label: "⌫",
    name: "backspace",
    action: { type: "backspace" },
    variant: "secondary",
  },
  operator("÷", "/", "divide"),
  digit("7"),
  digit("8"),
  digit("9"),
  operator("×", "*", "multiply"),
  digit("4"),
  digit("5"),
  digit("6"),
  operator("−", "-", "minus"),
  digit("1"),
  digit("2"),
  digit("3"),
  operator("+", "+", "plus"),
  digit("0", "wide"),
  { label: ".", name: "point", action: { type: "point" } },
  {
    label: "=",
    name: "equals",
    action: { type: "equals" },
    variant: "primary",
  },
];

type KeypadProps = {
  selectedOperator: Operator | null;
  isPending: boolean;
  onPress: (action: KeyAction) => void;
};

export default function Keypad({
  selectedOperator,
  isPending,
  onPress,
}: KeypadProps) {
  return (
    <div className="keypad" role="group" aria-label="Keypad">
      {KEYS.map(({ label, action, name, variant, size }) => (
        <Key
          key={label}
          variant={variant}
          size={size}
          aria-label={name}
          aria-pressed={
            action.type === "operator"
              ? action.operator === selectedOperator
              : undefined
          }
          aria-disabled={
            isPending && action.type === "equals" ? true : undefined
          }
          onClick={() => onPress(action)}
        >
          {label}
        </Key>
      ))}
    </div>
  );
}
