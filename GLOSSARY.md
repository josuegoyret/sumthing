# sumthing

A calculator with a React frontend and a Go backend. The user types an Expression on a keypad; the backend evaluates it and returns an exact Result.

## Language

**Expression**:
The sequence of Numbers and Operators that the user enters, such as `5+16+4×5÷15`.
_Avoid_: formula, equation, input, calculation

**Number**:
A decimal value inside an Expression, such as `16`, `0.5`, `-3`, `√9` or `10%`. A minus sign directly before a Number belongs to the Number; it is not an Operator. A Square root or a Percent belongs to its Number too.
_Avoid_: operand, digit, value

**Operator**:
One of `+`, `−`, `×`, `÷` or `^` (power), placed between two Numbers. `^` comes before `×` and `÷`, and its right side is the Exponent.
_Avoid_: operation, sign, symbol

**Result**:
The exact decimal value of an Expression. A Square root makes it approximate, but still correct to every decimal place that is shown.
_Avoid_: answer, total, output

**Exponent**:
The Number on the right of `^`. It must be a whole number from 0 to 99.
_Avoid_: power, index

**Square root**:
`√` written before a Number, such as `√9`. It applies to that Number only, and the Number must not be negative.
_Avoid_: root, radical, sqrt

**Percent**:
`%` written after a Number. After `+` or `−`, it means that percent of everything on the left: `50+10%` is `55`. Anywhere else, it divides the Number by 100: `50×10%` is `5`.
_Avoid_: percentage, pct
