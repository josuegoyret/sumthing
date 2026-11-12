# Plan: the React calculator

Status: draft, waiting for Josué's review. No code starts before he approves it.
Spec: `spec.md` in this folder.

## Principles

- **Standard practices first, then small.** Josué reviews, studies and must be able to write this code from memory. Use the well-known frontend patterns (for example, container and presentational components, and focused custom hooks), even when they cost a few lines. Inside those patterns, add no code that is not needed.
- **No comments.** Names carry the meaning.
- **The public repo is brand-neutral.** No company name and no "take-home" in code, docs, metadata, commit messages or UI copy. The design docs say "the brand guidelines".

## Decisions (agreed 2026-11-12)

| # | Decision |
|---|---|
| 1 | Test dev dependencies approved: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, `@vitest/coverage-istanbul` |
| 2 | Mobile: full screen, fluid round keys (4 columns, 16px margins and gaps). Desktop (≥ 640px): a centred 400px card |
| 3 | Header: a **Σ** mark and a small `sumthing` label. Σ is also the favicon. All scaffold metadata is replaced |
| 4 | The last Operator stays selected until the next Number, as on the iPhone |
| 5 | 3 review points: after step 5, step 8 and step 9 |

## Brand parity: tokens vs. the brand guidelines page

I compared `tokens.css` with the brand guidelines page (read 2026-11-12). Fixes for step 1:

| Token | Now | Brand page | Fix |
|---|---|---|---|
| `--radius-full` | 9999px | 999px | Use 999px |
| `--bg-card` | `#2a2140` (invented) | Card fills: Plum Light at 4% | Use the 4% rule |
| `--plum-200`, `--green-deep` | from a second CSS source | Not on the page | Remove. Operators use the brand opacity rules (below). `=` hover uses opacity, not a new colour |
| Line height and tracking | Missing | Given per type token | Add them for the tokens in use |
| `--text-label` (12px, 500, +4%) | Missing | On the page | Add (for the `sumthing` label) |
| `--text-heading-3`, `--text-body-s` etc. | Present | Present | Keep only the tokens in use |

Key variants, using only colours and opacities from the page:

| Variant | Keys | Style |
|---|---|---|
| `default` | digits, `.` | Card fill (Plum Light 4%), Plum Light text |
| `operator` | `+ − × ÷` | Tag fill (Plum Light 12%), Plum Light text. **Selected:** Plum Light fill, Plum Dark text |
| `primary` | `=` | Bold Green fill, Plum Dark text |
| `ghost` | `C`, `⌫` | No fill, secondary text (50%) |

One deliberate difference: the page sets button text to 15px. Calculator keys use heading-3 (26px), because digits at 15px are too small to read on a keypad. The pill shape, the 44px minimum and the colours follow the page.

## Build order

One commit per step. Steps with a seam are test-first (`tdd`).

| # | Step | Seam |
|---|---|---|
| 0 | **Brand-neutral docs.** Done before the plan review: history rewrite of the unpushed commits, and a README commit | — |
| 1 | **Clean scaffold.** Empty `App.tsx` (it renders `Calculator` later), remove `App.css`, `assets/`, `icons.svg`, the Vite README. New `index.html`: title `sumthing`, a description, `theme-color`, the Satoshi stylesheet, the Σ favicon (an SVG path, not a font glyph). Token fixes above. Base CSS. Install the test tools; Vitest config in `vite.config.ts` | — |
| 2 | `displayFormat`: wire symbols → `+ − × ÷`, en-US grouping, on strings | unit |
| 3 | `calculatorState`: the reducer with every input rule and the display flow | reducer tables |
| 4 | `config` + `httpCalculator`: `POST`, status → Outcome, the timeout | stubbed `fetch` |
| 5 | `mockCalculator` + dev-only wiring. The app runs with no backend. **Review point 1** | — |
| 6 | `Key` (variants, `wide`, `selected`, className and native props passed through) and `Keypad` (the grid) | covered by step 7 |
| 7 | `Display` + `Calculator`: `useReducer`, the call on `=`, the live region | UI with a fake client |
| 8 | **Design loop** with `/browse`: screenshots at 390×844 and 1440×900, compared with the iPhone references, `brand.md` and the brand page. Mobile-native fixes. Repeat until they match. **Review point 2** | — |
| 9 | End-to-end run in mock mode, a check that the mock is not in the production bundle, `/code-review`, a diary entry. **Review point 3** | — |

UI states to check in step 8: empty, typing, Operator selected, pending, Result, a long Result that shrinks, a calculation error, unreachable.

## Files at the end

```
web/
  index.html
  public/favicon.svg
  src/
    main.tsx
    App.tsx
    config.ts
    displayFormat.ts          displayFormat.test.ts
    calculatorState.ts        calculatorState.test.ts
    httpCalculator.ts         httpCalculator.test.ts
    mockCalculator.ts
    components/
      Calculator.tsx  Calculator.css  Calculator.test.tsx
      Display.tsx     Display.css
      Keypad.tsx      Keypad.css
      Key.tsx         Key.css
    styles/tokens.css
    styles/base.css
```

## Answered

1. The 7 unpushed commits are rewritten with no company name in the messages or the files. Then they are pushed.
2. `README.md` is fixed in a new commit. The old line stays in the public history (no force push).
3. The diary stays as it is until the polish for submission.
