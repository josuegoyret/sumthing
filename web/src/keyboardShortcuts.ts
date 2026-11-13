import type { KeyAction } from "./calculatorState";

type Shortcut = { keys: string[]; action: KeyAction };

const DIGITS = "0123456789";
const PLUS_KEY = "+";
const PLUS_KEY_NAME = "Plus";

const SHORTCUTS: Shortcut[] = [
  ...[...DIGITS].map((digit): Shortcut => ({
    keys: [digit],
    action: { type: "digit", digit },
  })),
  { keys: [".", ","], action: { type: "point" } },
  { keys: ["+"], action: { type: "operator", operator: "+" } },
  { keys: ["-"], action: { type: "operator", operator: "-" } },
  { keys: ["*", "x"], action: { type: "operator", operator: "*" } },
  { keys: ["/"], action: { type: "operator", operator: "/" } },
  { keys: ["^"], action: { type: "operator", operator: "^" } },
  { keys: ["%"], action: { type: "percent" } },
  { keys: ["r"], action: { type: "squareRoot" } },
  { keys: ["Enter", "="], action: { type: "equals" } },
  { keys: ["Backspace"], action: { type: "backspace" } },
  { keys: ["Escape", "Delete"], action: { type: "clear" } },
];

export function keyActionId(action: KeyAction) {
  if (action.type === "digit") return `${action.type}:${action.digit}`;
  if (action.type === "operator") return `${action.type}:${action.operator}`;
  return action.type;
}

function ariaKeyName(key: string) {
  return key === PLUS_KEY ? PLUS_KEY_NAME : key;
}

const ACTION_BY_KEY = new Map(
  SHORTCUTS.flatMap(({ keys, action }) =>
    keys.map((key): [string, KeyAction] => [key, action]),
  ),
);

const SHORTCUTS_BY_ACTION_ID = new Map(
  SHORTCUTS.map(({ keys, action }) => [
    keyActionId(action),
    keys.map(ariaKeyName).join(" "),
  ]),
);

export function keyActionFor(key: string) {
  return ACTION_BY_KEY.get(key);
}

export function shortcutsFor(action: KeyAction) {
  return SHORTCUTS_BY_ACTION_ID.get(keyActionId(action));
}
