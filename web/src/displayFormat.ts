const WIRE_TO_UI_SYMBOL: Record<string, string> = {
  "*": "×",
  "/": "÷",
  "-": "−",
};

const NUMBER = /(\d+)(\.\d*)?/g;
const THOUSANDS_BOUNDARY = /\B(?=(\d{3})+(?!\d))/g;
const WIRE_SYMBOL = /[*/-]/g;

export function toDisplay(wireText: string) {
  return wireText
    .replace(
      NUMBER,
      (_, integer: string, fraction = "") =>
        integer.replace(THOUSANDS_BOUNDARY, ",") + fraction,
    )
    .replace(WIRE_SYMBOL, (symbol) => WIRE_TO_UI_SYMBOL[symbol]);
}
