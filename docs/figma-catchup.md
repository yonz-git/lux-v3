# LUX — Figma catch-up

Changes the LUX Figma file needs so it matches what shipped.

- **File:** `wIftBhzkn8E4wjZwgdH71n`
- **Screens page:** `06. Screen Designs` (`453:2252`)
- **Sections built:** my-skin, products, progress, check · 17 routes

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

### `feedback/warning` and `feedback/error` share a hue

- They differ only in lightness, so as pill **fills** Risky and Avoid are not
  distinguishable — the pill's text is doing all the work.
- Separate the hues, or accept that the label is load-bearing and document it.

---

## 2. Needs a human decision — do not auto-fix

Measured failures that are **not** token corrections: fixing them moves a
surface, which is a design call. Deliberately left failing in the build.

### `gradient/brand` — the primary button label, on every screen (`37:5`, `37:9`)

- White label measures **2.05:1** at the left edge, **2.67:1** at the first
  glyph, **3.73:1** at the last. Against 4.5:1.
- Gradient runs `#a2b9bf` → `#637073`. A centred label sits across a
  light-to-dark sweep, so **no single ink colour clears both ends** — the
  surface has to move.
- Two rounds already: the fix that passes (`#5f7275` → `#3c4b4e`, 4.87:1 to
  9.10:1) was built and **rejected as too dark**. The start was then darkened
  one step by hand from `#bbd3d9` to `#a2b9bf`, which improves every figure by
  about half a point and still fails.
- **`#a2b9bf` is a chosen design value. Do not nudge it toward a passing one
  without asking.**

### Compatibility band pills — `Check results` `476:2841`

- Band colours and their white pill text: **2.03:1 to 4.47:1**. Same pill again
  on the check history screen.
- Either darken the bands or drop the white pill text.

### Nested emphasis block — `Check results` `476:2841`

- The sage-inside-sage block on the result cards: **2.22:1**.
- Needs either a darker ground or the dark ink the rest of System B now uses.

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
| **Face-region picker** | The region coordinates **are** the design — "Cheeks (L)" only means the left cheek because of where it sits. Stored as % of the 392×300 card so it scales. |
| **`My skin` nav icon** | The nav's fourth glyph. `Bottom-Nav-Bar` (`410:258`) ships three and the DS has no face or skin mark anywhere. Stroke-drawn, unlike its three filled neighbours: a solid disc at 24 is far heavier, and the face only reads with the eyes and mouth left open. |
| **Product imagery** | No product or bottle icon exists outside the nav, so every thumb and image well drew a camera — which identifies nothing down a list. Nine vessel silhouettes by packaging type, tinted per brand. Raise a real illustration set. |
| **Check-in photo** | The photos card's entire content is a picture, so a camera glyph says "no photo" on the record of one the user took. Raise real imagery. |
| **Opaque sage** | `surface/data-strong` has no solid counterpart — see the token list. |

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

### Chip — no single-select variant exists

The daily check-in's five answers are a one-word ordinal scale where full-width
radio rows spent most of a mobile screen, so the code bends the Chip's role to
`radio` — a pill doing a job the contract gives to a circle. Raise a real
single-select Chip variant rather than widening the exception. `Timing` has
wanted the pill look since it was built and still uses radio rows.

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

### Nine designed screens are five steps

*02b Skin tendencies* merged into *02a*; *03b Location* merged into *01* — one
screen each, with Continue gating on both answers. *03a Observable symptoms* was
dropped entirely. The track reads 1/5, not 1/8.

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
| Primary | `#a2b9bf` → `#637073` | reversed |
| Secondary | `#deeff3` → `#b7c6ca` | reversed |

Disabled, both styles: the whole control at `opacity/disabled` **0.4**.

### Delta 1 — `gradient/brand`'s start value

- **Figma holds:** `#bbd3d9`
- **The build uses:** `#a2b9bf` (overridden in `globals.css`)

One step darker, for the white label's contrast. **Change Figma to `#a2b9bf`
and stop there** — it still fails (2.05:1 at the left edge) and is a chosen value.
See section 2; do not carry it further toward a passing one.

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
