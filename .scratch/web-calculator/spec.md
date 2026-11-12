# Spec: the React calculator

Status: open
Owner: the agent (implements, in small commits). Josué reviews each one.
Phase: 1, requirements only. A plan is written and agreed before the build starts.

## Problem Statement

The app needs an intuitive calculator UI with input validation, error handling and basic mobile support, which uses a backend API for every calculation. The user expects the feel of the iPhone calculator: tap `15 + 6 + 7`, press `=`, and see the Expression move to a small line above while the Result takes the main line, then keep going from the Result. The screen must follow the brand guidelines, not the iPhone's colours. The UI must be built and tested before the Go service exists, and still work with that service the moment it is ready.

## Solution

A single-screen React app. A keypad of round keys builds an Expression. On `=`, the app sends the Expression to the calculator API and shows the Result or a clear error. All input rules sit in one pure reducer. All network rules sit in one API client. The visual design follows `docs/design/brand.md` (brand tokens, Satoshi, Bold Green `=`) and the iPhone references in `docs/design/`. In development, a mock API lets the UI run with no backend. When `VITE_API_URL` is set, the same UI uses the real Go service.

The API contract (request, response, error codes and messages) is defined in `.scratch/api-calculate/spec.md`. This spec does not repeat it.

## Screen

```
┌────────────────────────────┐
│                            │
│           5+16+4×5÷15      │  ← Expression line (body-l, 60%)
│              22.3333333333 │  ← main line (display-l, shrinks to fit)
│                            │
│ [     C     ] [ ⌫ ] [ ÷ ]  │
│ [ 7 ] [ 8 ] [ 9 ]   [ × ]  │
│ [ 4 ] [ 5 ] [ 6 ]   [ − ]  │
│ [ 1 ] [ 2 ] [ 3 ]   [ + ]  │
│ [     0     ] [ . ] [ = ]  │
└────────────────────────────┘
```

- `C` and `0` are wide pill keys that take 2 columns.
- Key variants come from `brand.md`:
  - `default`: digits and `.`,
  - `operator`: `+ − × ÷`, with a selected state for the last Operator typed,
  - `primary`: `=`, in Bold Green,
  - `ghost`: `C` and `⌫`.

## Behaviour

**Display**
- At the start, the main line shows `0`, and the Expression line is empty.
- While typing, the main line shows the Expression with the UI symbols `+ − × ÷` and en-US thousands grouping in each Number (`1,234.5+6`). Grouping is display only, done on strings.
- After a Result, the Expression line shows the Expression that was sent, and the main line shows the Result, grouped (`22,333.3333333333`).
- The main line shrinks from 60px down to 34px to fit. Past that, it wraps.

**Input rules (the reducer)**
- A **digit** is appended. A Number that is only `0` is replaced by the digit (`0` → `7`, `5+0` → `5+7`).
- **`.`** is added to the current Number only if it has none. With no Number yet (at the start or after an Operator), it types `0.`.
- An **Operator** with nothing typed starts from `0` (`0+`). An Operator after an Operator replaces it (`5+` then `×` → `5×`). An Operator after a trailing `.` drops the `.` (`5.` then `+` → `5+`).
- **`⌫`** removes the last character. When the Expression becomes empty, the main line shows `0`.
- **`C`** clears everything.
- **`=`** does nothing if the Expression has no Operator. Otherwise it drops a trailing Operator and a trailing `.`, then sends the Expression.
- At **100 characters** (the wire length), more input is ignored.
- After a **Result**:
  - a digit or `.` starts a new Expression,
  - an Operator continues from the Result (`28` then `+` → `28+`; a negative Result gives `-3+`),
  - `⌫` and `=` do nothing.

**Sending and errors**
- While a request is in progress, the keypad ignores input, and `=` looks disabled.
- The request times out after 5 seconds.
- **Calculation error** (400 or 422): the main line shows the server's `message` in `--danger`. The next digit starts a new Expression, and an Operator starts from `0`.
- **Server unreachable** (network failure or timeout): the main line shows "Can't reach the calculator." The Expression is kept, so `=` tries again, and other keys keep editing it.

## User Stories

1. As a user, I want to see `0` when the app opens, so that I know it is ready.
2. As a user, I want to tap digits and see them on the main line, so that I know what I typed.
3. As a user, I want to tap `+ − × ÷` between Numbers, so that I can build an Expression.
4. As a user, I want `×` and `÷` shown as real symbols, so that the Expression reads like a calculator.
5. As a user, I want to tap `=` and see the Result on the main line, so that I get my answer.
6. As a user, I want the Expression to move to a small line above the Result, so that I can check what was calculated.
7. As a user, I want `2+3×4` to show `14`, so that the calculator follows standard precedence.
8. As a user, I want `0.1+0.2` to show `0.3`, so that I can trust the numbers.
9. As a user, I want long Results grouped with commas (`22,333.33`), so that big numbers are easy to read.
10. As a user, I want to tap an Operator after a Result and continue from it, so that I can chain calculations.
11. As a user, I want to tap a digit after a Result and start fresh, so that I don't have to clear first.
12. As a user, I want a second Operator to replace the first, so that a mis-tap is easy to fix.
13. As a user, I want a second `.` in one Number to be ignored, so that I can't type an invalid Number.
14. As a user, I want `.` with no Number to type `0.`, so that decimals are easy to start.
15. As a user, I want leading zeros removed, so that `007` becomes `7`.
16. As a user, I want `⌫` to remove my last character, so that I can fix a mistake without clearing.
17. As a user, I want `C` to clear everything, so that I can start again.
18. As a user, I want `=` after a trailing Operator to ignore that Operator, so that `5+=` gives `5`.
19. As a user, I want `=` with no Operator to do nothing, so that nothing changes for no reason.
20. As a user, I want input to stop at 100 characters, so that I can't build an Expression the server rejects.
21. As a user, I want `5÷0` to show "Can't divide by zero.", so that I understand the problem.
22. As a user, I want the error shown in the brand error colour, so that it stands out from a Result.
23. As a user, I want my next key after an error to start fresh, so that I don't have to clear the error first.
24. As a user, I want "Can't reach the calculator." when the server is down, so that I know the problem is not my input.
25. As a user, I want my Expression kept when the server is unreachable, so that `=` can try again.
26. As a user, I want `=` disabled while the app waits for the server, so that I don't send the same Expression twice.
27. As a user, I want a timeout after 5 seconds, so that the app never hangs.
28. As a phone user, I want the calculator to fill my screen with large touch targets, so that it is easy to use with one hand.
29. As a phone user, I want taps to respond with no delay, no zoom and no grey flash, so that it feels like a native app.
30. As a desktop user, I want the calculator centred at a phone-like width, so that it looks good on a wide screen.
31. As a screen-reader user, I want every key to have a clear name ("divide", "backspace", "clear"), so that I know what each key does.
32. As a screen-reader user, I want the Result and errors announced, so that I hear the answer.
33. As a keyboard user, I want a visible focus ring on keys, so that I know where I am.
34. As a reviewer, I want the screen to follow the brand guidelines (Plum Dark canvas, Satoshi 400/500, a Bold Green `=`, pill and round keys, the 8pt spacing), so that the app feels like a product of the brand.
35. As a developer, I want the app to run with a mock API when `VITE_API_URL` is not set, so that I can build the UI without the Go service.
36. As a developer, I want the app to use the real API when `VITE_API_URL` is set, so that switching to the backend needs no code change.

## Implementation Decisions

- **Modules:**
  - **`calculatorState`**, a pure reducer `nextState(state, action)`. It is the deep module that holds every input rule and the display flow. It has no React and no `fetch`. Actions are the keys (digit, `.`, Operator, `=`, `C`, `⌫`) plus the request outcomes (Result received, calculation error, unreachable). The state holds the Expression, the Expression line, the main line and a mode (`typing`, `pending`, `result`, `error`, `unreachable`). Each `switch` over actions is exhaustive.
  - **`displayFormat`**: converts the wire Expression to display symbols, and adds thousands grouping to the Numbers in a string. String operations only, never `Number()`.
  - **Calculator client**: one interface, `calculate(expression) → outcome`. The outcome is a union: Result, calculation error (`code`, `message`) or unreachable. There are two implementations:
    - the HTTP client: `fetch` to `${VITE_API_URL}/v1/calculate`, a 5 s `AbortController` timeout, and the mapping from status to outcome;
    - the mock client: development only.
  - **`config`**: the only place that reads `import.meta.env`.
  - **Components:**
    - `Calculator` owns `useReducer`, calls the client on `=`, and dispatches the outcome.
    - `Display` shows the two lines and is the live region.
    - `Keypad` is the layout.
    - `Key` follows the shadcn `Button` pattern: a `variant` prop (`default`, `operator`, `primary`, `ghost`) and a `wide` option, mapped to `data-` attributes, with `className` and the native button props passed through.
- **Mock API:** used when `VITE_API_URL` is not set in development. It may calculate in the browser with plain JavaScript numbers (the one exception in ADR-0001). It returns a calculation error for division by zero, and it waits about 300 ms so the pending state is visible. It is loaded with a dynamic import inside a development-only branch, so it is never in the production bundle. A production build without `VITE_API_URL` fails at startup with a clear message.
- **Styling:** plain CSS that uses only the semantic tokens of `tokens.css`. One CSS file per component. Satoshi 400/500 from Fontshare, loaded in `index.html`. Mobile fixes from the `mobile-native` skill: `100dvh`, `touch-action: manipulation`, no tap highlight, safe-area padding.
- **Dependencies to add** (the stack approved in the planning docs): `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, `@vitest/coverage-istanbul`. The Vitest config goes in `vite.config.ts`.
- Remove the Vite scaffold content (`App.css`, the logos, the counter).

## Testing Decisions

- Tests follow the `tdd` skill: test external behaviour through the seams, never implementation details. The expected values are written by hand.
- **Seam 1, `calculatorState`:** table tests of action sequences → visible state (the main line, the Expression line, the mode). Every input rule and every display rule above has a row.
- **Seam 2, `Calculator` UI:** rendered with Testing Library and a fake client injected through a prop, with explicit outcomes per test. The tests tap keys with `user-event` and assert what the user sees and hears. The cases:
  - the main `15+6+7=` flow,
  - a calculation error,
  - unreachable, then a retry,
  - `=` disabled while pending,
  - the accessible key names.
- **Seam 3, the HTTP client:** `fetch` is stubbed. Each status and failure maps to the right outcome: 200, 400, 422, a network error and the timeout. It also checks that the request is a `POST` with the JSON body.
- The mock client is a development tool. It gets no tests.
- **Coverage:** `vitest run --coverage` with istanbul.

## Verification (end to end)

- Start Vite (mock mode). Drive the app with `/browse`: the main flow, chained Results, each input rule, `5÷0` and the console errors.
- Take screenshots at 390×844 and 1440×900. Compare them with `docs/design/iphone-reference-*.jpeg` and the checklist in `docs/design/brand.md`. Fix the gaps and repeat until both match. Show the final screenshots to Josué.
- When the Go service is ready: start both servers, set `VITE_API_URL`, and repeat the flow against the real API.

## Out of Scope

- `%`, `√`, `^`, `+/-`, parentheses and repeating `=`.
- Physical-keyboard input, key sounds, animations and instant feedback on `=` (follow-ups).
- A cold-start warm-up call (only if the deploy shows a need).
- A history tape, themes other than dark, and locales other than en-US.
- The deploy, the Dockerfile and the README (phase 2).

## Further Notes

- Before the build starts, the agent and Josué write a plan for this spec: the design, the UI/UX and the implementation order.
- Brand authority: the brand guidelines page, summarised in `docs/design/brand.md`. When in doubt, the brand page wins over the iPhone references.

## Comments
