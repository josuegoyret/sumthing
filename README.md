# [sumthing.ai](https://sumthing-ai.vercel.app) - **Your everyday AI calculator**

![sumthing.ai demo: 1.05 ^ 12, then "fifteen percent of eighty" dictated to 15% × 80 = 12](docs/demo.gif)

## Try it

Open **<https://sumthing-ai.vercel.app>** and tap:

| You want | Type | You get |
|---|---|---|
| The area of your desk, 1.2 m by 0.45 m | `1.2 × 0.45 =` | `0.54` m² |
| An 18% tip on a $48.50 dinner | `calc icon`, then `48.5 + 18 % =` | `57.23` |
| $1,000 after 12 months at 1% a month | `calc icon`, then `1000 × 1.01 ^ 12 =` | `1,126.825030132` |

## Speak to it

Tap the mic key (or press `M`), say "fifteen percent of eighty", and tap again.

- **Two steps, two models:** speech to text (`gpt-4o-mini-transcribe`), then text to an Expression (`gpt-5.4-mini`, structured output).
- **The AI never calculates:** its Expression goes through the same checks as typed input. ([ADR 0005](docs/adr/0005-the-ai-writes-the-expression-never-the-result.md))

## How it works

```
React (Vercel)  ──POST /v1/calculate {"expression":"50+10%"}──▶  Go (Render)
                ◀──────────────── {"result":"55"} ────────────────
```

- **Math on the server:** the browser builds the Expression; the server tokenizes, checks and calculates it with `math/big`. ([ADR 0001](docs/adr/0001-server-evaluates-the-whole-expression.md), [ADR 0002](docs/adr/0002-exact-fractions-with-big-rat.md))
- **For everyday use (not scientific):** Exponent from 0 to 99, Results up to 100 digits. ([ADR 0004](docs/adr/0004-everyday-limits-for-the-optional-operations.md))
- **One pure reducer:** every keypad rule in one place; components only render. Injected API client, faked in tests. ([ADR 0003](docs/adr/0003-inject-the-calculator-client.md))
- **Accessible:** real buttons, visible focus, Results announced to screen readers, reduced motion respected.

## API

```sh
curl -X POST localhost:8080/v1/calculate -d '{"expression":"50+10%"}'
# {"expression":"50+10%","result":"55"}

curl -X POST localhost:8080/v1/calculate -d '{"expression":"5+16+4*5/15"}'
# {"expression":"5+16+4*5/15","result":"22.3333333333"}

curl -X POST localhost:8080/v1/calculate -d '{"expression":"5/0"}'
# 422 {"error":{"code":"DIVISION_BY_ZERO","message":"Can't divide by zero."}}
```

## Run it locally

```sh
docker compose up --build
```

Open <http://localhost:5173>. Without Docker:

```sh
cd api && go run ./cmd/server
cd web && bun install && cp .env.example .env.local && bun run dev
```

| Variable | Where | Default |
|---|---|---|
| `PORT` | API | `8080` |
| `ALLOWED_ORIGIN` | API | `http://localhost:5173` |
| `OPENAI_API_KEY` | API (for Docker: `.env` at the root) | none: the calculator works, and the mic key says "Dictation isn't available." |
| `VITE_API_URL` | web, at build time | required |

## Tests

```sh
cd api && go test -cover ./...   # 69 cases: calc 98.4%, httpapi 53.3%
cd web && bun run coverage       # 96 tests, 63.6% of statements
```

Not covered by decision: dictation, keyboard input and key sounds. Tests are focused on the core calculator. See the [coverage report](docs/coverage.md).

## More

- [Prompts and AI workflow](docs/prompts-and-ai-workflow.md)
- [Glossary](GLOSSARY.md) and [ADRs](docs/adr/)
