<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# LUX — working rules for this repo

LUX is an AI-guided skincare **investigation** web app. The design system —
tokens, components, type, colour — is the source of truth and it lives in Figma.

**Figma file:** `wIftBhzkn8E4wjZwgdH71n` · **Screens page:** `06. Screen
Designs` (`453:2252`). Each section has a `HANDOFF — *` annotation panel beside
its mobile row documenting every recipe.

**⚠️ THE PROTOTYPE LEADS ON FLOW, FIGMA LEADS ON PIXELS.** Every VISUAL decision
— a component's size, radius, type, colour — must match Figma to the pixel, and
inventing a treatment is drift. The SHAPE OF A FLOW — what the steps are, what
order they run in, what each asks — gets decided here, in the thing that can
actually be walked, and Figma catches up. Divergences carry a `⚠️ NOT IN FIGMA`
comment naming what changed and why. Keep writing them.

## Where to find the reasoning

This file is the RULES. It deliberately does not carry the reasoning behind
them, because that lives in three better places:

1. **The component's own doc comment.** Every screen and component opens with a
   30–50 line block explaining its Figma frame, its measurements and every
   decided-here change. That is the authority for the file you are editing, and
   it cannot drift from the code it sits on. **Read it before you edit.**
2. **`docs/decisions.md`** — the cross-cutting record: why PRODUCTS went from
   twelve screens to one, why CHECK's basket stopped being modal, the contrast
   measurements behind SURFACE SYSTEM B, and the list of things faked here
   because the design system has no component for them.
3. **`docs/design.md`** — the Figma-side working guide: the component node ids
   and their variant structures, all nine token collections, the text-style
   ramp, the spacing and radius scales, and the `use_figma` gotchas. It is the
   authority for anything this file does not answer. **Read it before building
   a screen shape that does not already exist here** — it carries the
   vocabulary this file assumes you already have.

`design.md` is the FIGMA side; this file is the CODE side. Where they disagree,
the code is the truth about what SHIPPED and `design.md` is the truth about what
FIGMA HOLDS — both can be right at once. `docs/figma-catchup.md` lists every gap
between them and is the work order for closing them in Figma.

**Read the matching section of `docs/decisions.md` before you change the flow,
the surfaces or the copy of a nav section.** Those entries record decisions a
comp will contradict, so "fixing" the code to match Figma is exactly how they
get undone. For ordinary work — a bug, a style fix, a new component — the doc
comment is enough.

## Where the code lives

**One folder per nav section.** `features/<section>/` holds that section's
screens AND its data module. The four folders are named for the four nav items.

```
app/                 routes only — every page.tsx is a thin shell
components/ui/       the design system: Button, SmallButton, Chip, OptionRow,
                     Tag, TextField, DateField, SearchField, ChatBubble, Sheet,
                     DataCard, Orb, CameraCapture, icons
components/layout/   app chrome: BottomNav, HubScreen, ScreenHeader,
                     RouteAnnouncer
features/my-skin/    flow.ts + the investigation steps, QuestionScreen,
                     StepProgress, SelfieSheet, FaceDiagram
features/products/   products.ts, openBeautyFacts.ts, the two search hooks,
                     the product list/card/details/art components, the add tray
features/progress/   progress.ts + ProgressScreen, CheckIn, CheckInDetail,
                     CheckInCalendar, CheckInPhotoArt, SymptomTrend, SkinProfile
features/check/      check.ts + the check screens, CompatCard, ResultCards,
                     CheckBasket, SkinProfileStrip
lib/store/           answers.ts + InvestigationProvider.tsx
lib/                 date.ts  demo.ts  pageTitles.ts
```

**The rule for placing a new file:** it goes in `features/<section>/` unless two
different sections already use it. `components/ui/` is for things with no
opinion about what they contain; `components/layout/` is for the frame around a
screen. A component used by exactly one section is that section's, however
generic it looks.

Four placement facts that look like mistakes and are not:

- **`QuestionScreen` and `StepProgress` live under `my-skin`, not `layout/`.**
  They read `flow.ts`, so they can only ever wrap an investigation step.
  `HubScreen` takes no flow dependency and stays in `layout/`.
- **The store is not `my-skin`'s.** `Answers` carries slices owned by all four
  sections and imports a type from each, so it sits in `lib/store/` beside the
  provider that serves it.
- **Sections may import each other, and two do.** CHECK reads PRODUCTS;
  PRODUCTS reads `my-skin`'s `QuestionScreen` because step 5 is a flow step.
  What must NOT happen is `components/ui/` or `components/layout/` importing a
  feature — those are the layer underneath. `lib/pageTitles.ts` is the one
  shared module that imports a feature, because it is a route registry.
- **`features/<section>/*.ts`** (`flow.ts`, `products.ts`, `progress.ts`,
  `check.ts`) own the data and the derived values. A screen states nothing it
  could compute from one of these.

## The route map

Seventeen routes. `features/my-skin/flow.ts` owns the step order, the 1-based
track position, the Figma frame ids and each step's `isComplete` rule.

| Route | Kind | Nav |
| ----- | ---- | --- |
| `/` | welcome | `none` |
| `/investigation/start` | flow step 1/5 · also the `my-skin` landing | `my-skin` |
| `/investigation/skin-type` | flow step 2/5 | `my-skin` |
| `/investigation/conditions` | flow step 3/5 | `my-skin` |
| `/investigation/timing` | flow step 4/5 | `my-skin` |
| `/investigation/products` | flow step 5/5 — ⚠️ the one flow screen lighting `products` | `products` |
| `/products` | hub landing | `products` |
| `/progress` | hub landing — **the default**, opens populated | `progress` |
| `/progress/empty` | ⚠️ prototype-only empty state | `progress` |
| `/progress/check-in` | pushed view — the daily check-in chat | `progress` |
| `/progress/check-in/[date]` | pushed view — ⚠️ the app's ONE dynamic route | `progress` |
| `/check` | hub landing — **the default**, opens ready to check | `check` |
| `/check/no-profile` | ⚠️ prototype-only empty state | `check` |
| `/check/new` | pushed view — build the check | `check` |
| `/check/analyzing` | pushed view | `check` |
| `/check/results` | pushed view | `check` |
| `/check/history` | pushed view | `check` |

**⚠️ HUB vs FLOW — the header tells you which, and `HubScreen` vs
`QuestionScreen` encodes it.** A screen is an investigation step if and only if
it carries BOTH a progress track AND `Save & exit`. Hub screens carry neither,
and a hub LANDING has no back chevron either (nothing to go back to). A pushed
view keeps the back chevron and still has no track. Nothing outside
`/investigation/*` is a flow step — CHECK and PROGRESS have no `StepId`.

**Two overlays are not routes:** the selfie capture off step 1 and the products
add tray. Both are `Sheet` overlays, deliberately. See `docs/decisions.md`.

## The prototype starts EMPTY — and Continue is gated

**Nothing is pre-selected, on any screen.** The Figma frames show options
already chosen because a comp has to show a filled-in state. If you port a
screen and it renders with something selected, that is a bug.

⚠️ **THIS IS ABOUT CONTROLS, NOT READOUTS.** `/progress` and `/check`
deliberately open populated — they have nothing to select, and an empty readout
shows nothing. `lib/demo.ts` owns the one seeded skin profile; both sections
resolve it through `skinProfile()` so the demo cannot claim two different skin
types depending on which tab you are on.

**`Continue` is DISABLED until the step is answered.** The rule lives on the
step in `flow.ts` (`isComplete`), never in the screen, so a new screen cannot
forget it. `QuestionScreen` reads it and owns the button.

Answers live in `lib/store/InvestigationProvider.tsx` — React context, **in
memory only**, provided from `app/layout.tsx` so the PRODUCTS hub reads what
step 5 writes. Read them with `useInvestigation()`.

⚠️ **DO NOT PERSIST THE ANSWER STORE.** localStorage made every visit open with
the previous visit's selections still ticked — which reads exactly like the
screens shipping pre-filled. Real resumability belongs to a backend.

⚠️ **USE THE UPDATER FORM FOR ANY TOGGLE:**
`setAnswer("start", (prev) => toggleMulti(prev ?? [], option))`. A value
computed from the `answers` you read during render uses a snapshot, so two
toggles in the same tick silently lose the first.

Screens ECHO earlier answers rather than hardcoding the comp's copy. Guard for
the answer being absent (deep links) rather than rendering an empty bubble.

## The vocabulary — what exists, so you don't invent one

Generated from `app/globals.css`, `app/tokens.css` and the components
themselves. If a value here disagrees with the source, the source wins and this
table is stale — say so rather than working around it.

### Type — every piece of text takes one of these classes

| Class | Mobile | Desktop | Weight | Use |
| --- | --- | --- | --- | --- |
| `t-display1` / `-2` | 84/96 · 64/76 | — | 500 | brand surfaces only |
| `t-h1` | 40/48 | — | 500 | not used by any screen |
| `t-h2` | 32/40 | — | 500 | — |
| `t-h3` | 24/32 | — | 500 | — |
| **`t-h4-h3`** | **20/28** | **24/32** | 500 | ⭐ **every page `<h1>`, hub and flow alike** |
| `t-h4` | 20/28 | — | 500 | fixed-size headings |
| `t-h5` | 18/26 | — | 500 | card titles |
| `t-h6` | 16/24 | — | 500 | desktop option-row labels, row titles |
| `t-body1` | 18/28 | — | 400 | — |
| **`t-body2-body1`** | **16/26** | **18/28** | 400 | ⭐ **chat bubbles** |
| `t-body2` | 16/26 | — | 400 | body copy |
| **`t-body3-body2`** | **14/22** | **16/26** | 400 | secondary body |
| `t-body3` | 14/22 | — | 400 | — |
| `t-label` | 14/20 | — | 500 | mobile option-row labels, chips |
| `t-label-sm` | 12/16 | — | 500 | nav labels, tags, meta lines |
| `t-caption` | 12/16 | — | 400 | captions |
| `t-overline` | 13/18 + 1.82px tracking | — | 500 | section labels on data cards |
| `t-button` | 17/22 | — | 400 | `Button` — owns it, don't re-apply |
| `t-button-sm` | 14/22 | — | 400 | `SmallButton` — same |
| `t-metric1` / `-2` | 56/60 · 40/40 | — | 300 | big figures on data cards |

⚠️ **A `-a-b` name means "a on mobile, b on desktop"** — the responsive pair is
one class, never a media query you write. `t-h3-h2` is a real Figma style with
**no caller**; page titles are `t-h4-h3`. See non-negotiable 16.

### Spacing — `--space-*`

`2xs` 2 · `xs` 4 · `sm` 8 · `md` 12 · `lg` 16 · `xl` 20 · `2xl` 24 · `3xl` 32 ·
`4xl` 40 · `5xl` 48 · `6xl` 64 · `7xl` 80 · `8xl` 96 · `9xl` 120

### Radius — `--radius-*`

`none` 0 · `xs` 4 · `sm` 8 · `md` 12 · `lg` 16 · `xl` 20 · `2xl` 24 · `3xl` 32 ·
`full` 999 · `bubble` 30 · `bubble-tail` 1

`2xl` is the data card. `full` is every pill — buttons, chips, the nav, the
tray bar. The two `bubble` values are `ChatBubble`'s and nothing else's.

### Sizes — `--size-*`

Icons `xs` 16 · `sm` 20 · `md` 24 (the default) · `lg` 32 · `xl` 48.
Controls `sm` 36 · `md` 48 · `lg` 62 (the `Button` height).

### Icons — 13 exist, in `components/ui/icons.tsx`

Nav: `MySkinIcon` `ProgressIcon` `CheckIcon` `ProductsIcon`
Chevrons: `ChevronLeftIcon` `ChevronRightIcon` `ChevronDownIcon`
Actions: `PlusIcon` `CloseIcon` `SearchIcon` `CameraIcon` `NoteIcon`
Feedback: `SuccessCheckIcon`

⚠️ **There is no other glyph, and the DS has no more to give.** If a screen
needs one that is not here, that is a gap to raise in Figma — see
`docs/decisions.md`. Size them with a CSS class or `--icon-size`, never
`width`/`height` (non-negotiable 14).

### Components — the props, so you don't read every file

| Component | Props |
| --- | --- |
| `Button` | `variant?: "primary" \| "secondary"`, `fullWidth?`, `href?`, `icon?` + button attrs |
| `SmallButton` | `label`, `arrow?`, `href?`, `className?` + button attrs |
| `Chip` | `label`, `selected`, `control?: "checkbox" \| "radio"`, `onToggle` |
| `OptionRow` | `control: "radio" \| "checkbox"`, `label`, `selected`, `onSelect` |
| `Tag` | `children`, `variant?: "neutral" \| "brand"`, `className?` |
| `TextField` | input attrs + `ref?` |
| `DateField` | `value?: IsoDate`, `onChange`, `id?`, `placeholder?` |
| `SearchField` | `value`, `onChange`, `placeholder?`, `label` (the accessible name — there is no visible `<label>`) |
| `ChatBubble` | `from: "ai" \| "user"`, `align?`, `full?` |
| `Sheet` | `open`, `onClose`, `title`, `children` |
| `DataCard` | `as?`, `className?`, `children?` |
| `CameraCapture` | `captured`, `title`, `helper`, `onCapture` |
| `Orb` | `size?`, `className?`, `animateIn?`, `thinking?` |

`Button` and `SmallButton` apply their own type class. `Chip`'s `control` changes
the ARIA role and nothing visual — read the selection-controls contract below
before reaching for `"radio"`.

### Colour — bind semantic tokens, never a primitive

Groups in `02 Color`: `bg/` `surface/` `text/` `icon/` `border/` `state/`
`feedback/` `gradient/` `button/` `effect/`. The ones you will actually reach
for:

- **Text on light:** `text/primary` `#2e2a3f` · `-secondary` `#4b4b57` ·
  `-muted` `#63636f`
- **Text on a data card:** `text/on-data` `#2e2a3f` · `-secondary` and `-muted`
  both `#354446` — **dark, not white** (non-negotiable 17)
- **Surfaces:** `surface/frost-light` (translucent) vs `bg/frost-light`
  (opaque) — ⚠️ a frost fill ON a frost surface does not read; use the opaque
  one. Same relationship as `surface/frost-nav` → `bg/nav`.
- **Brand:** `bg/brand` `#3b305c` indigo, for selection and accents.
  `gradient/brand` is the SAGE button gradient, not the indigo one.
- **Feedback:** `success` `#5f8a6e` · `warning` `#c9918e` · `error` `#a86561`.
  ⚠️ Warning and error share a hue — **never carry the distinction by colour
  alone**, always pair with a label.

### Entrance reveals — three classes and two data attributes

| Hook | Duration | Use |
| --- | --- | --- |
| `.reveal` | `slow` 320ms | a block arriving with the screen |
| `.reveal-quick` | `base` 200ms | something the user just revealed |
| `.reveal-hero` | `slower` 480ms | the orb and hero entrances |
| `[data-reveal]` | `slow` 320ms | applies the fade to every DIRECT child |
| `[data-reveal-stagger]` | + 0/40/80/120/160ms | stagger those children, capped at the 5th |

All five run the global `lux-fade-in`. The stagger hits **direct children only**,
so a ten-row option list arrives as one block rather than ten cascading rows.

⚠️ **Use these rather than naming an animation in a module** — a module
localizes the `@keyframes` name and it resolves to nothing (motion section
below). A module may safely set `animation-delay`, which carries no name.

For anything not listed — the full 9 collections, the Figma node ids, the
variant structures — read `docs/design.md`.

## Non-negotiables

1. **`app/tokens.css` is generated from the Figma variables.** Treat it as
   generated. Hand-authored overrides go on `:root` in `globals.css`.
2. **Never reference the `01 Primitives` block** (`--color-indigo-*`,
   `--color-sage-*`, …) from a component. Bind to the semantic tokens.
3. **Every piece of text uses a `t-*` class** from `globals.css`, one per Figma
   text style. No ad-hoc `font-size`.
4. **Weights are Light / Regular / Medium only.** `--font-weight-semibold` and
   `--font-weight-bold` exist as tokens but using them is drift.
5. **Buttons: one rule for every style.** Hover runs the gradient END FOR END at
   full strength; disabled fades the whole control to `opacity/disabled` (0.4).
   Applies to `Button`, `SmallButton` and the back button alike.

   | Style | Default | Hover |
   | ----- | ------- | ----- |
   | Primary | `gradient/brand` | `gradient/brand-hover` |
   | Secondary | `gradient/secondary` + 1px `border/default` | `gradient/secondary-hover` |
   | Ghost | no fill | ⚠️ `bg/accent-mint`, a variable no longer in `02 Color` |

   ⚠️ **The reversal only animates because of the `--grad-*` plumbing.** CSS
   cannot interpolate `background-image`; the endpoints are registered
   `<color>` properties in `globals.css`. Motion is `duration/hover` (400ms).
6. **The bottom nav is fixed and identical on every screen**: 24px from the
   bottom, centred, `--z-nav`, 380 wide mobile / 598 desktop. `active="none"` is
   a real state, not a fallback. ⚠️ **FOUR items, not the component's three** —
   `My skin` leads, then Progress, Check, Products. The widths did not change
   and no breakpoint was added; a FIFTH item would exhaust the headroom.
7. **The nav is `surface/frost-nav` `#dbeded @88%` — NOT 17%.** Frosted does not
   mean see-through. `bg/nav` is its opaque counterpart, the **same colour**
   fully opaque (`#dbeded`), and is the `prefers-reduced-transparency` fallback
   — a fallback must not be translucent or a different hue. Same colour as
   `bg/bubble-ai`, so the nav sits on the AI bubble's hue, and `Search Field`
   binds the same token: one frosted-pill surface, two components.
8. **Chat bubbles carry an asymmetric tail corner, and NO border.** Three
   corners at `--radius-bubble` (30), the sender-side corner at
   `--radius-bubble-tail` (1). AI = tail top-left, sits left; user = top-right,
   sits right. A bubble is a **fill plus two shadows**. Frosted _rows_ and
   _cards_ do carry a 1px `border/subtle`; **do not merge the two recipes.**
   ⚠️ **Bubbles are OPAQUE** — `--color-bg-bubble-ai` (#dbeded) and
   `--color-bg-bubble-user` (#cadfdf), a pair on one hue. **Never put a
   translucent surface on a bubble.** Padding 14/18 mobile, 14/22 desktop.
9. **A Figma stroke does not add to a frame's height; a CSS border does.** For a
   FIXED-height row, give it `min-height` and drop the vertical padding. For a
   box whose height is CONTENT-driven, write
   `padding: calc(14px - var(--border-width-hairline))` so it lands on the
   design height in every state.
10. ⚠️ **A GRADIENT + A BORDER NEEDS `background-origin: border-box`.** The
    default sizes the gradient to the padding box while painting it into the
    border box, so the outermost 1px of every edge has no gradient on it and the
    drop shadow shows through as a thin dark notch. Only background IMAGES are
    affected; a flat `background-color` is not.
11. **Frosted surfaces always get a solid `prefers-reduced-transparency`
    fallback**, and a translucent fill always needs its inner shadow or it reads
    flat.
12. **Breakpoints: mobile-first, desktop at `min-width: 1024px`.** Never write a
    440px or 1440px media query — those are the Figma canvas widths.
13. ⚠️ **THE FOCUS RING IS AN `outline`, NOT A `box-shadow`.** CSS Modules load
    after `globals.css`, so at equal specificity a component's own shadow simply
    won and the ring silently disappeared on almost every control in the app. An
    outline is a separate property, composes with any shadow, and follows
    `border-radius`. Never remove it.
14. ⚠️ **AN ICON'S SIZE IS A CSS DEFAULT, NOT AN INLINE STYLE — NEVER PUT
    `width`/`height` BACK IN `icons.tsx`.** An inline style beats an external
    stylesheet rule at every specificity, and it fails silently: eleven module
    rules across nine components sat there looking correct while rendering 24.
    The default lives in `globals.css` as `:where(svg[data-lux-icon])`;
    **`:where()` is load-bearing**, since a bare attribute selector would beat
    the single class it must yield to. An icon whose default is not `md` sets
    `--icon-size` inline — a custom property feeding the rule, not a `width`
    outranking it. No icon needs `!important`.
15. ⚠️ **THE UA `button` PADDING IS `1px 6px`, NOT ZERO.** The global reset
    zeroes it; every LUX button declares its own.
16. ⚠️ **Three type facts the comps and the component notes get wrong:**
    `Size=Desktop` option rows are **58, not 56** (the row hugs vertically, and
    `H6` is 24 where `Label` is 20); desktop chat bubbles are **`Body 1`
    (18/28), not `Body 2`** — use `t-body2-body1`; and **every page title is
    `t-h4-h3`, including a hub's**, which the comps draw one step larger.
17. ⚠️ **SURFACE SYSTEM B's TEXT IS DARK, NOT WHITE.** `surface/data` composites
    too light for white text at any alpha — measured, it failed WCAG AA on 38 of
    59 text nodes on `/check/results`. `text/on-data` is `#2e2a3f` and
    `-secondary`/`-muted` share `#354446`; hierarchy is carried by size, weight
    and tracking. Redefined on `:root` in `globals.css`. Still white,
    deliberately: the `border/glass` divider and the check-in discs'
    `text/on-brand`. Two sheets opt back out and both fail — flagged in their
    own files. Known-failing and awaiting a Figma decision: `gradient/brand`'s
    white button label, `CompatCard`'s band pills, `ResultCards`' emphasis
    block. ⚠️ **`#a2b9bf` is a chosen design value — do not "improve" it toward
    a passing one without asking.**

## Two surface systems — do not mix them

- **SYSTEM A — forms.** GETTING STARTED, PRODUCTS and CHECK. Light frosted rows
  and cards, dark text, a 1px `border/subtle`.
- **SYSTEM B — readouts.** PROGRESS, plus CHECK's skin-profile strip and tray.
  `surface/data` + `surface/frosted-data` + `radius/2xl`, padding 20 mobile /
  24 desktop, **NO stroke**. A divider inside one is `border/glass`, never
  `border/subtle`. Accents are indigo `bg/brand`. `components/ui/DataCard.tsx`
  is the whole recipe; use it.

⚠️ **A sage card inside a light card is a LUX pattern; the reverse is not.** A
nested emphasis block is `surface/data-strong`.

## Selection controls — the shape is the contract

Not a style choice. It maps to the ARIA role and screen readers announce them
differently.

| Control | Shape | Cardinality | Role |
| ------- | ----- | ----------- | ---- |
| Radio row | circle | exactly one | `role="radio"` |
| Checkbox row | square | zero or more | `role="checkbox"` |
| Chip | pill | zero or more, short labels | `role="checkbox"` |
| Chip (radio) | pill | exactly one, SHORT ORDINAL SCALE only | `role="radio"` |

⚠️ **THE RADIO CHIP BENDS THIS TABLE AND IS SCOPED ON PURPOSE.** It exists for
ONE case — the daily check-in's five-point scale — and the caller MUST supply a
real `role="radiogroup"`. Do not reach for it to make an ordinary multi-select
tidier. **Raise a single-select Chip variant in Figma** rather than widening it.

**Exclusive options** ("None", "Not sure", "Prefer not to say") stay
**checkboxes** and keep `role="checkbox"`. Selecting one clears every other box;
selecting a normal option clears the exclusives. Never swap them to radios —
mixing shapes in one group tells the user the whole group is single-select.
`EXCLUSIVE_OPTIONS` is the only place exclusivity is declared; an option missing
from it toggles like an ordinary one and the bug is invisible in the screen.

## Motion — board 04b (389:200)

"LUX motion is calm. Nothing snaps."

| Token | Value | Use |
| ----- | ----- | --- |
| `--duration-fast` | 120ms | hover, focus, small colour changes |
| `--duration-base` | 200ms | selection, chips, rows, toggles |
| `--duration-slow` | 320ms | sheets, overlays, page-level reveals |
| `--duration-slower` | 480ms | orb and hero entrances |

`--ease-standard` is the default for anything that enters and settles.

- **Pressed never uses a transform** — "LUX does not bounce." Overlay
  `state/pressed-overlay` at 14% instead.
- ⚠️ **The rule that NAMES an animation must live in `globals.css`, never in a
  CSS Module.** Modules localize `@keyframes` names, so `animation: lux-fade-in`
  inside a module resolves to nothing while still reporting a duration in
  `getComputedStyle`. Use the `[data-reveal]` / `[data-reveal-stagger]` hooks. A
  module may safely set `animation-delay`, which carries no name.
- ⚠️ **Reveals use `animation-fill-mode: backwards`, NOT `both`.** `both` adds
  `forwards`, and an opacity animation still in effect leaves a **persistent
  stacking context** — every revealed block then paints in DOM order regardless
  of `z-index`. That is how the date picker ended up behind the radio rows.
- **Anything that opens a popover gets `position: relative; z-index: 1`** on its
  own block.
- **Wrap every `:hover` rule's counterpart in `@media (hover: none)`** so the
  state does not stick after a tap.
- `prefers-reduced-motion` already collapses all durations globally; don't
  special-case it per component.
- ⚠️ **A "stuck" transition in a preview pane is almost always the HIDDEN TAB,
  not your CSS.** Chromium freezes rAF and CSS transitions when
  `document.visibilityState === "hidden"`. **Verify motion with
  `element.getAnimations()`** — assert the animation exists with the expected
  duration, call `.finish()`, then check the end state. Do not sleep and re-read
  `getComputedStyle`.

## Translate, don't transcribe

The Figma frames are fixed-height canvases (440x957, 1440x900). Their internal
spacer frames are artefacts of those heights. Express the _intent_ in CSS —
flex, `100dvh`, `clamp()` — and keep the tokens exact. Component sizes, radii,
type and colour must match Figma to the pixel; page-level whitespace adapts.
Mobile frames pad 58 at the top; the build uses 40 everywhere.

## Every route is a page, and the app has to say so

**⚠️ A NEW ROUTE NEEDS A `metadata` EXPORT, AND IT IS NOT OPTIONAL.** All
seventeen routes once rendered `<title>LUX</title>`. That is a WCAG 2.4.2 (level
A) failure on its own, but it costs more than the tab label: **a title is the
only sentence available to announce a client-side navigation.**

`lib/pageTitles.ts` owns them. A flow step takes its title from `flow.ts`; a hub
route gets an entry in `HUB_TITLES`. Then the page exports
`export const metadata: Metadata = { title: metadataTitleFor("/its/path") };`.
The one dynamic route matches a regex and uses `generateMetadata`. A title names
the KIND of page, never its content — "Check-in record", not the date on screen.

**⚠️ THE APP ROUTER ANNOUNCES NOTHING AND MOVES NO FOCUS — `RouteAnnouncer`
DOES BOTH.** (The route announcer people remember is the Pages Router's; the App
Router ships none.) It is mounted once in `app/layout.tsx` and needs nothing
from a screen except that it render a `<main>`. It reads `titleFor`, not
`document.title` — Next writes the tag at its own moment in the commit, and
losing that race announces the screen the user just left.

**⚠️ `main[tabindex="-1"]:focus` IS THE ONE PLACE THE RING IS TURNED OFF**, in
`globals.css`. **No interactive control ever gets this rule.**

## Before you call a screen done

- `npm run build` and `npm run typecheck` both clean.
- Compare against the Figma frame at 440 and at 1440.
- Check computed values in the browser rather than eyeballing a screenshot.
- Keyboard: focus is visible on every interactive element, as an `outline`.
- The route exports `metadata` from `lib/pageTitles.ts`.
- **An ARIA `role` that takes a NAME needs one.** `role="progressbar"` takes its
  name from a label and never from its value; `aria-valuetext` says where a
  thing has got to, not what it is. axe calls this `aria-progressbar-name`, and
  it fired serious on all five flow screens until `StepProgress` got an
  `aria-label`.
- Contrast: ⚠️ **do not trust a clean axe run.** Every screen sits on the canvas
  gradient, so `color-contrast` degrades to INCOMPLETE — never to a violation —
  the moment a background is a gradient or a stack of translucent fills. All 17
  routes report zero contrast violations with known failures on screen. Measure
  by compositing the fill stack by hand and sampling the gradient at the
  element's own position; one representative surface is not enough.
