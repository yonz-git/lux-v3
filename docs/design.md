---
version: alpha
name: LUX v3
description: Glass over a pale sage canvas, one indigo, Urbanist, round controls — the system every lux-v3 screen is built from.
colors:
  primary: "#313560"
  primary-start: "#485780"
  primary-hover: "#242750"
  primary-soft: "#7980AF"
  on-primary: "#FFFFFF"
  canvas-start: "#E2EDF1"
  canvas-mid: "#D3E4E7"
  canvas-end: "#B1CAD2"
  canvas-end-desktop: "#BDD6DD"
  on-surface: "#2E2A3F"
  on-surface-secondary: "#4B4B57"
  on-surface-muted: "#63636F"
  glass: "#FFFFFF40"
  glass-strong: "#FFFFFF66"
  glass-edge: "#FFFFFF8C"
  glass-rim: "#FFFFFFCC"
  panel: "#F4FEFF4D"
  panel-edge: "#FFFFFF73"
  panel-rim: "#FFFFFF99"
  nav-bar: "#FFFFFF1A"
  nav-edge: "#FFFFFF66"
  nav-item: "#FFFFFF1F"
  sheet: "#8AB0B24D"
  data-deep: "#4F838FD9"
  progress-track: "#ECF8F9CC"
  outline: "#2E2A3F2E"
  success: "#5F8A6E"
  success-ink: "#46664F"
  warning: "#C9918E"
  error: "#C65953"
  symptom: "#D3858A"
typography:
  headline:
    fontFamily: Urbanist
    fontSize: 36px
    fontWeight: 300
    lineHeight: 44px
    letterSpacing: -0.005em
  headline-emphasis:
    fontFamily: Urbanist
    fontSize: 36px
    fontWeight: 700
    lineHeight: 44px
    letterSpacing: -0.005em
  kicker:
    fontFamily: Urbanist
    fontSize: 16px
    fontWeight: 400
    lineHeight: 20px
  wordmark:
    fontFamily: Urbanist
    fontSize: 20px
    fontWeight: 700
    lineHeight: 24px
    letterSpacing: 0.005em
  h2:
    fontFamily: Urbanist
    fontSize: 28px
    fontWeight: 400
    lineHeight: 34px
  page-title:
    fontFamily: Urbanist
    fontSize: 22px
    fontWeight: 400
    lineHeight: 28px
  h4:
    fontFamily: Urbanist
    fontSize: 20px
    fontWeight: 400
    lineHeight: 24px
  panel-label:
    fontFamily: Urbanist
    fontSize: 18px
    fontWeight: 400
    lineHeight: 22px
  row-title:
    fontFamily: Urbanist
    fontSize: 16px
    fontWeight: 500
    lineHeight: 20px
  body-lg:
    fontFamily: Urbanist
    fontSize: 18px
    fontWeight: 400
    lineHeight: 24px
  body:
    fontFamily: Urbanist
    fontSize: 16px
    fontWeight: 400
    lineHeight: 22px
  body-sm:
    fontFamily: Urbanist
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  chip:
    fontFamily: Urbanist
    fontSize: 16px
    fontWeight: 400
    lineHeight: 20px
  label:
    fontFamily: Urbanist
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
  button:
    fontFamily: Urbanist
    fontSize: 15px
    fontWeight: 500
    lineHeight: 20px
  button-sm:
    fontFamily: Urbanist
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
  label-sm:
    fontFamily: Urbanist
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
  caption:
    fontFamily: Urbanist
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  overline:
    fontFamily: Urbanist
    fontSize: 12px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0.12em
  metric-lg:
    fontFamily: Urbanist
    fontSize: 56px
    fontWeight: 300
    lineHeight: 60px
    fontFeature: '"tnum"'
  metric-md:
    fontFamily: Urbanist
    fontSize: 40px
    fontWeight: 300
    lineHeight: 40px
    fontFeature: '"tnum"'
rounded:
  none: 0px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  media: 22px
  2xl: 24px
  panel: 28px
  3xl: 32px
  sheet: 36px
  sheet-foot: 44px
  full: 999px
spacing:
  2xs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  2xl: 24px
  3xl: 32px
  4xl: 40px
  5xl: 48px
  6xl: 64px
  7xl: 80px
  8xl: 96px
  9xl: 120px
  group: 4px
  inset: 8px
  gutter: 24px
  panel: 32px
  section: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: 0 24px
    height: 56px
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: 0 24px
    height: 56px
  button-primary-disabled:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: 0 24px
    height: 56px
  button-secondary:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.on-surface}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: 0 24px
    height: 56px
  button-secondary-hover:
    backgroundColor: "{colors.glass-strong}"
    textColor: "{colors.on-surface}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: 0 24px
    height: 56px
  button-small:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.on-surface}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.full}"
    padding: 0 16px
    height: 36px
  button-small-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.full}"
    padding: 0 16px
    height: 36px
  icon-button-glass:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    size: 56px
  icon-button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    size: 56px
  icon-button-outline:
    backgroundColor: "#00000000"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    size: 56px
  back-button:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    size: 48px
  chip:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.on-surface-secondary}"
    typography: "{typography.chip}"
    rounded: "{rounded.full}"
    padding: 0 18px
    height: 44px
  chip-hover:
    backgroundColor: "{colors.glass-strong}"
    textColor: "{colors.on-surface-secondary}"
    typography: "{typography.chip}"
    rounded: "{rounded.full}"
    padding: 0 18px
    height: 44px
  chip-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.chip}"
    rounded: "{rounded.full}"
    padding: 0 18px
    height: 44px
  option-row:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: 0 20px
    height: 56px
  option-row-selected:
    backgroundColor: "{colors.glass-strong}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: 0 20px
    height: 56px
  tag:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.on-surface-secondary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 0 12px
    height: 26px
  tag-brand:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 0 12px
    height: 26px
  text-field:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: 0 20px
    height: 56px
  search-field:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: 0 16px
    height: 56px
  sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sheet}"
    padding: 8px 8px 24px
  sheet-close:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    size: 56px
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.panel}"
    padding: 32px 24px 24px
  nav-bar:
    backgroundColor: "{colors.nav-bar}"
    rounded: "{rounded.full}"
    padding: 6px
    height: 70px
  nav-item:
    backgroundColor: "{colors.nav-item}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    size: 56px
  nav-item-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 0 20px 0 18px
    height: 56px
  step-progress-track:
    backgroundColor: "{colors.progress-track}"
    rounded: "{rounded.full}"
    height: 4px
    width: 80%
  step-progress-fill:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.full}"
    height: 4px
  trend-chart:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.panel}"
    padding: "{spacing.gutter}"
  trend-band:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    height: 44px
  trend-event:
    backgroundColor: "{colors.glass-strong}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 4px 10px
  calendar-day:
    textColor: "{colors.on-surface-secondary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    size: 36px
  calendar-day-checked:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    size: 36px
  calendar-day-today:
    backgroundColor: "{colors.glass-strong}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    size: 36px
  score-card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.2xl}"
    padding: "{spacing.lg}"
  score-ring:
    textColor: "{colors.on-surface}"
    typography: "{typography.h4}"
    size: 64px
  score-band-pill:
    backgroundColor: "{colors.glass-strong}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 0 10px
    height: 24px
---

# LUX v3 Design System

## Overview

LUX is an AI-guided skincare investigation app: people record what their skin
is doing, list the products they use, and get a careful, non-diagnostic
reading of what might be associated with a reaction. They use it on a phone,
briefly, often daily, sometimes while their skin is uncomfortable, so it has to
feel **calm, clear and trustworthy**. The look comes from the VidGen
references (`~/Claude/vidgen/index.html`, `~/Claude/vidgen-studio/index.html`):
glass controls over a pale sage canvas, round buttons, light headlines with the
key words in bold. The canvas gradient and the indigo are lux-v2's own; the
references' glows and dark ground were tried and dropped.
It must never look clinical (white, grey, cold), never look like a video tool
(lilac glows, dark editor chrome), and never shout (more than one primary
action, bright fills).
The values here are mirrored in code: `app/tokens.css`, `app/globals.css`, and
`app/vidgen.css` (loaded last, so it wins), plus the components in
`components/ui/` and `components/layout/`. `docs/design.html` shows this file
rendered; `/styleguide` shows the real components live. If the code and this
file disagree, fix whichever is wrong in the same change, never one alone.

## Colors

One brand colour, `primary` `#313560`, does every job that means "this one":
the primary action, a selected chip, a checked-in day, a nav item you are on.
The primary action paints it as a left-to-right gradient from `primary-start`
`#485780`, which reverses on hover; `primary-hover` `#242750` is the dark end
of a selected chip's shade. The ground is the canvas gradient
(`canvas-start` → `canvas-mid` → `canvas-end`, at 165° on mobile and 136° to
`canvas-end-desktop` on desktop).
Everything that sits on the canvas is made of white at low strength: `glass`
(25%) for controls, `glass-strong` (40%) for hover and a selected row, a 1px
`glass-edge` (55%) and a `glass-rim` highlight along the top. Boxes are
`panel` (`#F4FEFF` at 30%, with a 45% `panel-edge` and a 60% `panel-rim`) and
the `sheet` (lux-v2's sage tray at 30%). The panel was 55% until the canvas
review called it "too white and bright"; every card now draws 30% — the
question panels, and `DataCard` on Progress and Check. The nav is lighter still: a 10%
`nav-bar` with a 40% `nav-edge`, its circles `nav-item` at 12%. There is no
opaque white fill anywhere.
Text is `on-surface` `#2E2A3F`, with `on-surface-secondary` for chip labels
and supporting copy and `on-surface-muted` for captions; all three clear WCAG
AA on glass over the canvas (secondary measures about 5.8:1 at the darkest end
of the canvas). White on the primary gradient measures 5.65:1 at its light end
and 11.6:1 at its dark end.
`success`, `warning` and `error` are fills only — dots, rings, bars — and
always travel with a word, because `warning` and `error` share a hue. Green
TEXT uses `success-ink` (`success` is 3.3:1 as 12px text, `success-ink` 5.4:1).
The compatibility bands map to them: Compatible = `success`, Risky =
`warning`, Avoid = `error`. Alpha colours are written `#RRGGBBAA`.

## Typography

Urbanist is the only typeface: a geometric sans that stays soft at light
weights, which is what lets a 36px Light headline feel calm rather than thin.
Five weights are loaded (300–700). The hierarchy is carried by size and weight,
not colour.
`headline` (36/44 Light) opens a welcome or empty state, with its key words in
`headline-emphasis` (Bold, in `primary`), under a `kicker` (16/20). Every page
`<h1>` is `page-title` (22/28 Regular), on every page and both breakpoints;
sheet titles use it too. Inside panels, `panel-label` (18/22) names the panel,
`overline` (12/16 SemiBold, tracked, capitals) labels a readout, and
`metric-lg` / `metric-md` (Light, tabular figures) carry the number.
Body copy is `body` (16/22); `body-sm` (14/20) supports it. Controls have
their own styles so their widths stay stable: `chip` (16/20 Regular), `label`
(14/20 Medium) for tabs, nav and row labels, `button` (15/20 Medium) and
`button-sm` (14/20 Medium). `label-sm` and `caption` (12/16) are the floor —
nothing smaller, ever.
In code each style is a `t-*` class (`t-headline`, `t-h4-h3`, `t-body2`,
`t-chip`…); a screen never writes a font-size. Headings balance their lines
and prose avoids orphans automatically.

## Layout

The spacing scale runs 2 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 ·
96 · 120. Reach for the five roles first; they are the gaps the references
actually use: `group` (4) between controls in one cluster, `inset` (8) from a
sheet's edge to the panel inside it and from the screen edge to a floating
sheet, `gutter` (24) for screen side margins and a panel's side padding,
`panel` (32) for a panel's top padding and its padding on desktop, `section`
(48) between unrelated groups.
Inside a panel the rhythm is label → 20 → body → 20 → controls → 44 → the
round-button row. Density is comfortable, never tight: fields and round
buttons are 56 tall, answer chips 44 (the touch floor), and they sit 4 apart,
which reads as one group with room to tap.
A question screen runs: 24 from the top, the header row, 16, the progress
track, 24, the centred step title, 24, the step's panels 24 apart, 24, then
Continue. Continue follows the content; it is not pinned to the bottom.
Mobile is the design frame (390–440 wide); desktop starts at 1024 and caps the
content column (question screens at 640). Breakpoints are mobile-first; never
write a 440 or 1440 query.
The bottom nav floats 16 above the screen edge (24 on desktop) and every
screen reserves clearance for it.

## Elevation & Depth

Depth comes from glass, not shadows. A surface is lifted by its fill
strength, its 1px `glass-edge` and the white highlight along its top edge
(`inset 0 1px 0`, 80% on glass, 90% on panels), over a `backdrop-filter` blur
(10px on glass, 12px on panels) that keeps the canvas visible through it.
Real drop shadows are reserved for two things: the primary action
(`0 8px 18px` indigo at 30%, plus a 25% white top highlight), which is what
makes it read as the one thing to press, and the sheet (`0 14px 30px` at 35%),
which sits above everything. Glass never goes on glass; a panel can hold glass
controls because a panel is a frost box, not glass.
Every translucent surface has a solid fallback under
`prefers-reduced-transparency`.

## Shapes

Everything a finger touches is round. Buttons, chips, tags, fields and the nav
are full pills (`full`); round buttons are circles. Boxes are generously
rounded and step down as they nest: the sheet is `sheet` (36) at the top and
`sheet-foot` (44) at the bottom, following a phone's own corners; a panel
inside it is `panel` (28); score cards are `2xl` (24); photos are `media`
(22); option rows are `lg` (16). Nothing is square, and no corner is
sharper than its container's.

## Components

**Buttons.** `button-primary` is the one primary action on a screen: 56 tall,
the primary gradient, the brand shadow, white `button` label. Hover runs the
gradient end for end over 400ms; pressed adds a 14% dark overlay (never a
scale); disabled fades the whole control to 40%. `button-secondary` is glass.
`button-small` is the 36-tall glass pill for `Save & exit` and similar; a
leading glyph takes `primary`. `button-small-primary` is the same pill in flat
`primary` for a small action that commits, such as step 1's `Save`.
**Round buttons.** `icon-button-glass` (`+`, camera, note), `icon-button-primary`
(the indigo circle for submit or continue) and `icon-button-outline` (back on a
bare canvas) are 56 circles; `back-button` in a page header is a 48 glass
circle with the arrow. Every one has a written accessible name.
**Selection.** `chip` answers a question: glass, 44 tall, an optional leading
glyph in `primary`; `chip-selected` is the primary colour shading to
`primary-hover`, white label and glyph. A single-select chip group needs a real
radiogroup. `option-row` is for longer answers; selected firms the edge to
`primary` over `glass-strong`. `tag` is read-only; `tag-brand` marks something.
**Fields.** `text-field`, `search-field` and the date field are glass pills,
56 tall.
**Question panel.** Every investigation question is a `panel` padded
32/24/24: the question as a `panel-label` led by the sparkle glyph, an
optional hint in `body-sm`, then its answers 20 below — chips in a wrapping
row 4 apart, or option rows 8 apart. Two questions on one step are two panels.
**Sheet and panel.** Every overlay is the `sheet`: sage frost, 36/44 corners,
floating `inset` in from the screen on mobile, a title row of the LUX orb
(50px) + `page-title` + a `sheet-close` glass circle, and a `panel` inside it.
`panel` is also every card and readout.
**Bottom nav (built).** `nav-bar` is a glass pill holding four `nav-item`
glass circles (My skin, Progress, Analysis, Products); the current section is
`nav-item-active`, which stretches into an indigo pill with its glyph and
`label`. The others show the glyph only and carry the section name as their
accessible name. With a section active the bar runs the phone's width, 8 in
from each side; with none (Welcome) it hugs its circles, centred. Desktop
always hugs.
**Welcome (kept from lux-v2).** The orb, the reply bubble, the 62-tall
`Create skin profile` button and the disclaimer stay where v2 had them; only
the nav is new.
**Step progress (decided: lux-v2's).** A 4px `step-progress-track` at 80% of
the column (400 on desktop) with a `primary` `step-progress-fill`; the fill
grows from the step you came from.
**Trend chart (built).** In a `trend-chart` panel: an `overline`
("Symptoms · last 14 days"), a one-line reading in `panel-label` ("From
moderate to mild in 10 days"), then a smooth 2px `primary` line over three
EQUAL `trend-band` stripes labelled Mild, Moderate, Severe; a dashed line and a
`trend-event` pill mark when a product started; every day of the 14 is
labelled under the chart, today in `primary` SemiBold, the months named at the
left. The x axis is the calendar, so a day without a check-in is a gap. The
bands fold the check-in's five severity words into three — Clear and Mild,
Moderate, Severe and Very severe — with edges at 3.5 and 6.5, so a dot's band
is always the word its record uses.
**Calendar (built).** A Monday-first month grid in a `panel` — the date
picker's week, so the app has one: month name and two 44 glass arrows, weekday
initials, `calendar-day-checked` indigo discs (each a link to its record),
a 1.5px `primary` ring on `calendar-day-today`, plain `calendar-day` numbers
otherwise and muted ones for days still to come; a legend names both marks.
**Score cards (built).** A grid of `score-card`s, two to a row under an
`overline`: a 64px `score-ring` (band-coloured arc on a white track, the score
in Light), the product name and brand, and a `score-band-pill` with a
band-coloured dot and the band word — on every card, since Risky and Avoid
differ only in lightness. The whole card is a button; its detail (the bar,
the risky ingredients, the recommendation) opens in the `sheet`. A product not
yet analysed is the same card with an empty ring and a `tag`.
**Face diagram (kept from lux-v2).** The face card follows step 1's panel; a
picked region is v2's teal glass (`#13758C` at 89%).
**The other pages (built, 1 Oct 2026 — the pages round).** The routes with no
canvas board were moved onto this vocabulary, with no new shape:
- every card is the `panel` — DataCard, the skin-profile card, the face and
  gallery cards, the recap's blocks (`canvas-card` is the panel now), the
  calendar (its sheet-sage override is gone);
- every row that is a box is the `panel` at 24 — the Products hub's groups,
  `/check/new`'s product rows, `/check/history`'s rows; a card inside one of
  those boxes is `glass` at 16;
- the skin profile's answers are read-only `glass` pills, 32 tall (a control
  is 44), dark ink; card overlines are `overline` at its own size;
- the deep-sage tier is gone: the add-product tiles, the basket rows and the
  results' emphasis block are `glass` with dark ink; the basket bar is the
  panel floating with the nav's shadow;
- the check-in's answers are plain chips.
Chat (bubbles, the check-in panel) stays v2's, as Welcome does.
**Not designed yet:** the undo bar, the safety notice, the analysing state,
the empty states — reskinned only by the tokens they already read.

## Do's and Don'ts

**Do**
- Do take every value from a token, a role or a component; a new look means a
  new token here and in `app/vidgen.css` first.
- Do keep one primary action per screen, and make "selected" the primary
  colour every time.
- Do use glass for controls and panels for boxes, each with its edge and top
  highlight.
- Do pair every status colour with a word (band pills, legends).
- Do give every control a target of at least 44 and a visible focus outline.
- Do check a screen at 390/440 and at 1440, and measure contrast on the real
  pixels before calling it done.

**Don't**
- Don't use an opaque white fill — not on a tag, a button, a card or a close
  button.
- Don't add gradients beyond the canvas and the primary gradient; no glows, no
  dark ground.
- Don't set text below 12px, or a weight outside the five loaded.
- Don't put glass on glass, or a solid card on the canvas.
- Don't draw an icon inline on a screen or size it with width/height; use
  `components/ui/icons.tsx` and `--icon-size`.
- Don't show a percentage or score on the investigation analysis — confidence
  there is a word. Scores belong to compatibility checks only.
