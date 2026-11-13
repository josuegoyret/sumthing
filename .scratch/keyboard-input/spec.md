# Spec: Keyboard input

Status: done
Phase: 4, the nice-to-haves.

## Problem Statement

On a desktop, the user must click every key with the mouse. A calculator on a computer is faster with the keyboard.

## Solution

The physical keyboard presses the matching Key. The Key looks pressed while the physical key is held. Screen readers announce each shortcut with `aria-keyshortcuts`.

## Key map

| Physical key | Key |
|---|---|
| `0`–`9` | the digit |
| `.` `,` | point |
| `+` `-` `/` `^` | the Operator |
| `*` `x` | multiply |
| `%` | percent |
| `r` | square root |
| `Enter` `=` | equals |
| `Backspace` | backspace |
| `Escape` `Delete` | clear |

There is no shortcut for `x²`: `^` then `2` gives the same Expression.

## Rules

- Keys with `Ctrl`, `Cmd` or `Alt` are ignored, so browser shortcuts still work.
- A mapped key blocks the browser's default action. So `Enter` on a focused Key presses equals only once.
- `^`, `%` and `r` work while the f(x) panel is closed. The panel does not open.
- The pressed look uses the same style as a mouse press. It stops on key up, or when the window loses focus. There is no extra animation.
- Each Key with a shortcut has `aria-keyshortcuts`, for example `Enter =` on equals. `+` is written `Plus`, as ARIA requires.

## Out of scope

Mobile (no physical keyboard), and a copy button.

## End-to-end check

Vite and the API container, in a headless browser at 1280×900 and 390×844:

- `1 , 5 + 3 x 4 Enter` → `1.5+3×4` = `13.5`. `Escape r 9 Enter` → `√9` = `3`. `Ctrl+r` adds nothing.
- Holding `7` gives the `7` Key `data-held` and `scale(0.96)`. Key up removes it.
- `aria-keyshortcuts`: equals `Enter =`, plus `Plus`, multiply `* x`, point `. ,`, clear `Escape Delete`.
- No console errors.
