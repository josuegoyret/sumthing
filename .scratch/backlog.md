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
- Open points: a mute control and its default, the sound source (generated in the browser with the Web Audio API, or small audio files), and the volume.
