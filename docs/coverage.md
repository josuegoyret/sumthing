# Coverage report

Run on 2026-11-13, at commit `2d687a5`. Go: 69 test cases. Web: 96 tests.

## How to run it

```sh
cd api && go test -coverprofile=coverage.out ./... && go tool cover -func=coverage.out
cd web && bun run coverage
```

## Go (statements)

| Package | Coverage | Notes |
|---|---|---|
| `internal/calc` | 98.4% | Every function at 100%, except `readNumber` (96.2%) and `hasValidShape` (90.0%) |
| `internal/httpapi` | 53.3% | `calculate`, `healthz` and CORS at 100%. `dictateHandler` at 3.6% |
| `internal/dictation` | 0.0% | Not tested, by decision |
| `cmd/server` | 0.0% | Wiring only: reads env vars and starts the server |

## Web (istanbul)

| File | Statements | Branches |
|---|---|---|
| `calculatorState.ts` | 97.9% | 97.0% |
| `displayFormat.ts` | 100% | 100% |
| `keyboardShortcuts.ts` | 94.4% | 100% |
| `httpCalculator.ts` | 58.6% | 33.3% |
| `keySounds.ts` | 83.3% | 100% |
| `microphone.ts` | 10.8% | 100% |
| `components/Keypad.tsx` | 93.3% | 87.5% |
| `components/Display.tsx` | 88.9% | 88.9% |
| `components/Calculator.tsx` | 75.0% | 50.0% |
| `components/MicKey.tsx` | 75.0% | 64.3% |
| `components/DictationBanner.tsx` | 70.0% | 37.5% |
| `components/MuteToggle.tsx` | 0% | 0% |
| `hooks/useCalculator.ts` | 77.8% | 83.3% |
| `hooks/useKeyboardShortcuts.ts` | 54.2% | 0% |
| `hooks/useDictation.ts` | 20.0% | 0% |
| `App.tsx`, `main.tsx`, `config.ts` | 0% | — |
| **All files** | **63.6%** | **74.1%** |

## Not covered, by decision

The tests focus on the core: the calculation rules, the keypad rules, and the flow from a key press to the Result.

- **Dictation** (`internal/dictation`, `dictateHandler`, `useDictation`, `microphone`, `MicKey`, `DictationBanner`, `httpCalculator.dictate`): the quality of the AI needs evals, not unit tests. The AI never calculates, and its Expression goes through the same checks as typed input ([ADR 0005](adr/0005-the-ai-writes-the-expression-never-the-result.md)). The flow is checked end to end in a real browser.
- **Keyboard input and key sounds** (`useKeyboardShortcuts`, `keySounds`, `MuteToggle`): accessory features.
- **Wiring** (`cmd/server`, `main.tsx`, `App.tsx`, `config.ts`): checked by the end-to-end runs.
