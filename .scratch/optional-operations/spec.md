# Spec: Power, Square root and Percent

Status: done
Phase: 3, the optional operations.

## Problem Statement

The brief lists three optional operations: exponentiation, square root and percentage. sumthing is an everyday calculator, so these operations must cover everyday use (interest, area, tips) without the edge cases of a scientific calculator. The limits are in ADR 0004.

## Solution

The server grammar gains `^`, `√` and `%`. The keypad gains a row of 4 keys, `√  x²  ^  %`, inside a panel that a `f(x)` toggle opens and closes. All math stays on the server (ADR 0001). The frontend only builds the Expression.

## Screen

```
┌────────────────────────────┐
│                     2+√9   │
│                        5   │
│ [f(x)]                     │  ← toggle: aria-expanded, aria-controls
│ [ √ ] [ x² ] [ ^ ]  [ % ]  │  ← the panel, closed by default
│ [     C     ] [ ⌫ ] [ ÷ ]  │
│ [ 7 ] [ 8 ] [ 9 ]   [ × ]  │
│ [ 4 ] [ 5 ] [ 6 ]   [ − ]  │
│ [ 1 ] [ 2 ] [ 3 ]   [ + ]  │
│ [     0     ] [ . ] [ = ]  │  ← unchanged; the dictation key takes half of 0 later
└────────────────────────────┘
```

- The 4 new keys use the `operator` variant. `^` has the selected state, like the other Operators.
- When the panel opens, the display gets shorter. The keys do not move.
- The toggle follows the shadcn Collapsible structure: a trigger button with `aria-expanded` and `aria-controls`, and a content panel that is hidden when closed. Its accessible name is "More functions".

## Behaviour

The wire format uses `^`, `%` and `√` (U+221A). The display shows the same characters.

| Key | Allowed | Effect |
|---|---|---|
| `√` | where a Number can start: an empty Expression, after an Operator, after a Result or an error (starts fresh) | adds `√`. A second `√` in a row is ignored. |
| `^` | as the other Operators | an Operator. It is ignored if the current term already has a `^` (no chains such as `2^3^2`). |
| `x²` | where `^` is allowed, after a Number | adds `^2` |
| `%` | after a Number that has a digit | adds `%`. A trailing point is dropped first. One `%` per Number. After `%`, digits and `.` are ignored. After a Result, it continues from the Result. |

- An Operator right after a bare `√` is ignored.
- `⌫` removes one character, as today.
- `=` sends when the Expression has an Operator, a `√` or a `%`. So `√9` and `50%` can be sent alone. A trailing Operator, point or bare `√` is dropped before sending, as today.

## API

`POST /v1/calculate` does not change. The grammar grows:

```
Expression := Number (Operator Number)*
Number     := ['-'] ['√'] digits ['.' digits] ['%']
Operator   := '+' | '-' | '*' | '/' | '^'
```

Evaluation:

1. `√` and `%` belong to their Number. `√` is calculated first, then `%`.
2. `^` comes before `×` and `÷`. Chains are invalid (`INVALID_EXPRESSION`).
3. A Percent after `+` or `−` is that percent of the sum on its left: `5+50+10%` = `60.5`. Anywhere else, it is the Number ÷ 100. In a power, it is always the Number ÷ 100.

New errors (both 422, because the Expression is valid but cannot be calculated):

| Code | Message | When |
|---|---|---|
| `EXPONENT_OUT_OF_RANGE` | The exponent must be a whole number from 0 to 99. | `2^0.5`, `2^-3`, `2^100` |
| `RESULT_TOO_LARGE` | The result is too large. | more than 100 digits before the point |

## Implementation Decisions

- **Power:** `big.Int.Exp` on the numerator and on the denominator. It is exact.
- **Square root:** `big.Float.Sqrt` at 512 bits, then `.Rat()`. The grammar puts `√` right before the digits, so `√-4` is an `INVALID_EXPRESSION` and the root never sees a negative Number.
- **Percent:** `Quo` by 100, or the left sum × the Percent ÷ 100.
- **The Result limit** is checked after the calculation. With the ADR 0004 limits, the largest calculation is instant.
- **Frontend:** the input rules go in `calculatorState.ts` as new `KeyAction`s (`squareRoot`, `square`, `percent`; `^` is an `operator`). The toggle is local UI state in the keypad. A pure `x²` helper reuses the `^` and digit rules.

## Testing Decisions

- **`calc`:** table rows for each operation, each error, the precedence (`2×3^2` = 18), Percent after `+`, `−`, `×` and first, `√2×√2` = 2, `9^99` accepted and `99999^99` rejected, and `-√9` = -3.
- **`httpapi`:** one row per new error code.
- **Reducer:** the table above, key by key.
- **UI:** the toggle (`aria-expanded`, the panel hidden and shown), and one full flow: `50 + 10 % =` shows `55`.

## Verification (end to end)

- `curl` every new error and a success for each operation.
- In the browser against the real API: open the panel, type `2+√9`, `1.05^12`, `50+10%`, `5x²`, and check the Results. Take screenshots with the panel open and closed (390×844 and 1280×900) and compare them with `brand.md`.

## Out of Scope

- `±`, parentheses, chains of `^`, decimal or negative Exponents.
- Superscript display of the Exponent.
- Dictation (the next spec).

## Comments

### 2026-11-12: end-to-end check

`go test -cover ./...`: `calc` 98.4%, `httpapi` 97.4%. Web: 116 tests pass.

```
2^10      200 1024          2+√9      200 5             50+10%    200 55
1.05^12   200 1.795856326   √2        200 1.4142135624  5+50+10%  200 60.5
2*3^2     200 18            √2*√2     200 2             50*10%    200 5
2^0.5     422 EXPONENT_OUT_OF_RANGE      99999^99  422 RESULT_TOO_LARGE
2^100     422 EXPONENT_OUT_OF_RANGE      2^3^2     400 INVALID_EXPRESSION
-√9       200 -3                         √-4       400 INVALID_EXPRESSION
```

In the browser against the real API: `2+√9` = 5, `1.05^12` = 1.795856326, `50+10%` = 55, `5x²` = 25, and `2^100` shows the message. Long messages wrap onto 2 lines inside the fixed main line height.
