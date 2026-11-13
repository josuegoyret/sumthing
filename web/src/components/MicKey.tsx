import { LoaderCircle, Mic } from "lucide-react";
import type { DictationStatus } from "../hooks/useDictation";
import Key from "./Key";
import "./MicKey.css";

const BAR_WEIGHTS = [0.5, 0.8, 1, 0.8, 0.5];
const MIN_BAR_SCALE = 0.15;

type MicKeyProps = {
  status: DictationStatus;
  level: number;
  shortcuts: string | undefined;
  isHeld: boolean;
  onPress: () => void;
};

function labelOf(status: DictationStatus) {
  if (status === "recording") return "stop dictation";
  return "dictate";
}

export default function MicKey({
  status,
  level,
  shortcuts,
  isHeld,
  onPress,
}: MicKeyProps) {
  const isBusy = status === "starting" || status === "processing";

  return (
    <Key
      variant="primary"
      className="mic-key"
      aria-label={labelOf(status)}
      aria-keyshortcuts={shortcuts}
      aria-disabled={isBusy ? true : undefined}
      aria-busy={isBusy}
      data-held={isHeld ? true : undefined}
      data-status={status}
      onClick={onPress}
    >
      {status === "idle" && <Mic />}
      {isBusy && <LoaderCircle className="mic-key-spinner" />}
      {status === "recording" && (
        <span className="mic-key-meter" aria-hidden="true">
          {BAR_WEIGHTS.map((weight, index) => (
            <span
              key={index}
              className="mic-key-bar"
              style={{
                transform: `scaleY(${Math.max(MIN_BAR_SCALE, level * weight)})`,
              }}
            />
          ))}
        </span>
      )}
    </Key>
  );
}
