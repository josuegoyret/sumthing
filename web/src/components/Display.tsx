import type { ReactNode } from "react";
import type { Mode } from "../calculatorState";
import "./Display.css";

const LARGE_TEXT_MAX_LENGTH = 9;
const MEDIUM_TEXT_MAX_LENGTH = 13;
const UI_OPERATORS = ["+", "−", "×", "÷"];

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

function withBreaksAfterOperators(text: string) {
  const parts: ReactNode[] = [];
  let segment = "";

  for (const character of text) {
    segment += character;
    if (UI_OPERATORS.includes(character)) {
      parts.push(segment, <wbr key={parts.length} />);
      segment = "";
    }
  }

  parts.push(segment);
  return parts;
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
      <p className="display-expression">
        {withBreaksAfterOperators(expressionLine)}
      </p>
      <p className="display-main" data-size={mainLineSize(mainLine)}>
        {withBreaksAfterOperators(mainLine)}
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
