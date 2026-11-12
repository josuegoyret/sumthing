# sumthing

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Workflow

Every piece of work follows this flow, in order:

1. `/grill-with-docs`: align on the change; update `GLOSSARY.md` and `docs/adr/` inline.
2. `/to-spec`: write the spec to `.scratch/<feature>/spec.md`.
3. `/to-tickets`: split the spec into tracer-bullet tickets in `.scratch/<feature>/issues/`.
4. `/implement <ticket>`: build one ticket test-first (`tdd`, red → green).
5. `/code-review <fixed-point>`: review against the spec and the coding standards, then commit.

Who writes what:

- **Backend (`api/`)**: Josué writes all Go code and tests. The agent gives the spec, test rows, hints and reviews, never finished Go code. During `/implement` on a backend ticket, the agent guides each red → green step and does not commit.
- **Frontend (`web/`)**: the agent writes the code test-first, in small steps. After each step the agent stops without committing. Josué reviews the uncommitted diff, and the agent commits only after he approves it.
- Anything else: ask first.

## Verification

Tests passing is not "done". Every implementation, including every `/implement` ticket, ends with a real end-to-end run:

- **Backend:** start the server (`go run ./cmd/server`) and call every changed endpoint with `curl`, including the error cases. Paste the real responses in the ticket comments.
- **Frontend:** start both dev servers (API and Vite), then use the `/browse` skill to drive the real app in a browser: press the keys, check the display, read the console errors.
- **Design work:** take screenshots (desktop and mobile widths), compare them with the iPhone references in `docs/design/` and the brand rules in `docs/design/brand.md`, fix the gaps, and repeat until the screen matches both. Show the final screenshots to Josué.

## UI components

- Plain CSS with brand design tokens (`web/src/styles/tokens.css`). No Tailwind, so no shadcn/ui install.
- Follow shadcn/ui **patterns**: before you build a token set or a component, look up the matching component or example on <https://ui.shadcn.com/> and copy its structure:
  - composition (small parts that compose, for example `Display` + `Keypad` + `Key`),
  - a `variant` / `size` prop mapped to a class or a `data-variant` attribute (the role of `cva`),
  - `className` pass-through and the native props spread onto the element,
  - semantic tokens (`--bg-card`, `--accent`), never raw hex values, in component CSS.

## Code rules

These rules come first. Where they disagree with the `code-review` smell baseline, these win.

- Use the `GLOSSARY.md` terms in names. Never use its _Avoid_ words.
- No comments. Names, named booleans and named constants carry the meaning; reasons go in an ADR. The only exception is Go doc comments on exported names, as <https://go.dev/doc/comment> requires.
- Name a function for what it returns. If it has a side effect, the name says so.
- No magic numbers or strings: use named constants.
- Return early. Nesting depth is 3 at most.
- Extract a helper only at the third copy. Do not split a small job into many helpers, and do not add layers that only pass a call along.
- Three or more parameters go into a struct or an object.
- Never change an input. No global mutable state.
- Validate everything first, then calculate. Fail fast; no defensive code.
- Never swallow an error. Expected failures are values, not exceptions or panics.
- Avoid regular expressions. Use string methods and loops. If a regex is the only clear way, keep it very short and simple.
- Keep loops linear: no nested passes over the same input, and no copies of it without a need. Create costly objects (for example `Intl` formatters) once, at module level.
- Read env vars only in `api/cmd/server/main.go` and `web/src/config.ts`.
- No new dependency without Josué's approval.
- Tests follow the `tdd` skill.

TypeScript and React:

- `strict`, no `any`, no `as`. Let TypeScript infer return types.
- A `switch` over a union ends with a `never` check.
- Components: one per `PascalCase.tsx` file, default export, components only (`react-refresh`). Other modules: `camelCase.ts`, named exports. Tests sit next to the code.
- Logic lives in pure `.ts` modules. Components only render and dispatch.
- No `useMemo`, `useCallback` or `memo` unless a measurement shows the need.

Go:

- `gofmt` and `go vet` clean.
- `internal/calc` never imports `net/http`. `httpapi` maps errors to status codes in one function.
- Sentinel errors, checked with `errors.Is`. Wrap with `%w`.
- Table-driven tests with `t.Run` and testify.

Git:

- Commit on `main`. Conventional Commits, lowercase and imperative, scope `api`, `web` or `docs`. No AI trailer.
- Code and its docs or ADR change in the same commit.

## Definition of Done

- Tests green. `tsc`, ESLint, `prettier --check` and `go vet` clean.
- The end-to-end verification above is done.
- React 19.3, Vite 8, TypeScript 6 and Go 1.27 are newer than the model's training data. Check the installed docs (`node_modules/<pkg>/`, `go doc`) before you use an API from memory.
