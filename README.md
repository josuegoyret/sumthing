# [sumthing.ai](https://sumthing-ai.vercel.app) - **Your everyday AI calculator**

![sumthing.ai in use: 0.1 + 0.2 = 0.3, a Percent, and a long Result](docs/demo.gif)

## Try it in one minute

Open **<https://sumthing-ai.vercel.app>** and tap:

| Type | You get | Note |
|---|---|---|
| `0.1 + 0.2 =` | `0.3` | Exact fractions |
| `5 + 16 + 4 × 5 ÷ 15 =` | `22.3333333333` | Precedence: `×` and `÷` first |
| `f(x)`, then `50 + 10 % =` | `55` | Tip: Percent of the left side |
| `1.05 ^ 12 =` | `1.795856326` | 12 months at 5% |
| `85 ^ 8 =`, then swipe the Result | `2,724,905,250,390,625` | Long Results scroll |
| `5 ÷ 0 =` | "Can't divide by zero." | Clear error messages |

## How it works

```
React (Vercel)  ──POST /v1/calculate {"expression":"50+10%"}──▶  Go (Render)
                ◀──────────────── {"result":"55"} ────────────────
```

- **Math on the server:** the browser builds the Expression; the server tokenizes, checks and calculates it with `math/big`. ([ADR 0001](docs/adr/0001-server-evaluates-the-whole-expression.md), [ADR 0002](docs/adr/0002-exact-fractions-with-big-rat.md))
- **Everyday limits, not scientific:** Exponent from 0 to 99, Results up to 100 digits. ([ADR 0004](docs/adr/0004-everyday-limits-for-the-optional-operations.md))
- **One pure reducer:** every keypad rule in one place; components only render. Injected API client, faked in tests. ([ADR 0003](docs/adr/0003-inject-the-calculator-client.md))
- **Accessible:** real buttons, visible focus, Results announced to screen readers, reduced motion respected.

## API

`POST /v1/calculate` with `{"expression": "5+16+4*5/15"}` returns `{"expression": "5+16+4*5/15", "result": "22.3333333333"}`.

| Status | `code` | When |
|---|---|---|
| 400 | `INVALID_REQUEST` | not JSON, no `expression`, or extra data |
| 400 | `INVALID_EXPRESSION` | `5++3`, `abc`, `2^3^2` |
| 400 | `EXPRESSION_TOO_LONG` | more than 100 characters |
| 422 | `DIVISION_BY_ZERO` | `5/0` |
| 422 | `EXPONENT_OUT_OF_RANGE` | `2^0.5`, `2^100` |
| 422 | `RESULT_TOO_LARGE` | more than 100 digits before the point |

Error shape: `{"error": {"code": "DIVISION_BY_ZERO", "message": "Can't divide by zero."}}`. Health check: `GET /healthz` returns 200.

## Run it locally

```sh
docker compose up --build
```

Open <http://localhost:5173>. Web app with hot reload:

```sh
docker compose up -d --build api
cd web && bun install && cp .env.example .env.local && bun run dev
```

| Variable | Where | Default |
|---|---|---|
| `PORT` | API | `8080` |
| `ALLOWED_ORIGIN` | API | `http://localhost:5173` |
| `VITE_API_URL` | web, at build time | required |

## Tests

```sh
cd api && go test -cover ./...   # 69 cases: calc 98.4%, httpapi 53.3%
cd web && bun run coverage       # 96 tests, 63.6% of statements
```

Not covered by decision: dictation, keyboard input and key sounds. Tests are focused on the core calculator. See the [coverage report](docs/coverage.md).
