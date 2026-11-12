# The server evaluates the whole Expression

The keypad behaves like the iPhone calculator: the user types a full Expression such as `5+16+4×5÷15`, and `=` shows the Result with `×` and `÷` applied before `+` and `−`. To keep the server the only place where math happens, the frontend sends the whole Expression in one request, and the Go service tokenizes, validates and evaluates it. This decision is led by the UX, not by the API: the wording "endpoints for calculator operations" suggests one operation per request, and we deliberately chose otherwise.

## Considered Options

- **One binary operation per request** (`{operation, a, b}`). Matches a literal reading of the requirements, but operator precedence would then live in the frontend (it must decide which pair to send first), so the math would be split across the boundary.
- **Parse and evaluate in the browser, server only checks.** Fastest UX, but the server stops being the source of truth for the Result, which is the wrong habit for a payments company.
- **Whole Expression to the server** (chosen). One request per `=`, all math and precedence in one tested Go package.

## Consequences

- The Go service needs a tokenizer, a validation step and an evaluator with precedence. This is the largest piece of backend code, and it is written by hand (no `eval`, no expression library).
- The evaluator uses the one-stack pattern of LeetCode 227 (Basic Calculator II): `×` and `÷` are applied as soon as they are read, and `+` and `−` wait for the final sum. Recursive descent was considered. It is more code, and it is only necessary for parentheses, which are not in scope. The tokenizer folds a leading or post-Operator `-` into the Number, so the evaluator never sees a unary minus.
- The API takes an Expression string, not typed operands, so input validation is syntax validation.
- The frontend only builds the Expression string and displays the Result; it holds no arithmetic.
- One exception: a development-only mock API may calculate in the browser with plain JavaScript numbers, so the UI can be built and tested before the Go service exists. It is never part of the production bundle, and the real app always gets the Result from the server.
