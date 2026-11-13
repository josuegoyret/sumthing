# The AI writes the Expression, never the Result

Dictation uses two AI models: one turns the audio into a Transcript, and one turns the Transcript into an Expression. The AI stops there. The Expression then goes through `calc.Calculate`, the same code as `POST /v1/calculate`, which checks the grammar and the limits (ADR 0004) and calculates the exact Result.

The AI's answer has one shape, forced by OpenAI Structured Outputs: `{"expression": "..."}`. An empty Expression means "not understood". If the Expression breaks the grammar, the user gets the same "not understood" error. So the AI can only make a wrong guess about the words, never a wrong Result, and a prompt injection can only produce digits and our Operators.

## Considered Options

- **Ask the AI for the Result.** One call less, but language models make arithmetic mistakes, and the Result would no longer be exact (ADR 0002).
- **Let the AI return parentheses for grouping** ("five plus three, all times two"). The grammar has no parentheses (ADR 0001), so the AI must not invent them. Grouped requests are "not understood"; the user says them in steps.
- **Many error codes from the AI** (not a calculation, needs steps, ...). One generic error is enough for the user and keeps the prompt simple.

## Consequences

- The OpenAI calls run in the Go API, with `OPENAI_API_KEY`. The key never reaches the browser.
- Without the key, the server still starts, and `/v1/dictate` answers 503.
- The quality of the AI's answers is a job for evals, which are out of scope. The cost limit is a spending limit on the OpenAI project.
