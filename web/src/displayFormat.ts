const UI_SYMBOLS: Record<string, string> = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
  "^": "^",
  "√": "√",
  "%": "%",
};

const thousandsFormat = new Intl.NumberFormat("en-US");

function withThousands(number: string) {
  if (number === "") return "";
  const [integer, fraction] = number.split(".");
  const grouped = thousandsFormat.format(BigInt(integer));
  return fraction === undefined ? grouped : `${grouped}.${fraction}`;
}

export function toDisplay(wireText: string) {
  let shown = "";
  let number = "";

  for (const character of wireText) {
    const symbol = UI_SYMBOLS[character];
    if (symbol === undefined) {
      number += character;
    } else {
      shown += withThousands(number) + symbol;
      number = "";
    }
  }

  return shown + withThousands(number);
}
