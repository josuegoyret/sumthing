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

The web app needs `VITE_API_URL` in development and in production. Without it, the app stops at start with a clear message.

| Variable | Where | Default |
|---|---|---|
| `PORT` | API | `8080` |
| `ALLOWED_ORIGIN` | API | `http://localhost:5173` |
| `VITE_API_URL` | web | none (required) |

## Tests

```sh
cd api && go test -cover ./...
cd web && npm test -- --run
```
