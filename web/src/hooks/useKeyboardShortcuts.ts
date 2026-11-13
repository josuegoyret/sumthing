import { useEffect, useEffectEvent, useState } from "react";
import type { KeyAction } from "../calculatorState";
import { keyActionFor, keyActionId } from "../keyboardShortcuts";

export function useKeyboardShortcuts(onPress: (action: KeyAction) => void) {
  const [heldKeyId, setHeldKeyId] = useState<string | null>(null);

  const pressShortcut = useEffectEvent((event: KeyboardEvent) => {
    const hasModifier = event.ctrlKey || event.metaKey || event.altKey;
    if (hasModifier) return;
    const action = keyActionFor(event.key);
    if (action === undefined) return;
    event.preventDefault();
    setHeldKeyId(keyActionId(action));
    onPress(action);
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => pressShortcut(event);
    const release = () => setHeldKeyId(null);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", release);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", release);
      window.removeEventListener("blur", release);
    };
  }, []);

  return heldKeyId;
}
