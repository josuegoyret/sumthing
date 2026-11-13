# Spec: Key sounds

Status: done
Phase: 4, the nice-to-haves.

## Problem Statement

A phone calculator gives feedback you can hear. In the browser, a key press is silent, and a Result arrives without a signal.

## Solution

A very quiet click on each Key press, and a short ping when a Result arrives. Howler plays the sounds (one `Howl` per sound, created once). A mute toggle sits in the top-right corner of the header, opposite the logo. Icons come from `lucide-react`; the `f(x)` text on the toggle Key becomes a calculator icon.

## Rules

- Sound is on by default. The mute choice is saved in `localStorage` and restored on the next visit.
- The click plays on every Key press, with the mouse or the keyboard, except equals. Equals is silent; the ping is its only sound. The `f(x)` toggle and the mute toggle make no sound.
- The ping plays only when the outcome is a Result. Errors and "Can't reach the calculator." are silent.
- Volume: click 0.3, ping 0.5. Tuned by ear.
- Reduced motion does not change sound.
- Browsers allow audio only after a user gesture. The first sound always follows a press, so no extra unlock step is needed.

## Mute toggle

- `keySounds.ts` owns the saved choice: it restores the mute when the module loads, and `saveSoundsMuted` mutes and saves in one call. The toggle calls it from its click handler, so no effect is needed.
- The shadcn Toggle pattern: a button with `aria-pressed`. Its accessible name is "Mute sounds". `aria-pressed="true"` means muted.
- Icon: `Volume2` when sound is on, `VolumeX` when muted.

## Sounds

From Kenney "UI Audio" (CC0, no attribution required), in `web/public/sounds/`, as `.ogg` with an `.mp3` fallback for browsers without Ogg.

- Click: `click5` (32 ms).
- Ping: `rollover1` (227 ms).

## Out of scope

A volume slider, and different sounds per Key.

## End-to-end check

Vite and the API container, in a headless browser at 1280×900 and 390×844:

- `click.ogg` and `ping.ogg` load with 200. `2 + 3 Enter` gives `5`.
- The mute toggle sets `aria-pressed="true"` and saves `sumthing:muted=true`. After a reload, the toggle is still muted.
- The `f(x)` toggle shows the calculator icon and keeps the name "More functions".
- No console errors.
