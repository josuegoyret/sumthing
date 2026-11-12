# Inject the calculator client as a prop

`main.tsx` chooses the calculator client (the HTTP client, or the development mock) and passes it down as a prop: `App → Calculator → useCalculator`. Only `useCalculator` uses it. We keep this dependency injection because it keeps the choice in one place, lets tests pass a fake client as a normal argument, and lets `main.tsx` load the mock with a dynamic import, so the mock is never in the production bundle.

## Considered Options

- **Import a client instance directly in the hook** (`export const client = await loadCalculatorClient()` in its own module). It removes the props, but the client becomes a hidden module-level global, and every test must replace the module with `vi.mock`.
- **A React Context.** It is the right tool when many components at different depths need the client. With one consumer, three levels down, it adds a provider and a hook for no gain. Change to a Context when a second component needs the client, or when the prop must pass through more than one component that does not use it.
- **A prop from the composition root** (chosen).
