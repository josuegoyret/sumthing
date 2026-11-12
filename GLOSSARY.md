# sumthing

A calculator with a React frontend and a Go backend. The user types an Expression on a keypad; the backend evaluates it and returns an exact Result.

## Language

**Expression**:
The sequence of Numbers and Operators that the user enters, such as `5+16+4×5÷15`.
_Avoid_: formula, equation, input, calculation

**Number**:
A decimal value inside an Expression, such as `16`, `0.5` or `-3`. A minus sign directly before a Number belongs to the Number; it is not an Operator.
_Avoid_: operand, digit, value

**Operator**:
One of `+`, `−`, `×`, `÷`, placed between two Numbers.
_Avoid_: operation, sign, symbol

**Result**:
The exact decimal value of an Expression.
_Avoid_: answer, total, output
