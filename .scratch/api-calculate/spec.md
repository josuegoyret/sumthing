# Spec: the Go calculator service

Status: done
Phase: 1, requirements only.

## Problem Statement

The sumthing frontend needs one trusted place that calculates. A user types an Expression such as `5+16+4×5÷15` and expects the Result that a modern calculator gives (`22.3333333333`), with `×` and `÷` before `+` and `−`. They also expect money-grade correctness: `0.1+0.2` is `0.3`, and `1÷3×3` is `1`. A broken or hostile request (bad JSON, `5++`, `abc`, a division by zero, a very long input) must get a clear, typed error, never a crash, `NaN` or `Infinity`.

## Solution

A small Go service, using only the standard library plus testify for tests. It exposes `POST /v1/calculate`. The frontend sends the whole Expression, and the service tokenizes it, validates it, evaluates it with exact fractions, and returns the Result as a string. All errors use one JSON envelope with a stable `code`. The service also has `GET /healthz` and a CORS layer, so the browser app on another origin can call it.

## API contract

This is the only definition of the contract. The frontend spec links here.

### `POST /v1/calculate`

Request, `Content-Type: application/json`:

```json
{ "expression": "5+16+4*5/15" }
```

Response `200`:

```json
{ "expression": "5+16+4*5/15", "result": "22.3333333333" }
```

- `expression` is echoed exactly as received.
- `result` is a **string**, so no JSON client turns it into a float.

Error response, any non-2xx status:

```json
{ "error": { "code": "DIVISION_BY_ZERO", "message": "Can't divide by zero." } }
```

| Case | Status | `code` | `message` |
|---|---|---|---|
| Body is not JSON, or `expression` is missing or `""` | 400 | `INVALID_REQUEST` | `Send JSON with an expression.` |
| Expression is longer than 100 characters | 400 | `EXPRESSION_TOO_LONG` | `The expression is longer than 100 characters.` |
| Bad syntax (`5++`, `2..3`, `abc`, `--3`, `5+`, `   `) | 400 | `INVALID_EXPRESSION` | `The expression is not valid.` |
| Division by zero, anywhere in the Expression | 422 | `DIVISION_BY_ZERO` | `Can't divide by zero.` |
| Anything unexpected | 500 | `INTERNAL` | `Something went wrong. Try again.` |

400 means "your request is malformed". 422 means "your request is well-formed, but it cannot be calculated". The frontend shows `message` to the user, so messages follow the brand voice: short, calm, no exclamation points.

### `GET /healthz`

`200` with `{ "status": "ok" }`.

### CORS

- The allowed origin comes from the env var `ALLOWED_ORIGIN`. The default is `http://localhost:5173`.
- Every response sets `Access-Control-Allow-Origin` to that origin.
- An `OPTIONS` preflight also gets `Access-Control-Allow-Methods: POST` and `Access-Control-Allow-Headers: Content-Type`, and returns `204` with no body.

## Expression grammar

- **Operators:** `+`, `-`, `*`, `/` (ASCII on the wire; the UI shows `+ − × ÷`).
- **Number:** one or more digits, optionally followed by `.` and one or more digits. `5`, `0.5`, `007` are valid. `.5`, `5.` and `2..3` are not; the frontend always sends a complete Number.
- **Negative Number:** a `-` is part of the Number when it is the first character or directly follows an Operator. `-3+1`, `2*-3` and `5--3` (= 8) are valid. `--3` and `5---3` are not.
- **Shape:** Number, then any number of (Operator, Number) pairs. The Expression starts and ends with a Number.
- **Spaces** between tokens are ignored, so `2 + 3` from `curl` works. An Expression of only spaces is `INVALID_EXPRESSION`.
- **Precedence:** `*` and `/` before `+` and `-`; left to right within a level. `1/3*3` is `(1/3)*3`.

## Result format

- The calculation is exact (`math/big.Rat`). Rounding happens once, at the end.
- At most 10 decimal places, rounded half away from zero.
- Trailing zeros are removed, and a trailing `.` too: `2.5000000000` → `2.5`, `5.0000000000` → `5`.
- No negative zero: a Result that rounds to zero is `0`, never `-0`.

## User Stories

1. As a calculator user, I want `2+3` to return `5`, so that basic addition works.
2. As a calculator user, I want `9-12` to return `-3`, so that subtraction can go below zero.
3. As a calculator user, I want `4*2.5` to return `10`, so that multiplication with decimals works.
4. As a calculator user, I want `10/4` to return `2.5`, so that division gives a decimal Result.
5. As a calculator user, I want `2+3*4` to return `14`, so that `×` binds before `+`, like a modern calculator.
6. As a calculator user, I want `5+16+4*5/15` to return `22.3333333333`, so that a long Expression follows precedence left to right.
7. As a calculator user, I want `0.1+0.2` to return `0.3`, so that I never see floating-point noise.
8. As a calculator user, I want `1/3*3` to return `1`, so that intermediate values are not rounded.
9. As a calculator user, I want `10/3` to return `3.3333333333`, so that a never-ending decimal stops at a readable length.
10. As a calculator user, I want `2/3` to return `0.6666666667`, so that the last place is rounded, not cut.
11. As a calculator user, I want `5.50*2` to return `11`, so that trailing zeros never show.
12. As a calculator user, I want `-3+1` to return `-2`, so that I can keep calculating from a negative Result.
13. As a calculator user, I want `2*-3` to return `-6`, so that a negative Number after an Operator works.
14. As a calculator user, I want `5/0` to return a clear "Can't divide by zero." error, so that I understand what went wrong.
15. As a calculator user, I want `1+2/0*3` to return the same division error, so that a zero divisor anywhere is caught.
16. As a calculator user, I want `0/5` to return `0`, so that zero as a dividend is fine.
17. As an API client, I want an invalid Expression (`5++`, `abc`, `5+`) to return 400 `INVALID_EXPRESSION`, so that I can tell a syntax problem from a math problem.
18. As an API client, I want a body that is not JSON to return 400 `INVALID_REQUEST`, so that I know the request itself is wrong.
19. As an API client, I want a missing or empty `expression` to return 400 `INVALID_REQUEST`, so that I know what field to send.
20. As an API client, I want an Expression over 100 characters to return 400 `EXPRESSION_TOO_LONG`, so that the limit is explicit, not a silent failure.
21. As an API client, I want every error to have the same `{error: {code, message}}` shape, so that I handle errors in one place.
22. As an API client, I want the Result as a JSON string, so that my JSON parser never turns it into an inexact float.
23. As an API client, I want the response to echo my Expression, so that I can match a Result to its request.
24. As an API client, I want `2 + 3` with spaces to work, so that hand-written `curl` calls are easy.
25. As the browser app on `localhost:5173`, I want CORS headers on every response, so that the browser lets me read the Result.
26. As the browser app, I want the `OPTIONS` preflight to return 204 with the allowed method and header, so that my JSON `POST` is allowed.
27. As an operator of the service, I want `GET /healthz` to return 200, so that a host can check the service is up.
28. As an operator of the service, I want the port to come from `PORT` (default 8080), so that any host can run it.
29. As a developer, I want `go run ./cmd/server` to start the service with no setup, so that local development is one command.
30. As a developer, I want `go test ./... -cover` to run all tests and print coverage, so that the coverage report is one command.
31. As a reviewer, I want arithmetic in a package with no HTTP code, so that I can read and test the math alone.
32. As a reviewer, I want status-code mapping in one function, so that I can check every error path in one place.

## Implementation Decisions

- **Deep module `calc`**, one public entry point: `Calculate(expression) → (result string, error)`. It owns length validation, tokenizing, shape validation, evaluation and formatting. Its exported errors are sentinels: `ErrExpressionTooLong`, `ErrInvalidExpression`, `ErrDivisionByZero`. It never imports `net/http`.
- **Inside `calc`** (internal, not exported):
  - A tokenizer turns the string into Tokens (Number, Operator). It skips spaces and folds a unary `-` into the Number.
  - The shape check verifies that Number and Operator alternate, and that the Expression starts and ends with a Number.
  - The evaluator uses the LeetCode 227 one-stack pattern on `*big.Rat`: on `+` push the Number, on `-` push its negation, on `*` or `/` pop, combine and push. The Result is the sum of the stack. Check for a zero divisor before `Quo`, because `Quo` panics on zero.
  - The formatter: `FloatString(10)`, then remove trailing zeros, the trailing `.` and negative zero.
- **Module `httpapi`**:
  - the `POST /v1/calculate` and `GET /healthz` handlers,
  - the CORS middleware,
  - one function that maps a `calc` error to (status, code, message). An unknown error becomes 500 `INTERNAL`.
  - It decodes JSON, rejects a missing or empty `expression`, calls `calc.Calculate` and writes JSON.
- **`cmd/server`**: reads `PORT` and `ALLOWED_ORIGIN` (the only place env vars are read), builds a Go 1.22+ `ServeMux` with method patterns, wraps it in the CORS middleware, and starts the server. A wrong method on a known path gets the mux's default 405. An unknown path gets its default 404. Neither uses the error envelope.
- **Dependencies:** standard library only, plus `github.com/stretchr/testify` for tests.
- **Constants:** the maximum length (100), the decimal places (10), the default port and the default origin are named constants.
- Related decisions: ADR-0001 (the server evaluates the whole Expression) and ADR-0002 (exact fractions, rounded once).

## Testing Decisions

- Test only through the two seams. Never test the tokenizer, the evaluator or the formatter directly. Build them one by one, each driven by a new `Calculate` test row (`"5"`, `"2+3"`, `"2+3*4"`, …), following the `tdd` skill.
- **Seam 1, `calc.Calculate`:** a table-driven test with `t.Run` and one plain-English name per row. The expected values are calculated by hand. The rows include at least:
  - every user story from 1 to 16 (each Operator, precedence, exact decimals, rounding, trailing zeros, negatives, zero as a dividend, division by zero),
  - invalid shapes: `""` (spaces only), `5+`, `+5`, `5++3`, `2..3`, `.5`, `5.`, `abc`, `--3`, `5---3`,
  - the length limit: exactly 100 characters (valid) and 101 (`ErrExpressionTooLong`),
  - negative zero: `-1*0` → `0`, and `-0.00000000001` → `0`.
  - Error rows check with `errors.Is`, not with the message text.
- **Seam 2, `httpapi` through `httptest`:**
  - one success case (status, `Content-Type`, the body with the echoed Expression and the string Result),
  - each error status and its envelope (400 ×3 codes, 422),
  - the 500 `INTERNAL` path (a `calc` error that is not a sentinel), if it can be reached without a test-only hook; otherwise test the mapping function directly,
  - the CORS header on a normal response, and the `OPTIONS` preflight (204, the headers),
  - `GET /healthz`.
- **Prior art:** an earlier Go exercise: a stdlib endpoint, `httptest` and table tests.
- **Coverage:** `go test ./... -coverprofile=coverage.out`, then `go tool cover -func=coverage.out` for the summary.

## Verification (end to end)

Start the service with `go run ./cmd/server`. Then call it with `curl`: one success, each error code, an `OPTIONS` preflight and `/healthz`. Paste the real responses into the Comments of this spec.

## Out of Scope

- `%`, `√`, `^` and parentheses. If parentheses arrive later, the evaluator changes to recursion or two stacks.
- A body size limit, `DisallowUnknownFields` and server timeouts. They go in the README under "What I would do next".
- A Dockerfile, docker-compose and the deploy (phase 2).
- Logging beyond one startup line. Rate limiting, auth, persistence.
- Locales other than `.` as the decimal separator.

## Further Notes

- Warm up first: solve LeetCode 227 (Basic Calculator II) in Go with `int`, then move the same loop to `*big.Rat` on Tokens.
- Build order: `calc` (driven by `Calculate` rows), then the `httpapi` handlers, CORS and the error mapping, then `cmd/server`.

## Comments

### 2026-11-12: end-to-end check

`go test -cover ./...`: `calc` 97.4%, `httpapi` 97.2%. `gofmt` and `go vet` are clean.

```
GET  /healthz                              200 {"status":"ok"}
POST {"expression":"5+16+4*5/15"}          200 {"expression":"5+16+4*5/15","result":"22.3333333333"}
POST {"expression":"12345678*987654321"}   200 {"expression":"12345678*987654321","result":"12193262222374638"}
POST {"expression":"0.1+0.2"}              200 {"expression":"0.1+0.2","result":"0.3"}
POST {"expression":"5/0"}                  422 {"error":{"code":"DIVISION_BY_ZERO","message":"Can't divide by zero."}}
POST {"expression":"5++3"}                 400 {"error":{"code":"INVALID_EXPRESSION","message":"The expression is not valid."}}
POST nope                                  400 {"error":{"code":"INVALID_REQUEST","message":"Send JSON with an expression."}}
POST {}                                    400 {"error":{"code":"INVALID_REQUEST","message":"Send JSON with an expression."}}
POST 101 characters                        400 {"error":{"code":"EXPRESSION_TOO_LONG","message":"The expression is longer than 100 characters."}}
OPTIONS /v1/calculate                      204 Allow-Origin, Allow-Methods: POST, Allow-Headers: Content-Type
GET  /v1/calculate                         405 Allow: POST
```

Every response has `Access-Control-Allow-Origin`. The web app against this API: `12,345,678×987,654,321+5` = `12,193,262,222,374,643` (exact; the float mock gave `…600`), `0.1+0.2` = `0.3`, `5÷0` shows the message, and a stopped API shows "Can't reach the calculator."
