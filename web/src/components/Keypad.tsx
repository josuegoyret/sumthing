import { CalculatorIcon } from "lucide-react";
import { type ComponentProps, useId, useState } from "react";
import type { KeyAction, Operator } from "../calculatorState";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { keyActionId, shortcutsFor } from "../keyboardShortcuts";
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

const EDIT_KEYS: KeyDefinition[] = [
  {
    label: "C",
    name: "clear",
    action: { type: "clear" },
    variant: "secondary",
  },
  {
    label: "⌫",
    name: "backspace",
    action: { type: "backspace" },
    variant: "secondary",
  },
];

const KEYS: KeyDefinition[] = [
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

const FUNCTION_KEYS: KeyDefinition[] = [
  {
    label: "√",
    name: "square root",
    action: { type: "squareRoot" },
    variant: "operator",
  },
  {
    label: "x²",
    name: "square",
    action: { type: "square" },
    variant: "operator",
  },
  operator("^", "^", "power"),
  {
    label: "%",
    name: "percent",
    action: { type: "percent" },
    variant: "operator",
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
  const [areFunctionsOpen, setAreFunctionsOpen] = useState(false);
  const functionsId = useId();
  const heldKeyId = useKeyboardShortcuts(onPress);

  function keyFor({ label, action, name, variant, size }: KeyDefinition) {
    return (
      <Key
        key={label}
        variant={variant}
        size={size}
        aria-label={name}
        aria-keyshortcuts={shortcutsFor(action)}
        data-held={keyActionId(action) === heldKeyId ? true : undefined}
        aria-pressed={
          action.type === "operator"
            ? action.operator === selectedOperator
            : undefined
        }
        aria-disabled={isPending && action.type === "equals" ? true : undefined}
        onClick={() => onPress(action)}
      >
        {label}
      </Key>
    );
  }

  return (
    <div className="keypad" role="group" aria-label="Keypad">
      <div
        id={functionsId}
        className="keypad-functions"
        hidden={!areFunctionsOpen}
      >
        {FUNCTION_KEYS.map(keyFor)}
      </div>
      <div className="keypad-grid">
        {EDIT_KEYS.map(keyFor)}
        <Key
          variant="secondary"
          aria-label="More functions"
          aria-expanded={areFunctionsOpen}
          aria-controls={functionsId}
          onClick={() => setAreFunctionsOpen(!areFunctionsOpen)}
        >
          <CalculatorIcon />
        </Key>
        {KEYS.map(keyFor)}
      </div>
    </div>
  );
}
