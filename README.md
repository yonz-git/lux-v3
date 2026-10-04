# LUX — web prototype

An AI-guided skincare **investigation** app. This repo is the code prototype of a
design system that lives in Figma.

> This is not a medical diagnosis tool.

**Live:** https://iamlux.vercel.app

## Status

| | |
| --- | --- |
| Implemented | `00 — Welcome` (mobile + desktop) |
| Design source | Figma `wIftBhzkn8E4wjZwgdH71n`, page `06. Screen Designs` (`453:2252`) |
| Designed, not yet built | `01 Start investigation`, `02a Skin type`, `02b Skin tendencies`, `02c Known conditions`, `03a Observable symptoms`, `03b Location`, `03b Selfie capture`, `03c Timing` — each at both breakpoints |

## Run it

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:3000. Check it at **440px** and at **1440px** — those
are the two widths the designs are drawn at.

## How this is put together

```
app/
  tokens.css     every Figma variable as a CSS custom property (generated)
  globals.css    reset, the type ramp as .t-* classes, the screen shell
  layout.tsx     Figtree (Light/Regular/Medium only), metadata
  page.tsx       renders 00 — Welcome
components/
  Orb.tsx        the AI avatar, exported verbatim from Figma — do not redraw
  icons.tsx      nav icons, exported from Figma, filled with currentColor
  Button.tsx     Figma component set 37:23 (Primary only, so far)
  ChatBubble.tsx Figma Spec/Chat Bubble 47:12 — carries the 1px tail corner
  BottomNav.tsx  Figma Bottom-Nav-Bar 410:258 — fixed, 24px from the bottom
  Welcome.tsx    the screen
```

`tokens.css` mirrors the nine Figma variable collections: primitives, semantic
colour, spacing, radius, layout, typography, size, elevation and motion. Each
custom property name is the variable's own WEB code syntax, so a token in Figma
and a custom property here are the same thing.

**Read [AGENTS.md](./AGENTS.md) before changing anything visual.** It carries the
rules that keep the code and the Figma file honest — the ones that are easy to
break silently.

## Deliberately not done yet

- **Dark mode.** Figma defines a Dark mode for the colour collection but it has
  never been visually reviewed, so it is not emitted. `tokens.css` is Light only.
- **Routing.** "Start investigating" and the three nav items are buttons with no
  destination, because the screens they point to do not exist yet. They become
  `next/link` as each lands, with `aria-current="page"` on the active nav item.
- **Token export automation.** `tokens.css` was generated from the Figma
  variables by hand this once. It should become a script so the two cannot drift.

## Two values worth confirming against Figma

- `.t-overline` uses `letter-spacing: var(--tracking-wide)` (0.71px). The Figma
  text style's tracking was not captured in the export, so this was inferred from
  how the style renders.
- The canvas gradient is expressed as a CSS angle per breakpoint (165deg mobile,
  136deg desktop). Figma positions gradients with handles, which are aspect-ratio
  dependent; a browser viewport is not a fixed frame, so the angle is set per
  breakpoint rather than derived.
