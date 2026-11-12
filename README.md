# sumthing

A full-stack calculator: React + TypeScript frontend, Go backend.

## Run locally

Requirements: Go 1.27 and Node 24.

```sh
# API on http://localhost:8080
cd api
go run ./cmd/server

# Web app on http://localhost:5173, in a second terminal
cd web
npm install
cp .env.example .env.local
npm run dev
```

Without `VITE_API_URL`, the dev server uses an in-browser mock of the API, so you can work on the UI alone. A production build needs `VITE_API_URL`.

| Variable | Where | Default |
|---|---|---|
| `PORT` | API | `8080` |
| `ALLOWED_ORIGIN` | API | `http://localhost:5173` |
| `VITE_API_URL` | web | none (the dev mock) |

## Tests

```sh
cd api && go test -cover ./...
cd web && npm test -- --run
```
