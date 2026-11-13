# Backlog: nice-to-haves

Ideas that are agreed but not yet specified. Each one gets its own spec before work starts.

## Dictation

- A primary key in the bottom-left slot (`0` becomes one slot).
- Server-side, with a paid LLM API that Josué provides: speech to text, then text to an Expression. The SDK or service is still open (OpenAI Go SDK, Vercel AI SDK, a separate service).
- An animation while the user speaks, as in common dictation UIs (for example a level meter or waveform from the microphone input). Reduced motion keeps only a static "listening" state.

## Keyboard input (desktop)

- Type the Expression with the keyboard: digits, `.`, `+ - * / ^ %`, Enter or `=` for equals, Backspace, and Escape for clear.
- Open points: keys for `√` and `x²`, a short visual press on the matching on-screen key, and `aria-keyshortcuts` on each key so screen readers announce the shortcut.

## Key sounds

- A very subtle, smooth mechanical-keyboard click on each key press.
- A short, satisfying ping when the Result arrives.
- Plan: play the sounds with Howler (cross-browser audio; a new dependency, proposed by Josué).
- Open points: a mute control and its default, the sound files, and the volume.

## README highlight

- When dictation and key sounds are done, give them a short section in the README: they are the parts that teach the reader something (audio in the browser, speech to an Expression with an LLM).

## Submission readiness

- **Add development prompts:** share the actual prompts used to develop the submission in a document linked from the README or in the submission itself.
- **Complete coverage deliverable:** capture coverage reports for both layers from the final test suite, include package/file breakdowns and reproducible commands, update the README's test counts and coverage figures, and cover Dictation and HTTP error-handling paths.
- **Improve JSON validation:** require EOF after the calculation request's JSON object and add regression tests for trailing garbage and additional JSON values.
- **Polish README:** provide or replace the referenced `docs/demo.gif`, document Dictation setup and `OPENAI_API_KEY`, and explain behavior when credentials are not configured.
