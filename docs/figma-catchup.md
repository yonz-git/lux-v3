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
| **Reasoning accordion** | The THIRD accordion, and the first stacked into a group: § 08's six reasoning sections on `/investigation/analysis`. Composed from `ProductAccordionCard`'s recipe by way of `features/my-skin/components/Disclosure.tsx`, with a hairline between rows instead of a card each. Three accordions on three surfaces is now the strongest case in this file for one component — raise it and migrate all three. |
| **Hypothesis card** | The result card on `/investigation/analysis`: overline, headline, a confidence Tag, the products involved, then the accordion stack. Frosted light card, System A. ⚠️ **Deliberately carries NO score, no bar and no percentage** — unlike `CompatCard`, which is the same species of object answering a different question. Any Figma component for it must not grow one. |
| **Ranked list** | § 11's investigation-priority list: one card holding numbered rows, because the RANKING is the content and rows-as-cards would lose it. The ordinal is a small indigo disc, set as meta rather than as a metric — it is a position in a queue, not a score. |
| **Progress step list** | The analysis's running state names § 06's six passes and ticks them off, where `Check — analyzing` (`605:2163`) fills a bar. Uses `SuccessCheckIcon` in a fixed-width slot so the lines do not reflow as ticks land. No frame draws this. |
| **Callout / notice** | The safety notice on `01 — Start investigation` is composed from the frosted-card recipe the frame's own deleted DISCLAIMER card used (`radius/lg`, `surface/frost-light`, hairline `border/subtle`, `t-overline` over body). There is no callout component and no ACCENT of any kind for one — the DS also has no warning glyph — `02 Icons` has 13 and none of them means caution — so the block carries its meaning by position and label alone. Raise a Notice component with a `feedback/warning` accent, and note the notice is CONDITIONAL: no frame draws it. |

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
authority on colour and `#a2b9bf`-class values in this file have already been
established as chosen rather than accidental. **Both need a Figma decision**
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

