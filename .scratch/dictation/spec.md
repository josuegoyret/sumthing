# Spec: Dictation

Status: in progress (the full flow with a real OpenAI key is still to check)
Phase: 4, the nice-to-haves.

## Problem Statement

On a phone, a long Expression takes many taps. Saying "fifteen percent of eighty" is faster than typing `15 % × 80`.

## Solution

A mic Key records the user. The Go API turns the audio into a Transcript, the Transcript into an Expression, then calculates the Expression with `calc` (ADR 0005). The screen shows the Expression and the Result, and a banner shows the Transcript.

## Screen

```
┌────────────────────────────┐
│  ● Listening 0:03 / 0:15 × │  ← the banner
│                    15%×80  │
│                        12  │
│ [ C ] [ ⌫ ] [ ▦ ] [ ÷ ]    │
│ ...                        │
│ [ 🎤 ] [ 0 ] [ . ] [ = ]   │  ← the mic Key takes half of the old 0
└────────────────────────────┘
  Type on your keyboard, or press M to dictate   ← desktop only
```

## Flow

1. Tap the mic Key (or press `M`). The browser asks for the microphone, then records. The banner shows "Listening 0:03 / 0:15" and a ×. The mic Key shows a level meter.
2. Tap the mic Key again to stop. Recording stops by itself at 15 s. × cancels without sending.
3. The mic Key shows a spinner while the API works.
4. The answer: the expression line shows the Expression, the main line the Result, the ping plays, and the banner shows the Transcript in quotes.

The AI gets what is on screen and returns the full Expression. After `28`, "times two" gives `28*2`.

## Banner

- At most 2 lines (`line-clamp`).
- Desktop: above the card, outside it; it rises out of the card. Mobile: fixed to the top of the screen, over the header; it drops in from the top.
- Closes by itself after 3 s, or with ×. While recording, it stays open.
- "Allow the microphone to dictate." stays until ×.
- Enters with opacity, a small `translateY` and `scale(0.97)`, `ease-out`, about 200 ms (`@starting-style`); exits faster. No movement with reduced motion.

## API

`POST /v1/dictate`, `multipart/form-data`:

| Field | Value |
|---|---|
| `audio` | the recording (`webm` or `mp4`), at most 1 MB |
| `expression` | what is on screen; may be empty |

`200`: `{"transcript": "fifteen percent of eighty", "expression": "15%*80", "result": "12"}`

| Status | `code` | When |
|---|---|---|
| 400 | `INVALID_REQUEST` | no audio, or more than 1 MB |
| 422 | `NOT_UNDERSTOOD` | "Couldn't understand that. Try again." The AI returned no Expression, or one that breaks the grammar |
| 422 | the `calc` codes | for example `DIVISION_BY_ZERO` |
| 503 | `DICTATION_UNAVAILABLE` | no `OPENAI_API_KEY` on the server |
| 502 | `DICTATION_FAILED` | OpenAI failed or took more than 20 s |

Models: `gpt-4o-mini-transcribe`, then `gpt-5.4-mini` with Structured Outputs `{"expression": string}`. The prompt gives the grammar and the limits of ADR 0004, no parentheses, English only.

## Out of scope

Tests of the AI answers (evals), other languages, parentheses, and a rate limit (the OpenAI project has a spending limit).

## End-to-end check

- `go run` without `OPENAI_API_KEY`: the log says `dictation false`; `POST /v1/dictate` answers 503 `DICTATION_UNAVAILABLE`; `/v1/calculate` still answers `5` for `2+3`.
- Headless browser (no microphone), 1280×900 and 390×844: `M` shows "Allow the microphone to dictate." in the banner; above the card on desktop, at the top of the screen on mobile. The mic Key sits in the bottom-left, `0` takes one slot, and the hint is under the card. No console errors.
- Still to check, with a real key and a real microphone: the Transcript, the Expression, the Result, continuing a Result, "not understood", cancel, the 15 s stop and the 3 s close.
