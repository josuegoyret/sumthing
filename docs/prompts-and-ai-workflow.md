# Prompts and AI workflow

## Overview

AI agents are used for research, questioning, exploration, proposals, plan elaboration, implementation and verification. Design decisions are written down to `GLOSSARY.md` and ADRs for better alignment.

## The loop

```
/grill-with-docs ──► /to-spec ──► (plan) ──► /implement (tdd: red → green) ──► end-to-end check ──► /code-review ──► commit
      │                                                                              │
      └── GLOSSARY.md + ADRs updated inline                         browser screenshots vs. brand rules
```

The rules for the agent live in `CLAUDE.md`: workflow, how to verify, the code rules and the Definition of Done.

## Examples

Each prompt summarizes a whole process of more prompts and follow-ups recorded in a personal ai-diary.

### 1. API design: from the UX to the evaluator

**Prompt:** "Design the calculate API for an iPhone-style calculator: the Expression moves up and the Result takes the main line. Compare two contracts, one call per operation or the whole Expression on `=`, by UX, precedence and where the math lives. Then propose the backend flow with the simplest well-known pattern that handles precedence without parentheses (is there a LeetCode problem for it?), and exact decimals: compare `shopspring/decimal` and `math/big.Rat` on `1÷3×3`. Ask one round of questions at a time, each with a recommended answer."

**Process:** The whole Expression goes to the server, so the frontend stays a pure editor. A recursive-descent parser was dropped for the one-stack loop of LeetCode 227.

**Outcome:** tokenizer → evaluator → formatter over exact fractions, standard library only ([ADR 0001](adr/0001-server-evaluates-the-whole-expression.md), [ADR 0002](adr/0002-exact-fractions-with-big-rat.md)).

### 2. Product decision: limits for an everyday calculator

**Prompt:** "Add power, square root and percent. The target is a simple everyday AI calculator, not a scientific one. First explore the edge cases: huge exponents, irrational roots, the meaning of `%` after `+` or `×`, and the size of a Result. For each one, propose the limit a phone user expects and the simplest rule that keeps the code small, and list what the limit rules out. The math stays on the server, and errors use the existing envelope."

**Process:** Each risk became a limit, not more code. The grammar already rejects `√-4`, so one planned error code was dropped.

**Outcome:** an Exponent from 0 to 99, `√` only before a Number, `%` as on a phone, Results of at most 100 digits ([ADR 0004](adr/0004-everyday-limits-for-the-optional-operations.md)).

### 3. Dictation: a two-step AI flow

**Prompt:** "Add dictation as a primary key. UX: tap to record, with a level meter and a timer; tap again, or wait 15 s, to stop; then show the Result with the heard words above it. Backend: one endpoint in two steps with two models, speech to text, then text to an Expression with structured output. Send what is on screen, so 'times two' continues it. The AI never calculates: its Expression goes through the same checks as typed input. Out of scope: parentheses, other languages and rate limiting in code. Grill me on each step before the spec."

**Process:** One generic "not understood" error, and a spending limit instead of rate-limit code. After the first real tries, few-shot examples went into the system prompt.

**Outcome:** the model writes only the Expression, and the calculator checks and calculates it. A misheard word can show a wrong Expression, never a wrong Result ([ADR 0005](adr/0005-the-ai-writes-the-expression-never-the-result.md)).
