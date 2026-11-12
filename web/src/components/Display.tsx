import type { Mode } from "../calculatorState";
import "./Display.css";

const LARGE_TEXT_MAX_LENGTH = 9;
const MEDIUM_TEXT_MAX_LENGTH = 13;

type DisplayProps = {
  expressionLine: string;
  mainLine: string;
  mode: Mode;
};

function mainLineSize(mainLine: string) {
  if (mainLine.length <= LARGE_TEXT_MAX_LENGTH) return "large";
  if (mainLine.length <= MEDIUM_TEXT_MAX_LENGTH) return "medium";
  return "small";
}

export default function Display({
  expressionLine,
  mainLine,
  mode,
}: DisplayProps) {
  const isAnnounced =
    mode === "result" || mode === "error" || mode === "unreachable";

  return (
    <div className="display" data-mode={mode}>
      <p key={expressionLine} className="display-expression">
        <span>{expressionLine}</span>
      </p>
      <p key={mainLine} className="display-main">
        <span data-size={mainLineSize(mainLine)}>{mainLine}</span>
      </p>
      <p
        className="visually-hidden"
        role="status"
        aria-busy={mode === "pending"}
      >
        {isAnnounced ? mainLine : ""}
      </p>
    </div>
  );
}
