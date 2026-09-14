# LUX — Figma catch-up

Changes the LUX Figma file needs so it matches what shipped.

- **File:** `wIftBhzkn8E4wjZwgdH71n`
- **Screens page:** `06. Screen Designs` (`453:2252`)
- **Sections built:** my-skin, products, progress, check · 18 routes
  (17 + `/chat`, the prototype-only conversation panel — see section 7)

Contrast figures below are hand-composited against the canvas gradient at each
element's own position. Automated tooling reports none of them: every screen
sits on a gradient, so `color-contrast` degrades to INCOMPLETE rather than to a
violation. All 17 routes report zero contrast violations with these failures on
screen.

---

## 1. Token fixes — `02 Color`

Variable-level bugs. The code already overrides all of them on `:root` in
`globals.css`, so the build is accessible and Figma is not.

### `text/on-data` — white text on a data card fails at every alpha

- **Now:** `#ffffff`
- **Change to:** `#2e2a3f` (the app ink) — 6.28:1 to 8.12:1
- Measured on `/check/results`: **38 of 59 text nodes fail.** Overlines and 12px
  stat labels at **1.49:1**, body and metrics at **1.86:1**, against 4.5:1.
- `surface/data` is `#7da7a9 @44%`, compositing to ≈rgb(170,194,198). Even at
  100% opacity that hue gives white only **2.63:1** — no alpha passes.
- Darkening the text is the only fix that keeps the sage card. The alternative
  is a dark-sage surface, i.e. redesigning Surface System B.

### `text/on-data-secondary` and `text/on-data-muted` — collapse both to one value

- **Now:** `rgba(255,255,255,.85)` and `rgba(255,255,255,.62)`
- **Change both to:** `#354446` (sage-tinted) — 4.61:1 to 5.97:1
- The tiers cannot be rebuilt from alpha: the muted tier styles 12–13px
  **labels**, so it must also clear 4.5:1, and the ink at 82% already fails at
  **4.43:1**.
- Hierarchy moves to size, weight and the overline's tracking — where it mostly
  lived anyway.

### `text/muted` — aliases `neutral-400`, two steps too light

- **Now:** `#9a9aa5` (via `neutral-400`) — measures **2.13:1 to 2.57:1**
- **Change to:** `#63636f` — 4.54:1 to 5.47:1
- Lands on product row meta lines, `DateField`'s "Select a date", the Products
  hub's windows and counts, the check history's counts — at 12–16px, where the
  large-text allowance never applies.
- The darkest of the three surfaces has to set the value.

### `border/glass` as the calendar *Today* ring — SC 1.4.11 failure

- **1.44:1** on `surface/data`, where non-text contrast wants 3:1.
- Today carries no other indicator, so the state does not render at all for a
  low-vision reader.
- Give Today a second signal or a darker ring. The `border/glass` divider
  *inside* a data card stays white and is fine — it is decorative.

### `bg/accent-mint` — dangling reference

- Button **Ghost / Hover** (`37:19`) still points at `bg/accent-mint`, which no
  longer exists in `02 Color`.
- Restore the variable or repoint the variant. No screen currently uses Ghost,
  so this is safe to settle either way.

### `surface/frost-nav` and `bg/nav` — already fixed in Figma, listed for the record

⚠️ **No action needed — verified against `design.md`, which records this settled
22 Aug 2026.** Kept here only so the value is not "corrected" back.

- **Surface:** `#dbeded @88%`. It was `#dde8eb @83%`, and before that 17% —
  barely a tint, so the Continue button and the last option rows read straight
  through the bar.
- **Fallback (`bg/nav`, for `prefers-reduced-transparency`):** `#dbeded` fully
  opaque. It was `#9caeaf @55%` — a different hue *and* still translucent, which
  is not a fallback at all.
- Same colour both times; only the alpha differs. It is also `bg/bubble-ai`'s
  colour, so the nav sits on the AI bubble's hue, and `Search Field` (`248:70`)
  binds the same token.
- ⚠️ **SUPERSEDED FOR THE BAR ONLY, 13 Sep 2026 — action needed.** Asked for
  directly: `Bottom-Nav-Bar` (`410:258`) fills with `#17292f @26%` (code:
  `--color-surface-nav-bar`; it was `#356472 @69%` for a few hours), falls
  back to `#859ca3` opaque (`--color-bg-nav-bar` — the fill as it composites
  over the canvas, since `#17292f` opaque would be near black), and its labels
  go white. Add both as
  variables and repoint the component's fill and ink; leave `surface/frost-nav`
  alone, since `Search Field` and the other frosted pills still bind it. The
  bar also gains a 1px edge ring lit top-left (white 48% → 0 → 20%
  bottom-right) and a 5% noise grain; Figma can approximate the ring with a
  gradient stroke and has no equivalent for the grain. ⚠️ **And it is now
  TEXT-ONLY and 65 tall**: no icons, labels 16 Light (a new text style) with the active one at Regular
  and a soft drop shadow (`#17292f` @60%, y 1, blur 6) under every label,
  inactive items at 85% opacity and the active one in a pill of
  `state/pressed-overlay` — raise that as a `state/selected` token — recessed
  by two inner shadows (`#17292f` @35% y 1 blur 3, white @12% y −1). The
  component's `Size` heights move 75 → 65.

### `bg/bubble-ai` and `bg/bubble-user` — opaque, holding values directly

- `bg/bubble-ai` = `#dbeded`, `bg/bubble-user` = `#cadfdf`. Changed 22 Aug 2026.
- A pair on one hue (G == B on both), differing only in lightness. They alias no
  ramp.
- They were built on `surface/frost-light @55%`, which let the canvas gradient
  through — so a bubble low on a screen rendered darker than one near the top.
- **Never put a translucent surface on a bubble.**

### No scrim token exists

- `state/pressed-overlay` at 14% is the only darkening value LUX has, and it is
  far too weak for a modal: measured behind the check basket, the bar reads
  **1.93:1** and the sheet **1.64:1 to 2.13:1**.
- Add a real scrim value. Every tray in the file currently hand-composes one.

### `surface/data-strong` — 62% with no opaque counterpart

- `bg/nav` is the solid twin of `surface/frost-nav`; `surface/data-strong` has
  no equivalent, so the reduced-transparency path composites the sage over
  `bg/canvas` by hand.
- ⚠️ **`surface/data-deep` has the same gap and it now matters more**, since
  four surfaces depend on that one and all of them put white text on it. See
  section 2.

### `surface/card-desktop` — 55% → ~19% in code (12 Sep 2026)

- The in-page desktop card (`HubScreen`'s `card` layout, `QuestionScreen`'s
  card) was asked lighter and more transparent: `#edf8fb30` on `:root` in
  `globals.css`, same hue as Figma's `#edf8fb @55%`. **Set the variable's alpha
  to 19% in Figma.** Floating `Sheet` trays are a separate literal and did not
  move.

### `::selection`, `caret-color`, `accent-color` — Figma cannot hold these

⚠️ **NEW 8 Sep 2026. Nothing to change in Figma; listed so nobody files it as
drift.** A comp has no text selection, no caret and no OS date picker, so all
three shipped at the browser default — a Windows-blue highlight, a black caret
and a blue native picker, on a page where nothing else is blue. All three now
bind `bg/brand` in `globals.css`, the same indigo LUX already uses for every
selection it *does* draw. Selection text takes `text/on-brand` (11.91:1).

If Figma ever grows a "browser chrome" note, this is its content.

### `feedback/warning` and `feedback/error` — RETUNED IN CODE 8 Sep 2026

⚠️ **Figma still holds `rose/500` #c9918e and `red/500` #a86561.** The code
overrides all **five** semantic roles that alias those two steps, on `:root` in
`globals.css`. The primitives themselves are untouched, deliberately — the same
call the `bg/brand` entry in § 2 makes: a primitive is not a role, and naming
the roles keeps divergence possible.

| Role | Figma | Code | Caller |
| ---- | ----- | ---- | ------ |
| `feedback/error` | `#a86561` | **`#c65953`** | the Avoid band pill, ×3 places |
| `feedback/warning` | `#c9918e` | **`#d47873`** | the Risky band pill, ×3, and the analysis's Stronger pill |
| `text/error` | `#a86561` | **`#c65953`** | the **Remove** action on `ProductAccordionCard` |
| `text/warning` | `#c9918e` | **`#d47873`** | none in the build |
| `border/error` | `#a86561` | **`#c65953`** | none in the build |

- ⚠️ **The last three moved a turn later than the first two, and the first
  pass's reasoning for leaving them behind was withdrawn.** That reasoning was
  that a destructive control is not a compatibility band; the decision is that
  LUX gets ONE red rather than a band red and a control red six points of
  saturation apart — the same argument that collapsed `bg/brand` onto the
  button gradient's dark end.
- The two roles with no caller move anyway, so a first caller inherits the red
  the app uses rather than the one Figma holds.
- The `-subtle` tints (`rose/100` `#f4e7e6`, `red/100` `#f5e7e6`) did **not**
  move. Only `CompatCard`'s tinted tag reads them and they are near-neutral
  either way.

- Asked for directly. Both moved together because Avoid and Risky are one
  scale: the old pair was a dusty red beside a dusty rose 6 points of
  saturation apart, so the two bands read as different families rather than as
  two rungs of one.
- The new pair is **one hue at 3.1°**, differing in lightness (55.1% / 64.1%)
  with saturation nearly matched (50.2% / 53.0%).
- ⚠️ **Which makes the note below literally exact rather than approximate:**
  they differ only in lightness, so as pill **fills** Risky and Avoid are not
  distinguishable — the pill's text is doing all the work. Separate the hues,
  or accept that the label is load-bearing and document it. The build accepts
  it: `check.ts` states the band in text on every row and in an `aria-label`
  on all of them, including the compatible ones.

### `text/success-ink` — a NEW role, because the one green is a fill

⚠️ **`02 Color` ships a single green.** `feedback/success` and `text/success`
both alias `green/500` #5f8a6e, which is right as a fill or a rule and fails as
text: measured by compositing on the analysis screen's `Evidence against this
explanation` count — 12px, `t-label-sm` — it is **3.28:1 at 440** and **3.63:1
at 1440** on the light frosted card, against AA's 4.5:1.

| Role | Figma | Code | Caller |
| ---- | ----- | ---- | ------ |
| `feedback/success` | `#5f8a6e` | unchanged | the cleared block's 4px rule, every green fill |
| **`text/success-ink`** | — | **`#46664f`** | `Disclosure[data-tone="against"]`'s count |

- Measures **5.36:1** at 440, **5.93:1** at 1440, and **4.94:1** on the darkest
  frosted card the app puts a disclosure on. Same hue family, ink weight.
- ⚠️ **It is an ADDITION, not a retune** — the opposite call to the
  warning/error entry above, and for the opposite reason: those two roles are
  only ever fills, so moving them moved everything. Green is used as both, so
  the two uses need two values. `text/success` (the existing alias, no caller in
  the build) is the natural place for this if Figma would rather not add a name.
- The same shape as `text/on-data` vs `surface/data`: a surface token and the
  ink that is allowed to sit on it are two tokens, not one.

---

## 2. Needs a human decision — do not auto-fix

Measured failures that are **not** token corrections: fixing them moves a
surface, which is a design call. Deliberately left failing in the build.

### `gradient/brand` — REASSIGNED FROM SAGE TO INDIGO (`37:5`, `37:9`)

⚠️ **This entry changed shape on 8 Sep 2026. It is no longer a contrast failure
awaiting a decision — the decision was taken, and it is a token reassignment
Figma has not absorbed.**

- **Figma holds:** `#bbd3d9` → `#637073` — the sage button gradient.
- **The build uses:** `#657792` → `#39386f` — indigo, overridden in
  `globals.css` along with the `@property` initial values.

**Why it is a reassignment and not a retune.** Plotted in OKLCH, LUX runs two
families: sage is the ground (canvas 215, `surface/data` 199.8, `bg/nav` 196.8)
and indigo is the figure (`bg/brand`, 293.5 at the time, `gradient/brand-indigo` 280.8–290.8).
The old button sat at hue **213–215 with chroma 0.016–0.027** — in the ground
family, with the colour drained out of it, and it read on screen as a disabled
steel pill. The new value sits at hue **258 → 282, chroma 0.047 → 0.092**.

**What it closes.** The white label was the app's widest contrast failure. It
now clears AA across the whole sweep:

| | old | new |
| --- | --- | --- |
| left edge | 2.05:1 | **4.56:1** |
| first glyph | 2.52:1 | 5.62:1 |
| centre | 3.12:1 | 6.90:1 |
| last glyph | 3.99:1 | 8.59:1 |
| right edge | 5.13:1 | **10.66:1** |

**Why it does not re-open the rejected fix.** A passing sage gradient
(`#5f7275` → `#3c4b4e`) was built and rejected as too dark, because it read as a
flat slab rather than a sweep. This one holds a 24° hue rotation and nearly
doubles its chroma on the way down, so it still reads as a sweep. The earlier
rejection was about the *sage* ramp and stands.

**What Figma has to change with it.**

1. `gradient/brand`'s two stops → `#657792` and `#39386f`.
2. `button/bg-default-start` / `-end` → the same two, as they mirror it.
3. `gradient/brand-hover` → the same two reversed.
4. **The rule that `gradient/brand-indigo` is "for marks and accents only" is
   dead.** The primary button is indigo now; that note is on the `design.md`
   side (§4) and has to go with this change.

⚠️ **AND `bg/brand` MOVED WITH IT — a second, separate token change on the same
day.** The button's dark end is hue 282; `bg/brand` was `indigo/700` `#3b305c`
at 293.5. They appear together on `/progress` (the button beside the checked-in
calendar discs) and read as two violets. The build now sets `bg/brand` to
`#39386f`, the identical value, so the primary action and every "selected" mark
are one indigo.

| Token | Figma holds | The build uses | White |
| ----- | ----------- | -------------- | ----- |
| `bg/brand` | `indigo/700` `#3b305c` | `#39386f` | 11.91 → **10.66:1** |
| `bg/brand-hover` | `indigo/800` `#2e2447` | `#2c2a5f` | 14.39 → 13.10:1 |
| `bg/brand-soft` | *(no role — see section 3)* | `#8284c0` | 3.52 → 3.49:1 |

The two dependents follow the first so the family holds one hue; `-soft` in
particular has to, since it is the lighter half of a two-point likelihood scale
with `bg/brand` and two hues would break it.

⚠️ **CHANGE THE SEMANTIC TOKENS, NOT THE `indigo/700` PRIMITIVE.** Repointing the
ramp step would drag anything else aliasing it, and binding a component to a
primitive is forbidden anyway. Raise `bg/brand` and `bg/brand-hover` as direct
values, and `bg/brand-soft` as the new role section 3 already asks for.

⚠️ **`bg/brand-soft` STILL FAILS AA** at 3.49:1 for its 12px white label — the
same open question `CompatCard`'s band pills carry, moved by 0.03 and not
created by this change.

### `surface/data-deep` — the third System B step, still short of AA

⚠️ **NEW 8 Sep 2026, AND IT REPLACES THE "NESTED EMPHASIS BLOCK" ENTRY BELOW.**

- **Figma holds:** nothing. There is no `sage/700` and never was.
- **The build uses:** `#4f838f @85%`, declared on `:root` in `globals.css`, with
  a hover step `#588c98 @85%`.

Four surfaces were forcing white text onto sage and all four were failing:
`SymptomTrend`'s card, `ResultCards`' emphasis block, `CheckBasket`'s product
rows, `AddProductMethodSheet`'s method tiles — 1.64:1 to 2.32:1. They now share
one declared tier with one declared paired ink (`text/on-data-inverse`), which
lifts them to **3.42–3.77:1** depending on backdrop. Better by more than a point
and a half, and still under 4.5:1.

⚠️ **THE PART THAT NEEDS A HUMAN.** On the `surface/data` backdrop white
measures 3.71:1 and the app ink measures **3.73:1** — the surface sits almost
exactly where the two inks cross over, so *neither* passes and no ink choice
fixes it. Only the surface can move, and it has to move meaningfully:

- **darker** — an opaque `#407375` was built the same day and measures 5.35:1
  for white; it was not the value chosen;
- **lighter** — returns the ink to its usual 4.6:1+ and gives up the white.

`#4f838f @85%` is a chosen design value. **Do not nudge it toward a passing one
without asking** — the same standing instruction `gradient/brand` used to carry.

⚠️ **It is also 15° off the sage hue line** (214.1 against `surface/data`'s
199.8), so it reads cooler than the tier it nests in. Also chosen; also do not
"correct" it unasked.

Raise it in Figma as a real `sage/700` surface role, with the ink pairing
recorded beside it: deep sage takes white, `surface/data` takes the app ink, and
neither ink is portable to the other surface.

### Compatibility band pills — `Check results` `476:2841`

- Band colours and their white pill text: **2.03:1 to 4.24:1**. Same pill again
  on the check history screen.
- Either darken the bands or drop the white pill text.
- ⚠️ **The range moved on 8 Sep 2026 and its top end is now a FAILURE.** The
  two band tokens were retuned (§1 above): Risky rose 2.65 → 3.12:1 and Avoid
  fell 4.47 → 4.24:1, so the one band pill that used to clear AA no longer
  does. This widens the open question rather than adding a new one — both pills
  were always going to be decided together — but the entry can no longer be
  closed by fixing "the pink one".
- ⚠️ **AND IT PULLED IN A THIRD PILL — the confidence pill on
  `/investigation/analysis`.** `HypothesisCard` aliases `feedback/warning` but
  puts the app ink on it rather than white, which measured **5.22:1** and
  passed. On `#d47873` it is **4.43:1** — under AA for its 12px `t-label-sm`,
  by 0.07.
- Pinning that card to its own `#c9918e` was offered and **refused on 8 Sep
  2026**: the analysis pill is to be the same colour as the CHECK pills, since
  two warm pinks one step apart for two different meanings is what the retune
  was done to end. So this entry now covers three pills on two sections, and
  **only the FILL can close it** — the analysis card has already taken the
  better of the two available inks.

### The `Remove` action — `My Products` `581:1593`

- `text/error` as a `t-label` (14/20) destructive control on
  `ProductAccordionCard`, over `surface/frost-light` on the canvas gradient.
  Measured at three positions along it: **3.98 / 3.82 / 3.42:1** before the red
  moved, **3.77 / 3.62 / 3.25:1** after.
- ⚠️ **It never cleared 1.4.3's 4.5:1 at any position** — this is a
  pre-existing failure widened by roughly 0.2, listed here because § 1 now
  moves the token that causes it and the entry should not read as a new bug.
- ⚠️ **Do not close it by exempting `text/error` from the red.** Either every
  role above goes darker together, or the Remove action stops carrying its
  meaning in colour — it is the only destructive control on these screens and
  the word already says what it does.

### ~~Nested emphasis block — `Check results` `476:2841`~~ — SUPERSEDED

⚠️ Rolled into the `surface/data-deep` entry above on 8 Sep 2026. The block was
measured at 2.22:1 as a sage-inside-sage; it now takes the declared deep tier
and measures 3.71:1. Still failing, and now failing as one of four surfaces
rather than as a one-off, which is the whole reason the tier exists.

---

## 3. Components the design system does not have

Each is composed from tokens in Figma too, so the code is not inventing a
treatment — but there is no component to keep them in sync.

| Component | Note |
| --- | --- |
| **Data card** | The whole of Surface System B: `surface/data` + `surface/frosted-data` + `radius/2xl` + 20/24 padding, no stroke. Every Progress and Check card is composed from these. |
| **Modal tray** | `Bottom Sheet` (`255:91`) has no background blur and a fixed light content slot, so every tray in the file is hand-composed. |
| **Camera shutter** | Three capture surfaces now — selfie tray, products scan, check-in photo. Raise one Camera / Shutter component, then migrate all three at once. |
| **Search dropdown** | `Search Field` (`248:70`) has no results popup; the comps drew results as free-standing cards on a routed screen. |
| **Text input** | `Search Field` (`248:70`) is search-specific. The `other-input` on 02c/03a and the 03c date field are hand-composed in Figma too. |
| **Date picker** | The native popup is drawn by the browser and cannot be styled — no token reaches inside it. The DS has no calendar component either. |
| **Calendar (record)** | On the handoff's own missing list. **Not the same calendar as the date picker** — that one is Monday-first and interactive, this is Sunday-first and read-only. Both match their frames; raise the week-start split rather than merging them. |
| **Line chart** | On the handoff's missing list. Drawn from the data, not the comp's baked vector — the series is the card's whole content. |
| **Accordion** | No accordion component. Composed from the frosted card recipe, used in two places on two surfaces. |
| **Compat accordion** | The second accordion, different surface, different header, plus a band. The band drives pill, score and bar fill through one property so they cannot drift. |
| **Status pill** | Not `Tag` — Tag is Neutral/Brand only and these carry the feedback colours. |
| **Skin-profile strip** | The one sage element on a Check screen. Same System B recipe as the data card but an 86-tall strip with 18/20 padding. |
| **Face-region picker** | The region coordinates **are** the design — "Cheeks (L)" only means the left cheek because of where it sits. Stored as % of the 392×300 card so it scales. ⚠️ **The face is a CONTOUR DRAWING as of 13 Sep 2026, not the CSS dome** — white level lines cut from a supplied illustration (`features/my-skin/assets/face-contour.webp`, 226×280 at 83,10), over a shading layer masked to the head's outline (`face-silhouette.webp`: lighter centre, deep sage `#284a4d` toward the edge), with a pointer-following shine masked to the lines. ⚠️ **The lines are drawn clearer than the asset as of 14 Sep 2026** (asked for directly, twice): an SVG `feComponentTransfer` in `FaceDiagram.tsx` lifts each line pixel's alpha to its square root, because the asset is pure white and only its alpha has room to rise. A curve rather than a multiplier: the thin antialiased strokes are what read as unclear, and a square root lifts those most while leaving solid strokes solid (a 1.2× multiplier was tried first and was too faint to see). The shine is not brightened with them. The pills moved onto the drawing's own landmarks (see `REGIONS` in `FaceDiagram.tsx`). ⚠️ **The unselected region pills are frosted glass as of 14 Sep 2026** (asked for directly — a soft frosted glass button, gentle lighting, blurred background for depth, pill shape kept; then edges as soft shades rather than lines, a thinner fill and less blur. A near-white at 75% was tried first and read as one flat colour, and a version with a white hairline and 1px highlight crescents read as outlined; the final values were then tuned by hand in the browser, twice, and supplied): a pale aqua base `#d3ffff` 40%, a fill from white 30% at the top to indigo-grey `#919ebd` 43% at the bottom, a radial light clear at the top-left and gathering pale sage `#d2d9c7` 28% toward the far edges, and a pale sage tint `#d3e7e8` 27% over all of it, under `blur(4) saturate(170%)` so the lines behind stay visible; no drawn edge — a soft grey shade `#484d4e` 29% blurred inside the bottom-right, plus `shadow/sm`. Hover swaps the tint for a 14% white wash and `shadow/md`. `text/primary` holds 6.33:1 or better. Values under `surface/face-pill` in `globals.css`. The location chips under the face (`Whole face`, `Neck`, `Other`) wear the same glass when unselected (asked for directly), and the same hover as the regions: the white wash, `shadow/md` and the 30% `gradient/brand` ring. Selected, the regions and those chips are the same glass in INDIGO (asked for directly; `surface/face-pill-selected`): a `bg/brand` base at 60%, a fill from `gradient/brand`'s light end at 40% to `bg/brand-hover` 60%, `bg/brand-soft` light pooled at the top-left (20%), a `bg/brand` tint (15%), a `bg/brand-soft` light (35%) and a `bg/brand-hover` shade (90%) inside the edges — toned down from 50/45/80% to be less shiny, asked for directly — `shadow/button`, and the existing diagonal shade. The white label holds 5.67:1 or better. Every other selected `Chip` in the app stays flat indigo. The label stays `text/primary` and the selected pill stays indigo `bg/brand`. They were opaque `bg/frost-light-muted` only because the old dome's dark outline showed through a translucent fill. Raise the glass pill as a variant. Figma has no face artwork at all — raise the drawing, its shading and a note on the shine; the old `gradient/face-form` / `face-tier` tokens are deleted. |
| **`My skin` nav icon** | The nav's fourth glyph. `Bottom-Nav-Bar` (`410:258`) ships three and the DS has no face or skin mark anywhere. Stroke-drawn, unlike its three filled neighbours: a solid disc at 24 is far heavier, and the face only reads with the eyes and mouth left open. |
| **Product imagery** | No product or bottle icon exists outside the nav, so every thumb and image well drew a camera — which identifies nothing down a list. Nine vessel silhouettes by packaging type, tinted per brand. Raise a real illustration set. |
| **Check-in photo** | The photos card's entire content is a picture, so a camera glyph says "no photo" on the record of one the user took. Raise real imagery. |
| **Opaque sage** | `surface/data-strong` has no solid counterpart — see the token list. |
| **Reasoning accordion** | The THIRD accordion, and the first stacked into a group: § 08's six reasoning sections on `/investigation/analysis`. Composed from `ProductAccordionCard`'s recipe by way of `features/my-skin/components/Disclosure.tsx`, with a hairline between rows instead of a card each. Three accordions on three surfaces is now the strongest case in this file for one component — raise it and migrate all three. |
| **Hypothesis card** | The result card on `/investigation/analysis`: overline, headline, a confidence Tag, the products involved, then the accordion stack. Frosted light card, System A. ⚠️ **Deliberately carries NO score, no bar and no percentage** — unlike `CompatCard`, which is the same species of object answering a different question. Any Figma component for it must not grow one. |
| **Ranked list** | § 11's investigation-priority list: one card holding numbered rows, because the RANKING is the content and rows-as-cards would lose it. The ordinal is a small indigo disc, set as meta rather than as a metric — it is a position in a queue, not a score. |
| **Pass list** | `components/ui/PassList` — named steps ticking off with `SuccessCheckIcon` in a fixed-width slot, so the lines do not reflow as ticks land. **Both analysing screens use it now**: the analysis names § 06's six passes, and `Check — analyzing` (`605:2163`) names five. ⚠️ **The comp's 8px `analysis-bar` is no longer drawn** — a bar says only that something is happening, the list says what is being compared. The counts differ on purpose: CHECK has no timeline and no tolerated set, so it must not claim those passes. No frame draws any of this. |
| **Callout / notice** | The safety notice on `01 — Start investigation` is composed from the frosted-card recipe the frame's own deleted DISCLAIMER card used (`radius/lg`, `surface/frost-light`, hairline `border/subtle`, `t-overline` over body). There is no callout component and no ACCENT of any kind for one — the DS also has no warning glyph — `02 Icons` has 13 and none of them means caution — so the block carries its meaning by position and label alone. Raise a Notice component with a `feedback/warning` accent, and note the notice is CONDITIONAL: no frame draws it. |
| **Undo snackbar** | No toast, no snackbar, no transient message of any kind — the only trace of the idea is `--z-toast` (500), reserved in the token scale and unused until 8 Sep 2026. Drawn here as the `Bottom-Nav-Bar`'s own frosted pill (same fill, rim, shadow, blur and reduced-transparency fallback), because the file has exactly one recipe for something that floats over a screen. It departs on two content-driven values: **no fixed height** — a product name takes two lines at 380, more under a user's text-spacing overrides — and `radius/2xl` rather than `full`, since `full` on a two-line bar draws 26px lozenge ends that crowd the first and last words. Raise a `Snackbar` with a message slot and one action, sitting `nav-inset-bottom + size/nav-height + space/lg` above the bottom edge (the clearance every screen already reserves), and note on it that the dismiss is 6s, that it pauses while hovered or focused, and that only one is ever on screen. |

---

## 4. Frames and components that are stale

Where Figma and the build disagree and **Figma is the one that is wrong.**

### `Bottom-Nav-Bar` `410:258` — ships three items, needs four

`My skin` leads, then Progress, Check, Products. Without it the flow had no nav
item at all, so the question screens lit **Check** on all six — telling the user
they were in the compatibility check while they answered profile questions.

The 380 / 598 widths do **not** change and no breakpoint is added: the four
items sum to 267.1 against 352 of inner width at 440. They fit unclipped down to
a 344 viewport. A fifth item would exhaust that headroom.

### Option Row, `Size=Desktop` — is 58, not 56

The component notes say the Size property changes "only the label type". That is
wrong: the row hugs vertically (17 + label + 17), so `H6` at 24 gives 58 where
`Label` at 20 gives 56. Verified on the component set itself and on every desktop
frame in both sections.

### Chat bubble, desktop — `Body 1` (18/28), not `Body 2`

A one-line desktop bubble is 56 tall, not 54.

### `Button` `37:23` — needs `Size=Medium`, and the mobile action width

Two changes asked for directly on 13 Sep 2026, both code-side only so far:

- **A 48-tall size with a 15/22 label.** The set has one height. Six screens
  already draw a 48 secondary pill with a plus or a camera (`Take a photo`,
  `Add product`, `Add more products`, `Add another product` ×2, the tray's
  `Add product`), and every one kept the 62's label — so the shorter pill read
  as the louder one. Code: `Button size="md"` + `t-button-md` (15/22, i.e. the
  `Button` text style as Figma defines it). Raise `Size=Large/Medium` on the
  set; Large keeps the 17 the code ships (`t-button`), Medium takes `Button`.
- **Full-width actions stop at the nav's 380 on mobile**, not the 392 column,
  so the CTA and the nav pill share an edge. Code: `--width-action-mobile`,
  bound to `size/nav-width-mobile`. Desktop keeps `width/action` (376).

### Chip — no single-select variant exists

The daily check-in's five answers are a one-word ordinal scale where full-width
radio rows spent most of a mobile screen, so the code bends the Chip's role to
`radio` — a pill doing a job the contract gives to a circle. Raise a real
single-select Chip variant rather than widening the exception. `Timing` has
wanted the pill look since it was built and still uses radio rows.

### Chip — no disabled state (14 Sep 2026)

`162:74` draws no disabled state, and step 1 now needs one: while one symptom's
places are marked, every other symptom chip waits. The code takes the Button's
disabled recipe rather than inventing a pill-specific one — the whole pill at
`opacity/disabled` (0.4), selected or not — and lets a caller hold a disabled
pill at full strength (the face card does, for a marked `Neck` or `Other`
waiting on its next symptom). Raise `State=Disabled` on the set, selected and
unselected.

### `Check-in chat` `555:1268` — three problems

1. **Lights the wrong nav tab.** The handoff assigns it to CHECK and the frame
   lights that tab. But `Check — start` offers only "Start a check" and "View
   previous checks", so nothing in CHECK can reach this screen — while
   Progress's `Check in today` had no destination at all. And Check is the
   product *compatibility* check, which shares the word with a daily symptom
   report and nothing else. Shipped at `/progress/check-in`, nav `progress`.
   The frame also carries the old three-item nav. **Open question — settle it.**
2. **Draws `Save & exit` with no progress track.** That pair together is the
   investigation flow's signature. This is a daily action off a hub — no step
   id, not in the flow. One half of the pair alone is the frame contradicting
   the rule the rest of the file follows. **Open question.**
3. **Only the `better` branch of turn 2 is drawn.** The frame shows "Slightly
   better" picked, so it shows "That's good to hear!" and *Less redness / Less
   itching / Less dryness / No change*. The conditional is the frame's own —
   that reply cannot follow "Much worse", and "Less redness" cannot be what it
   offers. Draw the worse and same branches and confirm their copy.

### `Check — no profile` `606:2183` — no mobile frame

Desktop only. There is nothing to port at 440.

### The calendar's empty cells are 100-tall frames

Every **occupied** week row is **32**. The empty leading and trailing cells are
100-tall at both breakpoints, dragging mobile's week 1 to 39 and desktop's weeks
1 and 6 to 100. An auto-layout artefact of an empty frame — and the handoff
requires the breakpoints to be clones.

Consequence: the real desktop calendar card is **358** tall, not the comp's 494,
so column 1 ends higher above column 2 than the comp shows and the dashboard
grid had to be rebalanced.

### Two comp slips, deliberately not reproduced (`551:1196`, `552:1236`)

The comp marks Aug 14 as checked in while ringing Aug 11 as today; and its "57%"
does not match its own plotted points. The build clips check-ins at today and
computes the percentage.

### `Check-in detail` `556:1330` / `557:1353` — "Applied Morning & Night" has no data

The products-used row reads *"Moisturizer · Applied Morning & Night"*, which
needs a product category and a routine time. LUX stores neither. The build writes
the size and the date the product was added instead. Either add both fields to
the model or change the row.

### Page 06 carries zero Figma reactions

No prototype wiring anywhere, which is why the CHECK handoff had to write its
transition map out in prose.

### Figtree's figures are proportional; four roles need lining ones

⚠️ **NEW 8 Sep 2026. A code-side fix with a Figma-side consequence.** Figtree's
default figures are proportional — `1` is narrower than `0` — which is right for
running prose and wrong wherever LUX stacks digits. Four roles now set
`font-variant-numeric: tabular-nums` in code:

| Role | Where | What it fixed |
| ---- | ----- | ------------- |
| the calendar grid | `Check-in chat` calendar, `/progress` | the 11/21 column did not line up with the 30 below it |
| the chart axes | `Symptom Trend` | ticks are right-aligned into a fixed 20 and read as a scale |
| `Metric 1` / `Metric 2` | data-card figures | a metric that changes in place jittered |
| the compat score | `CompatCard`, `Check results`, history | 98% and 71% did not align on their own `%` |

Figma has no variable for this — it is an OpenType feature on the text style.
Either turn on lining/tabular figures for the `Metric 1`, `Metric 2` and
`Label Small` styles where they carry a grid, or note on the guide boards that
the code does it and the comps do not.

### Every heading balances and every paragraph avoids orphans

`text-wrap: balance` on the heading ramp, `text-wrap: pretty` on the prose ramp,
declared once in `globals.css` (8 Sep 2026). Figma has no property for either
and, more to the point, no NEED for one: a frame is a fixed 440 or 1440, so it
breaks a title wherever that width breaks it, while the build breaks it at the
reader's own width. Neither property changes a font-size, a line-height or a
measured width.

Nothing to fix in the file. Listed so a comp whose heading breaks 3 + 1 and a
build that breaks it 2 + 2 is not re-raised as drift — the build is right, and
the control classes (`Label`, `Label Small`, `Button`, `Button Small`,
`Overline`) are deliberately left alone so no measured pill can rewrap.

### Pressed exists on every action control, not just `Button`

Board 04b (389:200) states the pressed treatment — `state/pressed-overlay` at
14%, no scale transform — and the component sets carry no `State=Pressed`
variant, so the board is the only source. In the build it is now a shared
`.pressable` class (8 Sep 2026) worn by `Small Button`, both back chevrons, the
`Bottom-Nav-Bar` items, `Check history`'s rows, the checked-in calendar discs
and the add tray's method tiles.

For Figma: either add a `State=Pressed` variant to `Small Button` (225:60/61)
and `Bottom-Nav-Bar` (410:258), or note on 04b that the overlay is a state every
navigating control takes and that the sets do not draw it. The inline text links
(`View previous analyses`, the analysis's reminder link) are **not** covered —
they have no radius or padding, so the overlay reads as a highlighter box, and
what a pressed text link should look like is an open question for the file.

### Mobile frames pad 58 at the top; the build uses 40

40 is the value every other screen uses, and page-level whitespace is what
"translate, don't transcribe" covers. Listed so it is not re-raised as drift —
everything below it is pixel-exact.

---

## 5. Flow changes for Figma to absorb

Decided in the prototype, under the rule that **the prototype leads on flow and
Figma leads on pixels.** No matching frame yet; each is flagged
`⚠️ NOT IN FIGMA` in the code.

### `My skin` is a fourth nav section

Added first, because the other three all read what it collects. Its landing is
step 1 at `/investigation/start`, which stays a flow step — track, `Save & exit`
and back chevron all kept.

### Step 1 is titled *Create skin profile*

Not the frame's *Start investigation*. Four names for one place was the
confusion, and this string is not new copy — it is the label
`Check — no profile` (`606:2183`) already gives this exact destination. The frame
name is the odd one out.

### The flow now recaps the profile before it asks for products

⚠️ **NO FRAME AT ALL.** `/investigation/profile` sits between step 4 (Timing) and
step 5 (Your products) and reads back what steps 1–4 collected. Its one action,
`Add products`, continues to step 5.

**A pushed view, not a step** — no progress track, no `Save & exit`, back
chevron kept, so `TOTAL_STEPS` is still 5 and the track still reads 4/5 on
Timing and 5/5 on Products.

⚠️ **IT IS ONE BLOCK PER ANSWER, NOT A CARD OF `label: value` ROWS.** The rows
version existed for a few hours on 7 Sep 2026 and was rebuilt the same day: a
multi-select is a SET and wants pills, and a face region is a PLACE and wants
the diagram it was picked on. Almost nothing on it is drawn new even so — it is
assembled from recipes page 06 already holds:

| Block | Recipe borrowed from |
| ----- | -------------------- |
| skin type + tendencies + known conditions | the sage `DataCard` — Surface System B, as `Analysis`'s verdict — a `t-overline` heading over two labelled columns, then a full-width row; values at `t-button` (17), both multi-selects JOINED rather than pilled |
| symptoms | `Tag` (256:85), `Neutral`, **wearing `Chip`'s default fill and hairline** (see below), in a frosted light block (System A) |
| other locations | **inside `face-diagram-card`**, in step 1's own chip row, drawn as step 1's SELECTED `Chip` (40, `Label`, `bg/brand`) |
| where on the face | `face-diagram-card` from step 1, in a **read-only mode that Figma has no variant for** |
| the photo | its own block: `Check-in detail`'s photo well (`surface/data-strong`, `radius/lg`) + `CheckInPhotoArt`, with a `SmallButton` opening the existing `SelfieSheet` |
| all of step 4 | the *Current state* block (was *What you noticed*, with the symptom pills, until 13 Sep 2026) — `<status>` as its value, then `Started on` over `<date> · Day <n>` in the card's label-over-value shape; the pills are off the recap for now, moving onto the face diagram |
| the action | `Button` primary, full width mobile / `width/action` desktop |

⚠️ **ITS EMPTY STATE IS THE APP'S EMPTY-STATE RECIPE, AS OF 8 Sep 2026 —
NOTHING NEW TO DRAW.** The recap is reachable with nothing behind it: the flow's
answers expire after 24 hours, so a lapsed window, a different browser or a deep
link all land here. It renders orb → 32 → `t-h4-h3` title → 12 → body → 32 →
primary action, centred on bare gradient with no card, which is exactly what
`Progress — empty` and `Check — no profile` already draw.

It was the one empty state in the build NOT using that recipe — it had the
heading, two paragraphs and a bottom-pinned button, which left roughly 1000px of
canvas between them at 440. Fixed in code; Figma needs a frame for it only if
page 06 wants every state drawn, and if so it is an instance of the recipe, not
a new one. ⚠️ **It keeps its back chevron**, unlike the other two, which are hub
landings with nothing behind them.

**Two things on it have no Figma component at all**, and they are the real ask
of this section:

1. **A read-only face diagram.** Same contour face, same seven pills at the same
   coordinates, picked ones filled, the rest at 55% and without their lift —
   **and the same chip row under them**, as read-only pills rather than `Chip`
   controls **in their selected state**. In code it is one `readOnly` prop on the existing component; in
   Figma it wants a `State=Read-only` variant on `face-diagram-card` rather than
   a second frame, and the variant has to cover the chip row too.
2. **A component for a span of time.** ⚠️ **The recap no longer draws one** —
   it shipped a two-node rail (10px discs, `border/default` far and `bg/brand`
   near, a `border/subtle` hairline between; vertical at 440, horizontal at
   1440) and that was cut on 7 Sep 2026, asked for directly, in favour of two
   lines of text. The ASK survives the cut: PROGRESS, the analysis and this
   screen all state spans of time and none of the three draw them the same way.
   That is a DS gap whether or not the recap is the screen that needs it.
3. **A `Tag` variant carrying `Chip`'s ground.** Asked for directly on 7 Sep
   2026: the recap's pills take `bg/frost-light-muted` and a `border/chip`
   hairline — `Chip`'s default state — because `Tag`'s own `bg/surface-frost`
   with no stroke leaves an answer with no edge on a frosted block. Everything
   else stays `Tag`'s: 26 tall, `Label Small`, `text/secondary`. In code it is a
   class on this one screen, deliberately fenced (a tag dressed as a chip is
   only safe where there are no chips, and this screen has no controls at all).
   In Figma it wants a real third style on 256:85 — `Style=Outlined` or similar
   — so the borrowing stops being a local override.

**What Figma needs to decide:** whether the read-only face is a variant or a new
component; whether the timeline earns a real DS component (PROGRESS and the
analysis both have spans of time they currently draw differently); and whether
the label wording is right — *Current state* (was *What you noticed* until 13 Sep 2026), *Where you noticed it*,
*Known conditions* (was *Known skin conditions* until 13 Sep 2026), *Started on*, *Day n* and *Current state* are all decided
here. ⚠️ **They do not name the symptoms, and they were longer.** *Symptoms
started* / *Symptoms now* were right while step 4 had a block of its own among
four other answers; sitting under the pills that name the symptoms, the subject
is already on screen and repeating it made the block say "symptoms" three times
in four lines. ⚠️ **The last one was a bare *Now* until 8 Sep 2026** — beside
*Started*, an adverb with no noun read as another point on the same timeline
rather than as a different fact about a different moment.

**⚠️ It replaced step 4's direct hand-off to `/check/new`.** That route was
itself a prototype decision (6 Sep 2026, the first move of the CHECK/analysis
merge) and is listed below. The merge is not reverted — `/check/new` remains the
shared builder, reachable from CHECK — but the flow no longer leaves the
investigation to reach a products list, which restores the duration question
that the analysis depends on.

### The investigation ends in an ANALYSIS, and page 06 has no frames for it

⚠️ **The biggest gap in this file.** `/investigation/evidence`,
`/investigation/analyzing` and `/investigation/findings` — the culprit finder
from `docs/product-brief.md` §§ 05–12 — are built entirely in the prototype.
Page `06. Screen Designs` has no analysis or result frames outside CHECK, so
every measurement on all three screens is decided here.

They are **pushed views, not steps**: no progress track, no `Save & exit`, back
chevron kept. `TOTAL_STEPS` is still 5, and step 5's Continue now ends at
`/investigation/evidence` instead of the Products hub.

⚠️ **IT IS ONE SCREEN, NOT THREE.** It was drawn up as `evidence` → `analyzing`
→ `findings` and cut back a day later — three screens between step 5 and an
answer read as three more steps. Figma should draw the ONE screen and its
states, not the wizard.

What Figma needs to draw, at both breakpoints:

- **`Analysis — running`** — the orb `thinking` and the six named passes ticking
  through, INSIDE the page card. Not a bar and not its own frame; the
  transparency is the point and the wait is a state.
- **`Analysis — result`**, in **three outcomes**: a leading hypothesis, several
  that still fit, and **not enough evidence**. The third matters most — it is
  where most real runs land, and it is a designed answer rather than an error.
- Two conditional strips on the result: the ambiguous-product question (usually
  absent) and the "no cleanser in your list" reminder (a reminder, never a
  gate).

⚠️ **THE COLOUR IS PART OF THE SPEC AND IT IS CONSTRAINED BY MEASUREMENT.** The
verdict is a sage `DataCard` — one System B card on a screen of System A ones,
which is what makes the answer findable. Below it: a WARM stripe and pill on the
strongest hypothesis, GREEN on what the user's own history ruled out, grey on
what is weak. Composited over the real surfaces, `feedback/warning` is 1.24–2.36
and `feedback/success` is 1.84–3.50 — **neither can be a text colour anywhere on
this screen**, and white on `feedback/warning` is 2.65, the failure already
recorded against `CompatCard`'s band pills. So the accents are fills and stripes
with measured ink beside them. A Figma component for this must not undo that.

Four new components go with it; see § 3.

### Nine designed screens are five steps

*02b Skin tendencies* merged into *02a*; *03b Location* merged into *01* — one
screen each, with Continue gating on both answers. *03a Observable symptoms* was
dropped entirely. The track reads 1/5, not 1/8.

### Step 1's free-text `Other` asks WHERE, and its answer is stored (8 Sep 2026)

The field under the face diagram read `Other – describe in detail` over the
placeholder `Describe what's happening` — 01's question surviving on a screen
where the diagram above it and the recap that reads it back both ask about a
PLACE. It is `Other, describe where` over `Describe where you noticed it` now,
with `Other, describe where you noticed it` as the accessible name, and the en
dash is a comma (the app's copy carries no prose dashes).

For Figma this needs: the field drawn in both states on the merged step-1 frame
with the new strings, and — the part that has never been drawn — a state for the
FILLED field, since `/investigation/profile` now reads the answer back under
`Where you noticed it` as `Other, in your words` over the sentence. The
description was not in the answer store at all until this date; see
`docs/decisions.md`, "THE TYPED `Other` HAD NOWHERE TO GO".

⚠️ **As of 14 Sep 2026 the filled field has a third state to draw** — see the
confirmed description, two entries down.

### Step 1 asks where ONE SYMPTOM AT A TIME (14 Sep 2026)

The symptom chips and the face diagram were two independent multi-selects, so
step 1 could only say "these symptoms, somewhere in these places". Asked for
directly, the screen now pairs them:

- A line under the question: *For each symptom, select the affected areas in
  the face diagram.* (`t-body3-body2`, `text/secondary`, centred, 12 under the
  title.)
- A picked symptom chip is `bg/symptom` **#d3858a** with a white label, not
  indigo — the profile's symptom pill colour (asked for directly; white on it
  is 2.8:1). An unselected symptom's hover border is the same rose.
- Picking a symptom lights it and **disables every other symptom chip**; the
  seven region labels shine once, together (the app's text shine), and the face
  takes taps for that symptom only.
- The symptom chips sit under the face card (20 below it), not under the
  question, asked for directly. The safety notice moves with them. An
  unselected symptom chip is frosted: `#dbeded57` over an 8px backdrop blur,
  where `Chip` draws an opaque `bg/frost-light-muted`.
- Under the chips, 20 below them, sits one `Pattern / Segmented Toggle`
  (`75:23`, the products tray's `Add product` / `Search again` pill) with
  three commands: **`Save`** (filled), **`Reset`** and **`Reset all`**. It is
  drawn at 88% of the tray's size and lifted on `shadow/button`, which the
  tray's pill does not have. Each command fades to `opacity/disabled` while it
  has nothing to act on: `Save` and `Reset` until the symptom being placed has
  a place, and `Reset all` until anything is selected. A disabled `Save`
  keeps its indigo pill, dimmed with the rest of the segment. `Save` brings the other chips back with the symptom
  still selected. `Reset` clears the symptom's places and keeps it open.
  `Reset all` clears everything, and its undo shows over the pill for 4
  seconds. Tapping the lit chip deselects it; tapping a done chip reopens it.
  The toggle needs a three-option variant and a disabled segment in Figma.
- Between symptoms the face is disabled: marked places keep the selected
  treatment, and the rest sit at `opacity/disabled` × 1.3 (0.52, asked for
  directly — at 0.4 the glass pills faded into the face).

For Figma this needs: the merged step-1 frame in its three states (empty, a
symptom being placed with the other chips disabled and `Save` / `Reset`
awake in the pill, and idle
with places marked), a disabled Chip (§ 4) and a disabled region pill, and the
instruction line. Each symptom now carries its own places, which is the data
the recap's follow-up (symptom pills on the face) will draw.

### Step 1's saved symptoms are drawn on the face as callouts (14 Sep 2026)

Asked for directly, from a supplied anatomy reference. Once a symptom is
saved, the face shows it as a pill at the card's left or right edge, with a
thin line to each face region it was placed on. One pill per symptom. It sits
on the side its places lean to, and the pills down the middle fill whichever
side has fewer. Pills in one column stay 30 apart, in the 392×300 space. A
symptom with a place in the middle row that would send its line behind another
middle-row pill moves 50 off that row, so the line runs diagonally past it.
`Whole face` fans a line to every region. `Neck` draws to a rose dot on the
drawn neck, on the side its pill is on. `Other` gets no line. The
pill is the selected symptom chip (`bg/symptom`, white label, the diagonal
shade), scaled like the region pills: 18–24 tall, 8–12 type. The line is
`bg/symptom` at 1.25. The line draws out from the place over `duration/slower`,
then the pill fades in. The callouts hide while a symptom is being placed. For
Figma this needs the idle step-1 frame with callouts, plus the pill as a
variant. The recap's read-only face can take the same layer next.

### The face drawing has a neck (14 Sep 2026)

Asked for directly. The contour head used to stop in a hard cut under the
chin. The asset now runs 980 source rows, not 830. From row 740 down, the
contour lines and the silhouette both come from the same supplied
illustration, lined up with the head within half a pixel. The old asset had
faded its last rows toward the cut, so it is not used past row 740. Skin texture is removed, and line weight is
matched to the drawing above. The head's footprint on the card is unchanged
(226×280 at 83,10), so no region pill moves. The drawing, its shading and the
hover shine fade out over the neck, from 80% of the box's height to 98%. The
diagram takes a 30-unit bottom margin, so the chip row sits under the faded
tail. For Figma this needs the face artwork re-exported with its neck.

### PROGRESS's profile card shows the status and the latest photos, and its face shows callouts (14 Sep 2026)

Asked for directly. Three changes to `Progress — active` (`552:1236` /
`554:1252`), none of them in the frames:

- **`Current state` is step 4's status** (`Ongoing`, `Improving`, `Resolved` or
  `Getting worse`), in the card's label-over-value shape, with
  `Started <date> · Day <n>` under it. The rose symptom pills are gone from the
  card. The demo reads `Ongoing`.
- **The latest photos sit at the other end of that row.** A `Latest photos`
  label sits over the three newest check-in photos, each 36 square
  (`size/control-sm`) at `radius/md` with a white hairline edge, then a 36
  circle holding a chevron.
  The circle is the segmented toggle's frosted track, and it takes the indigo
  pill on hover. The whole row is one button, and it opens a **photo gallery**
  `Sheet`. The sheet has `Photo gallery` over a count, then every check-in photo
  newest first: three across on a phone and four in the desktop dialog. Each is
  a square `radius/lg` well with its date and `Day <n>` under it, and links to
  that day's `Check-in detail`.
- **The `Where you noticed it` face draws step 1's callouts.** These are the
  same symptom pills and leader lines as step 1, described above. The demo
  draws `Redness` and `Itching`, each with a line to both cheeks.

For Figma this needs both active frames updated with all three, the photo strip
as a component, and the gallery sheet at both breakpoints.

### Step 1's `Other` description is confirmed with ✓ and edited with a pen (14 Sep 2026)

Asked for directly. The open field carries a ✓ before its ✕ (Enter confirms,
Escape removes). A confirmed sentence becomes a frosted row, the collapsed
`Other, describe where` row's own recipe, holding the words, a pen that reopens
the field, and the ✕. All three controls are the field's existing 20px circle,
and both glyphs already exist in the icon set (`SuccessCheckIcon`, `NoteIcon`).
The circle's fill is no longer `surface/frost-light` but an opaque **`#c0d5da`**
(`bg/field-action`, declared in `globals.css`), and on hover its
`border/subtle` rim darkens to `border/chip` mixed 40% into that fill
(`#9eb7bb`) while the glyph goes `text/muted` → `text/secondary` — both asked
for directly. For Figma this needs
the new fill as a variable, the hover state, the confirmed-row state and the ✓
added to the open field.

### Step 1 carries a CONDITIONAL safety notice (`476:2542`, `476:2670`)

New block, and no frame draws it. Ticking `Swelling` or `Rash` — the only two
symptoms this screen collects that appear on the product brief's § 03E trigger
list — reveals a notice under the chip grid saying LUX cannot judge how serious
a reaction is, and to see a doctor or pharmacist if it is severe.

⚠️ **It does not interrupt the flow and does not gate Continue**, which is a
deliberate departure from the brief: § 03E asks for a full interrupt on nine
clinical triggers, and answering those would mean the app performing a triage.
The shipped block states LUX's limit and leaves the judgement to the reader
instead. See `features/my-skin/safety.ts` and `docs/decisions.md` § SAFETY.

For Figma this needs: the notice drawn on both frames in a `symptom = trigger`
state, and a decision on the accent it should carry (§ 3, *Callout / notice*).
The recipe is not new — it is the DISCLAIMER card `476:2542` already had at the
top of this stack, which the code cut in `f3edc75` when 01 and 03b merged and
has now reused. If Figma still draws that disclaimer, it is stale (§ 4).

### Selfie capture is a tray overlay, not a route (`487:834`, `490:1041`)

It was a routed step carrying a progress track while explicitly **sharing** step
1's number — so the track never moved when you reached it: a "step" on the main
line of a flow it was an optional side path off. Routing away also scrolled the
symptoms and face regions just picked out of sight. Same measurements, same
recipe; only the container changed.

### PRODUCTS: twelve screens became one screen and one tray

The design walked three time **periods** in sequence. What shipped from it was
broken four ways at once: the intro's three period rows all opened the tray
without setting a period, so everything filed under Long term; two of the three
promised periods were never drawn at either breakpoint; and Recent was
unreachable until you already owned a long-term product.

Now: add a product, say how long you have used it, the app sorts. That question
is the only input to the grouping, and it is asked with the product on screen —
because how long you have used something is a fact about that product, not a
mode you enter before searching.

### `Long-term products list` and its route are gone (`581:1593`, `583:1924`)

A pushed view whose whole content was a title, a count and the group's cards —
the first two of which the hub row already stated. Category rows are dropdowns
now and the cards open in place.

### "Not sure" is a fourth product group

With no period mode left to stand in, the fallback had nothing to read. Binning
it into Long term is the tempting fix and it is wrong: for a flare
investigation, "I don't know how long" is diagnostically different from
"months". Kept out of the three designed periods and appended only when
non-empty.

### The time window moved onto the hub rows (`579:1607`, `581:1593`)

Bucket is derived from duration by a strict 1:1, so every product inside a group
carries the **same** duration the page title is already naming. A "4+ weeks"
badge repeated down a screen headed "Long-term products" is noise that reads
like data, so it came off the cards — and moved to the hub, the only screen
where all three periods appear together and read as one scale.

Beside the name, never under it: measured 56 at both breakpoints, which a second
line would break.

### An expanded product card leads with *Added*, and opens its ingredients (`581:1593`)

The frame orders the details Brand, Size, Added — but brand and size are already
on the collapsed header, so the panel opened by restating the row that was just
tapped and buried the one fact only it carries. *Added* is also what the hub is
organised by.

A fourth row, Ingredients, is a nested disclosure: an INCI list is 15–25 terms,
which as a right-aligned value would push every other card in an open group off
the screen.

### CHECK: eight screens are five routes, and the basket stopped being modal

The design opens a scrim'd modal sheet over the search list the moment you add
your **first** product — CTA disabled, helper reading "Add at least 2 products".
The next thing you have to do is use the list underneath, which is why the
transition map has to say "Add another product returns focus to the search list",
and why *tray collapsed* exists at all: it is the escape hatch from a modal that
should not have been modal.

Adding is not a decision that needs confirming — it is the loop. The basket
lives in the docked bar now (`tray-bar`, `650:2513`): always visible, never
covering the list, counting up. The drawn sheet (`604:2103`) is still exactly
the drawn sheet, opened deliberately to review or remove. Every treatment is
used; only the resting state changed.

### `Check results` listed its products twice — the Edit tray is gone (`476:2841`, `476:2851`)

`compared-products` (`476:2851`) drew a header row with `Edit`, and the
transition map says Edit "reopens the tray" — `bottom-sheet` (`604:2103`), which
lists **the same products the five `analysis/…` cards below the row are already
listing**. One set, two lists, and the editable copy covered the copy carrying
the answers.

The row is the header of a BOX now and the cards are its contents, the same move
`My Products — filled` (`579:1607`) took for its category groups: fill on the
container, cards inset 8, `surface/frost-nav` rather than `frost-light` because a
frost-light box around frost-light cards has no edge. `analysis/…` needs a
COMPACT variant to match — padding 12, radius 8, opaque fill, no stroke —
alongside `product · …`'s, which is the same variant for the same reason.

`Edit` stays, as a MODE on the box rather than a door to the tray — it reveals a
✕ on each row and an `Add another product` row at the foot, neither of which is
there at rest. Its chevron goes: a disclosure glyph on a control that discloses
nothing made the header read as collapsing the list.

Adding opens a picker inside the box — a `Search Field` over `/check/new`'s own
search, listing results and nothing else. ⚠️ It deliberately does NOT open on a
list the way `/check/new` does: this panel opens from a check that is already
built, so the products the user owns are already in it and the remainder is a
column of things they have never mentioned.
⚠️ **Figma has no frame for the question this raises:** a check does not imply
ownership, so adding a product that is not already in the user's library asks
*"How long have you used <product>?"* — the same four `DURATIONS` radios the add
tray asks, since `bucketFor` derives the group from that answer and nothing
else — with `Not now` beside `Add to my products`. It needs a frame, and so does
the scoreless *Not analysed yet* row a just-added product renders as: editing
the set does not re-score the screen, so a product added since the check ran has
no percentage to show and must not borrow one.

### Step 5 is the one flow screen that does not light `My skin` (`574:1342`, `582:1612`)

It is still an investigation step in every other respect — track, `Save & exit`,
in the flow — but what it puts on screen is the products list the Products tab
owns, and the user is there to add products. Lighting `My skin` named the flow
while the screen plainly read Products.

---
---

## 6. Buttons — mostly already done in Figma

⚠️ **Correction.** An earlier draft of this section claimed Figma still held the
old hover and disabled treatments. It does not: `design.md` §7 records both
changed **in Figma** on 22 Aug 2026, along with `gradient/brand-hover`,
`gradient/secondary`, `gradient/secondary-hover`, `duration/hover` (400ms) and
the new `Style=Secondary, State=Hover` variant (`749:3338`). The stale source was
a code comment, now fixed.

**Figma and the build agree on all three states.** Only two deltas remain.

### The mechanism, for reference

Both styles paint `linear-gradient(90deg, <start> 0%, <end> 100%)`. Hover feeds
**the same two endpoints in the opposite order** — no new colour, and the pill
holds still.

| Style | Default | Hover |
| --- | --- | --- |
| Primary | `#657792` → `#39386f` | reversed |
| Secondary | `#deeff3` → `#b7c6ca` | reversed |

Disabled, both styles: the whole control at `opacity/disabled` **0.4**.

### Delta 1 — `gradient/brand` IS INDIGO NOW, AND BOTH STOPS MOVED

⚠️ **CHANGED 8 Sep 2026, AND THIS IS NO LONGER A ONE-STOP NUDGE.** The earlier
version of this delta said "change Figma to `#a2b9bf` and stop there". That is
stale: the token was reassigned from the sage family to the indigo one.

- **Figma holds:** `#bbd3d9` → `#637073`
- **The build uses:** `#657792` → `#39386f`

Both stops, plus `button/bg-default-start` / `-end` which mirror them, plus
`gradient/brand-hover` which is the pair reversed. The full reasoning and the
measured sweep are in section 2 — read that entry before changing Figma, because
it also retires `design.md` §4's rule that the indigo gradient is for marks and
accents only.

### Delta 2 — Secondary's 1px `border/default` — UNRESOLVED

- **Figma keeps the stroke.** With both styles now on gradients, it is what
  separates Secondary from Primary. Explicitly *not* a disabled marker.
- **The build draws no border at all**, on the reasoning that the app uses
  `border-width-hairline` nowhere.

Neither side is obviously right, and they should not disagree. **Decide this
one.** If the stroke stays, the build adds it; if it goes, Figma drops it and
Secondary is distinguished by its gradient alone.

### Two smaller things, from `design.md`'s own open list

- **No `State=Pressed` exists for any style.** The build follows motion board
  04b instead: `state/pressed-overlay` at full opacity, no transform.
- **`button/bg-secondary`** (white @86%) **is orphaned** since Secondary moved to
  a gradient. The build still carries it as a token nothing reads.
- **`Style=Ghost` is not implemented** in code — the component takes `primary`
  and `secondary` only. Its hover still points at the deleted `bg/accent-mint`;
  see section 1.

---

## 7. `chat-page / mobile` (270:96) — the conversation panel

Built at `/chat` on 4 Sep 2026 as a look-see, from the spec column `col`
(274:99) captioned "Mobile · 375". Nothing in the app links to it and nothing
reads what is typed into it. It is the only screen in the product that offers
free-text conversation, and it has no home yet — it is not one of the four nav
sections, which is why `features/chat/` exists against a rule that says there
are four.

**The frame is a PANEL, not a screen.** 375x538 with a 36 radius on all four
corners and its own gradient fill, where every other frame in the file is the
440x957 mobile canvas. The build treats it as a surface floating on the canvas,
which is also the only reading under which a kebab and a collapse chevron mean
anything.

### 7a. Nine values are off the published scales

Every one is drawn in the frame, reproduced in the build, and marked at its use
site in `features/chat/components/ChatScreen.module.css`.

| Value | Where | Nearest published | Do |
| ----- | ----- | ----------------- | -- |
| radius **36** | the panel | `3xl` 32 · `full` 999 | add `radius/4xl` |
| gap **6** | bubble → timestamp | `2xs` 2 · `xs` 4 | add `space/6`, or move the frame to 4 |
| glyph **18** | `more-vertical` | `icon/xs` 16 · `sm` 20 | move the frame to 16 |
| glyph **14** | `chevron-down` | `icon/xs` 16 | **superseded — see 7f**, the control is now a 16 close X |
| stroke **0.2** | the composer field | `hairline` 1 | move the frame to 1 — 0.2 is under a device pixel and Chrome rounds it to 1 anyway |
| text **11** | the `Today` label | `Label Small` 12/16 | build uses `t-label-sm`; move the frame to 12 |
| text **10** | both timestamps | `Label Small` 12/16 | build uses `t-label-sm`; move the frame to 12 |
| text **14/20** | both bubbles | `Body 2` 16/26 | see 7c |

### 7b. Four fills have no variable in `02 Color`

The frame paints them raw. All four are local custom properties in the module
rather than tokens, so none of them can be reused until Figma publishes them.

| Fill | Where | Nearest token | Raise as |
| ---- | ----- | ------------- | -------- |
| `linear-gradient(116.756deg, #dbebed 36.39%, #d1e1e5 53.77%, #c3cdd9 105.01%)` | the panel | `gradient/canvas-mobile` — close, but lighter top AND bottom, which is what separates the panel from the canvas under it | `gradient/chat-panel` |
| `#b5c8cc` | the date-divider hairlines | `border/subtle` #e2e4e8 and `border/default` #cbcdd4 are both neutral and read wrong on sage | `border/sage-subtle` |
| `#beced2` | the composer hairline | as above | `border/sage-hairline` |
| `#606d75` | the day label and both timestamps | between `text/secondary` #4b4b57 and `text/muted` #9a9aa5 | **move the frame to `text/secondary`** — see 7e |

### 7c. The bubble type contradicts the design system — the component won

The frame sets its bubble text at **14/20**. `Spec/Chat Bubble` (47:12) and all
nine GETTING STARTED frames set it at `Body 2` / `Body 1`, which is what
`t-body2-body1` is and what `ChatBubble` renders. Two Figma sources disagree;
the published component wins, because a chat bubble two steps smaller here than
everywhere else in the product is the drift, not the fix.

Everything else about the frame's bubbles — the 30/1 tail corners, `bg/bubble-ai`
and `bg/bubble-user`, the fill-plus-two-shadows recipe with no stroke — matches
the component exactly. **Move the frame to Body 2**, or say why this surface
is different.

### 7d. Two glyphs the design system does not have

Both are exported from the frame and live in `features/chat/components/icons.tsx`,
NOT in `components/ui/icons.tsx` — a glyph used by one section is that section's
until the DS publishes it. Adds to the list in section 3.

- **`more-vertical`** (270:102) — a stroked kebab. There is no overflow-menu
  glyph anywhere in `02 Icons`.
- **`send`** (270:120) — the white arrow on the composer's disc. The disc itself
  is `gradient/brand` on `radius/full` and is built as CSS, not as an image,
  because that is the button recipe.

  ⚠️ **The frame rotates the whole `Send` node 43°**, which is what turns a
  triangle drawn pointing up-and-right into one pointing along the field. The
  disc under it is a circle, so the rotation is invisible on everything except
  the path. **Draw the glyph at its final angle** and drop the transform.

### 7e. Two contrast failures, both measured

Hand-composited: the text is hidden, the surface underneath is screenshotted,
and the rendered pixel at the element's own position is read. Both fail; both
are reproduced as drawn rather than quietly darkened, because the frame is the
authority on colour and this file has already established the precedent of a
value that is chosen rather than accidental. ⚠️ **That precedent used to be
`#a2b9bf`, which no longer exists** — it is now `surface/data-deep`
`#4f838f @85%` (section 2). **Both need a Figma decision**
(section 2's list).

| Text | Ink | Behind it | Ratio | Needs |
| ---- | --- | --------- | ----- | ----- |
| composer placeholder + typed text | `text/on-brand` #ffffff | #b2c1c7 | **1.85:1** | 4.5:1 |
| `Today`, both timestamps | #606d75 | #dbebed / #d4e4e8 | **4.34:1** / **4.07:1** | 4.5:1 |

**The placeholder is the serious one.** `text/on-brand` on `#183036 @15%`
composites to #b2c1c7 over the panel gradient — at 1.85:1 the placeholder is
barely present, and TYPED text inherits the same colour, so this is not only a
placeholder problem. Either darken the field fill well past 15%, or ink the
text.

**The meta colour misses by a hair and has a clean fix.** #606d75 lands at
4.34:1 at the top of the panel and 4.07:1 lower down, where the gradient
darkens. The obvious substitution does not work — `text/muted` measures
**2.27:1 / 2.13:1** here, worse — but **`text/secondary` (#4b4b57) passes at
7.01:1 / 6.57:1** and is already the token for exactly this job. Moving the
frame onto it costs nothing and deletes one of the four fills in 7b.

### 7f. Two things the build decided, not Figma

- **The send disc has NO disabled state**, which is the one place it diverges
  from the button recipe. It was built gated, the way `Continue` is on all five
  flow steps — and `opacity/disabled` is 0.4, which on a sage disc over a sage
  panel is not a faded control but no control at all. The screen's resting state
  lost its only send affordance. The frame settles it by drawing a full-strength
  disc beside the empty placeholder; an empty submit is a no-op. **No Figma
  change needed** — logged so the next reader does not "fix" it back.
- **The close control is an X, not the frame's chevron-down** (5 Sep 2026). A
  chevron-down is a disclosure glyph: it says the panel folds away and can be
  unfolded. Pointed at a route change it promises a state the app cannot return
  you to, since nothing links back to `/chat`. An X says the thing goes away,
  which is what happens. It is the DS's own `CloseIcon`, so it also avoids a
  fourth chat-local glyph, and it puts the control on `size/icon-xs` (16),
  deleting one of the nine off-scale values in 7a. **Change the frame**, or say
  why the panel should read as foldable.
- **The kebab has no behaviour and is rendered `disabled`.** No flow anywhere
  defines what it opens. The chevron does have an obvious one — you collapse a
  panel — so it closes to Welcome. **Figma needs to say what the kebab is for,
  or the frame should drop it.**

### 7g. There is no desktop frame

The column is captioned "Mobile · 375" and nothing else in the file draws this
screen. Rather than invent a 1440 composition the panel keeps the size it was
drawn at and centres on the gradient — which is a decision to revisit the moment
a desktop frame exists.


## 8. Three light effects the build carries and Figma cannot draw (12 Sep 2026)

All three are asked-for prototype decisions after reactbits.dev references, and
all three are recorded beside their rules in `globals.css` ("Shine", "Specular
edge", "Beacon"). Figma has no way to express any of them — they are motion on
text and on a stroke — so this section exists so the next Figma pass knows they
are deliberate and not drift.

- **Every chat bubble's text shines once as the bubble lands** — a band of
  `bg/brand-soft` sweeping through the ink, 1200ms, then plain ink. The gradient
  is clipped to the glyphs; the bubble's own fill is untouched. `ChatBubble`
  wraps its children to do it; Welcome's two bubbles take their own delays.
- **Every `Button` and `SmallButton` label shines on hover**, and their rim
  carries a 2px **specular streak that turns to face the pointer**. The label
  wears `effect/shine`, a bright lilac bound on `:root` to `indigo/200`
  (#b4aad3); the rim wears `effect/specular` (#a1b2d0), the same lightness
  turned onto the button gradient's own hue with 20% less chroma, because the
  lilac read too purple on the edge — **two tokens Figma does not have yet;
  add both.** The first cut (13 Sep 2026)
  used the pill's own two gradient ends 30% brighter on a hairline and could
  not be seen on either pill. The ring is hidden at rest and on touch. `components/ui/specular.ts` writes the angle,
  which made both buttons client components.
- **Welcome's `Create skin profile` is the one `beacon`**: its gradient breathes
  between its default and its own hover reversal on a 4s cycle, and a band of
  the label's white at 25% crosses it every 10s. Colours unchanged. **No second
  caller** without a product decision — it means "start here".

**Nothing to change in Figma**; a note on the `Button` set and `Spec/Chat
Bubble` saying the build animates them would stop a later comp from being read
as a correction.
