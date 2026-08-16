<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# LUX — working rules for this repo

LUX is an AI-guided skincare **investigation** web app. The design system is the
source of truth and it lives in Figma, not here. This repo is the prototype of
it. Screens are built in Figma first, then translated.

**Figma file:** `wIftBhzkn8E4wjZwgdH71n`
**Screens page:** `06. Screen Designs` (`453:2252`) — the GETTING STARTED flow is
9 screens x 2 breakpoints, in flow order, with a `HANDOFF — GETTING STARTED`
annotation panel above the mobile row that documents every recipe below.

Only **00 — Welcome** is implemented so far.

## Non-negotiables

1. **`app/tokens.css` is generated from the Figma variables. Never hand-edit a
   value there and never hardcode a colour, radius, spacing or font size in a
   component.** If a value you need is missing, it is missing in Figma too — add
   the variable there first, then re-export.
2. **Never reference the `01 Primitives` block** (`--color-indigo-*`,
   `--color-sage-*`, …) from a component. Bind to the semantic tokens.
3. **Every piece of text uses a `t-*` class** from `globals.css`, one per Figma
   text style. No ad-hoc `font-size`.
4. **Weights are Light / Regular / Medium only.** SemiBold and Bold are not in
   the ramp. `--font-weight-semibold` and `--font-weight-bold` exist as tokens
   but using them is drift.
5. **Buttons are `Button` (Regular 15/22)** — deliberately Regular, never Medium.
6. **Never hand-build a button.** Use `components/Button.tsx`. The two stacked
   drop shadows are part of the component; a hand-rolled gradient div loses them.
6a. **State colours come from the component variants, not from same-named
   tokens.** Primary's hover variant (37:13) is a SOLID `bg/surface-frost`
   #eef6f7 with a `text/primary` label — the button **lights up**, it does not
   darken. The `button/bg-hover-start` / `-end` tokens in 02 Color describe a
   darker sage gradient the component does not use. When a token and a variant
   disagree, **the variant wins** — it is what ships. Check the variant first.
7. **The bottom nav is fixed and identical on every screen**: 24px from the
   bottom, horizontally centred, `--z-nav`, 380 wide on mobile and 598 on
   desktop. `active="none"` is a real state (welcome, intro, onboarding), not a
   fallback.
8. **Chat bubbles carry an asymmetric tail corner, and NO border.** Three corners
   at `--radius-bubble` (30), the sender-side corner at `--radius-bubble-tail`
   (1). AI = tail top-left, sits left. User = tail top-right, sits right. Four
   equal corners is wrong. A bubble is a **fill plus two shadows** — every
   reference bubble in the design system has no stroke. Frosted *rows* and
   *cards* do carry a 1px `border/subtle`; **do not merge the two recipes.**
9. **Frosted surfaces always get a solid fallback** under
   `prefers-reduced-transparency`, and a translucent fill always needs its inner
   shadow or it reads flat.
10. **Breakpoints: mobile-first, desktop at `min-width: 1024px`.** Never write a
    440px or 1440px media query — those are the Figma canvas widths, not
    breakpoints.

## Selection controls — the shape is the contract

Not a style choice. It maps to the ARIA role and screen readers announce them
differently.

| Control | Shape | Cardinality | Role |
| --- | --- | --- | --- |
| Radio row | circle | exactly one | `role="radio"` |
| Checkbox row | square | zero or more | `role="checkbox"` |
| Chip | pill | zero or more, short labels | `role="checkbox"` |

**Exclusive options** ("None", "Not sure", "Prefer not to say") stay
**checkboxes** and keep `role="checkbox"`. Selecting one clears every other box;
selecting a normal option clears the exclusives. Never swap them to radios —
mixing shapes in one group tells the user the whole group is single-select.

## Motion — board 04b (389:200)

"LUX motion is calm. Nothing snaps."

| Token | Value | Use |
| --- | --- | --- |
| `--duration-fast` | 120ms | **hover, focus, small colour changes** |
| `--duration-base` | 200ms | selection, chips, rows, toggles |
| `--duration-slow` | 320ms | sheets, overlays, page-level reveals |
| `--duration-slower` | 480ms | orb and hero entrances |

`--ease-standard` is the default for anything that enters and settles.

- **Pressed never uses a transform** — "LUX does not bounce." Overlay
  `state/pressed-overlay` at 14% instead.
- **CSS cannot interpolate `background-image`.** Swapping one `linear-gradient()`
  for another snaps, which breaks "nothing snaps". Drive the registered
  `--grad-start` / `--grad-end` properties (declared in `globals.css`) instead —
  registered `<color>` properties do interpolate.
- **Wrap every `:hover` rule's counterpart in `@media (hover: none)`** so the
  state does not stick after a tap on touch devices.
- `prefers-reduced-motion` already collapses all durations globally; don't
  special-case it per component.

## Translate, don't transcribe

The Figma frames are fixed-height canvases (440x957, 1440x900). Their internal
spacer frames are artefacts of those heights. Express the *intent* in CSS —
flex, `100dvh`, `clamp()` — and keep the tokens exact. Component sizes, radii,
type and colour must match Figma to the pixel; page-level whitespace should
adapt.

## Before you call a screen done

- `npm run build` and `npm run typecheck` both clean.
- Compare against the Figma frame at 440 and at 1440.
- Check computed values in the browser rather than eyeballing a screenshot.
- Keyboard: focus is visible on every interactive element (`:focus-visible`
  ring is `--shadow-focus-ring`). Never remove it.
