# Brand rules for sumthing

The checklist for every design screenshot. If the screen breaks a rule here, it is not done.

**Sources** (read 2026-11-12):
- Rules: the brand guidelines page. This is the authority. When the sources disagree, it wins.
- Layout and behaviour: the iPhone calculator, see `iphone-reference-*.jpeg` in this folder. Only its abstract concepts are used: round keys, a 4-column grid, the Expression above the Result, and an Operator column on the right. Its colours and font are not used.

## Colour roles

| Token | Hex | Role (brand) | In sumthing |
|---|---|---|---|
| Primary Plum Dark | `#201733` | Dark backgrounds | The canvas |
| Primary Plum Light | `#F2E6FF` | Font and icons on dark | Digits, the Result |
| Bold Green | `#9FF4D9` | **CTAs on dark**, success | The `=` key only |
| Bold Plum | `#8333D4` | CTAs on light, brand expression | The logo tile only |
| Plum 200 | `#C9A1F4` | Bold Plum tint (token CSS) | Operator keys |
| Bold Pink | `#FF5667` | Promos and pricing. Token CSS: errors | Error messages |
| Bold Orange | `#FF8100` | Another product line **only** | Never |

Opacity hierarchy of Plum Light on dark:
- headings 100%,
- body text 60%,
- secondary labels 50%,
- tag fills 12%,
- borders 8%,
- card fills 4%.

## Typography

- **Satoshi only**, at weights **400 and 500**. Never 600 or more.
- Numbers use `font-variant-numeric: tabular-nums`.

| Token | Size / leading / tracking | Use |
|---|---|---|
| display-l | 60 / 110% / −1.5%, 500 | The main line (Result or Expression) |
| heading-3 | 26 / 110% / 0, 500 | Key labels |
| body-l | 18 / 156% / 0, 400 | The Expression line above the Result |
| body-s | 14 / 143% / 0, 400 | Error and status text |
| label | 12 / 133% / +4%, 500, all caps | Small labels, if any |

Long numbers on the main line shrink to fit, and never go below heading-2 (34px).

## Spacing, radius, grid

- **8pt scale only:** 4, 8, 16, 24, 32, 48, 64, 80, 96, 128. Never 10, 12 (except the radius token), 15 or 20.
- Radius: sm 8, md 12, lg 16, xl 24, full 9999. **All buttons are pill-shaped or round.** Never square or rounded-rectangle buttons.
- Mobile grid: 16px margins and 16px gutters. The keypad is 4 columns, with a 16px gap.
- Touch target: **at least 44px**. Keys are 72px circles on mobile.

## Buttons (keys)

| Variant | Use | Style |
|---|---|---|
| `default` | Digits and `.` | `--bg-card` fill, Plum Light text |
| `operator` | `+ − × ÷` | 1px Plum 200 border, Plum 200 text. Selected: Plum 200 fill, Plum Dark text |
| `primary` | `=` | Bold Green fill, Plum Dark text |
| `ghost` | `C` and backspace | No fill, `--fg-secondary` text |

Never swap the fill colours. Never put Bold Green on a light background.

## Numbers and copy

- en-US: `.` for decimals and `,` for thousands (`22,333.3333333333`). Grouping is display only, done on the Result string.
- Use the real symbols `+ − × ÷`, not `-`, `*` or `/`.
- Voice: direct, calm, no exclamation points, short sentences. Errors lead with what happened, for example "Can't divide by zero".

## Not allowed

- Brand logo files in the repo.
- Orange anywhere.
- Weights above 500, or any font other than Satoshi.
- Off-scale spacing.
- Raw hex values in component CSS. Use the semantic tokens.
