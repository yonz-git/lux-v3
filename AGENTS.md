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

**Built so far:** the whole GETTING STARTED flow — `00 — Welcome`,
`01 — Start investigation`, `02a — Skin type`, `02b — Skin tendencies`,
`02c — Known conditions`, `03a — Observable symptoms`, `03b — Location`,
`03b — Selfie capture`, `03c — Timing`. Step 8 (PRODUCTS) is a deliberate
placeholder route, not a screen. Routes live under `/investigation/<step>`;
`lib/flow.ts` owns the step order, the 1-based track position, the Figma frame
ids AND each step's `isComplete` rule.

## The prototype starts EMPTY — and Continue is gated

**Nothing is pre-selected, on any screen.** The Figma frames show options already
chosen because a comp has to show a filled-in state; the prototype is the thing
the user actually drives. If you port a screen and it renders with something
selected, that is a bug.

**`Continue` is DISABLED until the step is answered**, then becomes available.
The rule lives on the step in `lib/flow.ts` (`isComplete`), never in the screen,
so a new screen cannot forget it. `QuestionScreen` reads it and owns the button.

Answers live in `components/InvestigationProvider.tsx` — React context,
**in memory only**. Read them with `useInvestigation()`.

⚠️ **DO NOT PERSIST THE ANSWER STORE.** An earlier build wrote to localStorage
on the reasoning that "Save & exit" implies a resumable flow. The effect was
that opening the prototype showed a previous visit's selections still ticked,
which reads exactly like the screens shipping pre-filled — the opposite of the
rule above. Answers carry across steps because `app/investigation/layout.tsx`
keeps the provider mounted through client-side navigation, which is all the flow
needs. Real resumability belongs to a backend, not to a store that silently
reproduces stale answers.

**⚠️ USE THE UPDATER FORM FOR ANY TOGGLE:**
`setAnswer("start", (prev) => toggleMulti(prev ?? [], option))`. Passing a value
computed from the `answers` you read during render uses a snapshot, so two
toggles in the same tick silently lose the first.

Screens ECHO earlier answers rather than hardcoding the comp's copy — 02a recaps
the symptoms picked on 01, 02b shows the skin type picked on 02a. Guard for the
answer being absent (deep links) rather than rendering an empty bubble.

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
6a. **Button states — the variant names are CORRECT as of 21 Aug 2026.**
   Primary's Hover and Disabled names used to be swapped; they were renamed with
   **no visual change** (verified pixel-identical). The names and the showcase
   `row/Primary` (`160:15`) now agree, so **any older note saying "trust the
   showcase, not the variant names" is stale.** Secondary and Ghost were always
   named correctly.

   | State | Variant | Cell | Treatment |
   | --- | --- | --- | --- |
   | Default | `37:5` | `160:17` | `gradient/brand` #bbd3d9 → #637073, label `text/on-brand`, NO stroke |
   | **Hover** | `37:9` | `160:23` | the same gradient at node **opacity 0.4** — no colour change |
   | **Disabled** | `37:13` | `160:20` | **`state/disabled-bg` #eef6f7 @51%** + **1px `border/default` #cbcdd4** + label `text/muted` #9a9aa5, both shadows kept, opacity 1 |

   Ignore `button/bg-hover-*` and `button/bg-pressed-*` — the component has never
   used them. There is no `State=Pressed` for any style, and
   `Style=Secondary, State=Hover` is still missing from the set.

   ⚠️ **The disabled state carries a 1px `border/default` stroke that the
   enabled button does not.** Easy to miss and easy to omit. `Button.module.css`
   declares the border transparent in every state so the box never changes size
   and the colour can transition.

   ⚠️ **The disabled surface is TRANSLUCENT** — `state/disabled-bg`
   (`#eef6f7 @51%`), not the opaque `bg/surface-frost`. It reads too bright on
   screen when opaque, and translucency lets it soften against whatever is
   behind it (visibly better on the sage check tray). **Every** disabled button
   uses it — Primary, Secondary, Back and both Small Buttons — with node
   opacity 1. Secondary used to be a 0.4 node fade; that is gone.

   Ignore `button/bg-hover-*` and `button/bg-pressed-*` either way — the
   component never uses them — and note `Style=Secondary, State=Hover` is still
   missing from the set.

7. **The bottom nav is fixed and identical on every screen**: 24px from the
   bottom, horizontally centred, `--z-nav`, 380 wide on mobile and 598 on
   desktop. `active="none"` is a real state (welcome, intro, onboarding), not a
   fallback.
7a. ⚠️ **The nav is `surface/frost-nav` `#dde8eb @83%` — NOT 17%.** It used to be
   17%, which is barely a tint: the Continue button and the last option rows read
   straight through the bar. Frosted does not mean see-through. The
   `prefers-reduced-transparency` fallback is `bg/nav`, now the SAME colour fully
   opaque (`#dde8eb`) — it used to be `#9caeaf @55%`, a different hue *and* still
   translucent, which is not a fallback at all.
8. **Chat bubbles carry an asymmetric tail corner, and NO border.** Three corners
   at `--radius-bubble` (30), the sender-side corner at `--radius-bubble-tail`
   (1). AI = tail top-left, sits left. User = tail top-right, sits right. Four
   equal corners is wrong. A bubble is a **fill plus two shadows** — every
   reference bubble in the design system has no stroke. Frosted *rows* and
   *cards* do carry a 1px `border/subtle`; **do not merge the two recipes.**
8a. **Bubbles are OPAQUE** — `--color-bg-bubble-ai` (#edf8fb) and
   `--color-bg-bubble-user` (#bdd1d2), no backdrop blur and no
   reduced-transparency fallback. They used to be built on
   `surface/frost-light` @55%, which let the canvas gradient through, so a
   bubble low on a screen rendered darker than one near the top. **Never put a
   translucent surface on a bubble.** Padding is 14/18 mobile, 14/22 desktop.

8b. **A Figma stroke does not add to a frame's height; a CSS border does.** With
   `box-sizing: border-box`, a 56-tall row with `padding: 15px` plus a 1px
   border renders 58. Give these rows `min-height` and drop the vertical
   padding — they are flex + centred, so they render identically and stay
   exactly on the Figma height.
8c. ⚠️ **A GRADIENT + A BORDER NEEDS `background-origin: border-box`.**
   `background-origin` defaults to `padding-box` while `background-clip` defaults
   to `border-box`, so a gradient is **sized to the padding box but painted into
   the border box**. Add a border and the outermost 1px of every edge has no
   gradient on it — the drop shadow shows through as a thin dark notch at the
   widest point of each rounded end. It is subtle, and it looks like a rendering
   glitch rather than a CSS mistake. Only background IMAGES are affected; a flat
   `background-color` is not, which is why the frosted rows never showed it.

9. **Frosted surfaces always get a solid fallback** under
   `prefers-reduced-transparency`, and a translucent fill always needs its inner
   shadow or it reads flat.
10. **Breakpoints: mobile-first, desktop at `min-width: 1024px`.** Never write a
    440px or 1440px media query — those are the Figma canvas widths, not
    breakpoints.

## Things the design system does not have, faked here

Each of these is composed from tokens in Figma too, so the code is not inventing
a treatment — but there is no component to keep them in sync, and that is the
risk. All are on the missing-from-the-DS list.

| Need | Here | Note |
| --- | --- | --- |
| Date picker | `components/DateField.tsx` | `<input type="date">`'s popup is drawn by the browser and **cannot be styled** — no token or class reaches inside it. It rendered as a stock white Chrome calendar mid-flow. The DS has no calendar component either, so this is composed from tokens. |
| Text input | `components/TextField.tsx` | `Search Field` (248:70) exists but is search-specific. `other-input` on 02c/03a and the 03c date field are all hand-composed in Figma. |
| Face-region picker | `components/FaceDiagram.tsx` | The region coordinates ARE the design — "Cheeks (L)" only means the left cheek because of where it sits. Stored as % of the 392x300 card so it scales. |
| Camera shutter | `SelfieCapture.module.css` | No shutter component. The viewfinder is a placeholder, not `getUserMedia` — wiring a real camera would make the prototype demand a permission just to walk the flow. |

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
  for another snaps. The registered `--grad-start` / `--grad-end` properties
  (declared in `globals.css`) make the gradient addressable from both states.
- ⚠️ **A "stuck" transition in the preview pane is almost always the HIDDEN TAB,
  not your CSS.** The Browser pane reports `document.visibilityState === "hidden"`,
  and Chromium freezes rAF and CSS transitions there — 0 frames in 400ms.
  Computed values then sit at the START of the transition indefinitely and jump
  to the end on a forced reflow, which looks exactly like a stuck property. I
  misdiagnosed this once and stripped `Button`'s transitions for nothing.
  **To verify motion in the pane, inspect `element.getAnimations()`** — check the
  `CSSTransition`/`CSSAnimation` exists with the expected duration and easing,
  then call `.finish()` and assert the end state. Do not rely on sleeping and
  re-reading `getComputedStyle`.
- ⚠️ **Reveals use `animation-fill-mode: backwards`, NOT `both`.** `both` adds
  `forwards`, which keeps the animation in effect after it ends — and an opacity
  animation still in effect leaves a **persistent stacking context**. Every
  revealed block then paints in DOM order regardless of `z-index`, so a popover
  inside an early block renders *underneath* the blocks below it. That is exactly
  how the date picker ended up behind the radio rows. Opacity 1 is the natural
  end state, so `forwards` buys nothing and costs that. `backwards` still holds
  the from-state during a stagger delay, which is the only part needed.
- **Anything that opens a popover gets `position: relative; z-index: 1` on its
  own block**, so its layering does not depend on nothing else in the stack ever
  creating a stacking context.
- **Entrance reveals: the rule that NAMES an animation must live in
  `globals.css`, never in a CSS Module.** Modules localize `@keyframes` names, so
  `animation: lux-fade-in …` inside a module compiles to a scoped name that does
  not match the global keyframes — it resolves to nothing and no animation runs,
  while still reporting a duration in `getComputedStyle`. Use the `[data-reveal]`
  / `[data-reveal-stagger]` hooks. A module may safely set `animation-delay`,
  which carries no name.
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
